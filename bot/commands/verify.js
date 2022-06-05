const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

const { sendEmail } = require('../utils/sendEmail');
const emailAllowList = require('../data/emailAllowList.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.setDescription('Verify your email address')
		.addStringOption(option =>
			option
				.setName('token')
				.setDescription('Enter your verification token'),
		),
	async execute(interaction, client) {

		const token = interaction.options.getString('token');
		const user = await client.db.models.Users.findOne({ where: { uid: interaction.user.id } });


		if (!user || !user.email) return await interaction.reply('Be sure to set an email first!');

		// if user is already verified, bounce them
		if (user.verified) return await interaction.reply('You are already verified!');

		if (token && user.verifyToken) {
			if (user.verifyTokenTries >= 3) {
				await client.db.models.Users.update({ verifyTokenTries: 0, verifyToken: null }, { where: { uid: interaction.user.id } });
				// log user who went over retry limit
				client.logger.log(`User ${interaction.user.username}#${interaction.user.discriminator} exceed token verification retries`, 'warn');
				return await interaction.reply('Too many verification attempts. Please request a new code.');
			}
			if (token === user.verifyToken) {
				await client.db.models.Users.update({ verified: true }, { where: { uid: interaction.user.id } });
				// log successful verification
				client.logger.log(`User ${interaction.user.username}#${interaction.user.discriminator} was successfully verified`, 'log');
				addRoles(client, interaction, user);
				return await interaction.reply('Successfully verified');
			}
			else {
				await client.db.models.Users.increment('verifyTokenTries', { by: 1, where: { uid: interaction.user.id } });
				return await interaction.reply('Incorrect token');
			}
		}

		// if user already has a verification token, see how long it has been since the email was sent
		if (user.verifyEmailTime) {
			const emailTimeElapsed = Date.now() - user.verifyEmailTime;
			// if it has been at least 5 minutes
			if (emailTimeElapsed > 5 * 60 * 1000) {

				const row = new MessageActionRow()
					.addComponents(
						new MessageButton()
							.setCustomId('Yes')
							.setLabel('Yes')
							.setStyle('PRIMARY'),
						new MessageButton()
							.setCustomId('No')
							.setLabel('No')
							.setStyle('PRIMARY'),
					);

				await interaction.reply({ content: 'Do you want to resend your verification email?', components: [row] });

				const collector = interaction.channel.createMessageComponentCollector({
					componentType: 'BUTTON',
					max: 1,
					time: 15000,
				});

				// disables all buttons
				for (const component in row.components) {
					row.components[component].setDisabled(true);
				}

				collector.on('collect', async i => {
					await i.deferUpdate();
					if (i.customId === 'No') {
						await i.editReply({ content: 'Verification email was not resent', components: [] });
					}
					if (i.customId === 'Yes') {
						const res = sendVerificationEmail(client, interaction, user);
						if (!res) {
							await i.editReply({ content: 'There was an issue sending the verification email. Please try again later', components: [] });
						}
						else {
							await i.editReply({ content: `Verification email was sent to ${user.email}`, components: [] });
						}
					}
					collector.stop();
				});

				collector.on('end', async collected => {
					if (collected.size === 0) {
						await interaction.editReply({ content: 'You didn\'t select anything', components: [row] });
					}
				});
			}
			// if it hasn't been 5 minutes
			else {
				return await interaction.reply('Please wait a little longer before resending the verification email');
			}
		}
		else {
			const res = sendVerificationEmail(client, interaction, user);
			if (!res) {
				return await interaction.reply('There was an issue sending the verification email. Please try again later');
			}
			else {
				return await interaction.reply(`Email sent to ${user.email}!`);
			}
		}
	},
};


async function sendVerificationEmail(client, interaction, user) {
	// if user does not have a verification token, generate one from 100000-999999
	const token = Math.floor(Math.random() * 999999) + 100000;
	await client.db.models.Users.update({ verifyToken: token, verifyEmailTime: Date.now(), verifyTokenTries: 0 }, { where: { uid: interaction.user.id } });

	let res = null;

	res = sendEmail(
		user.email,
		'princeton.tigerbot@gmail.com',
		'Discord Verification Code from TigerBot',
		`Your verification token is: ${token}`,
		`Your verification token is: ${token}`,
		client,
	);

	// res is null is there is an error like a rate limit, etc
	return res;
}

async function addRoles(client, interaction, user) {
	// to be called when user is successfully verified
	const emailDomain = user.email.split('@')[1];

	for (const school of Object.values(emailAllowList.universities)) {
		if (school.domain === emailDomain) {
			const schoolRole = interaction.guild.roles.cache.find(r => r.name === school.role);
			const verifiedRole = interaction.guild.roles.cache.find(r => r.name === 'Verified');
			if (!schoolRole) {
				client.logger.log(`Role ${school.role} not found`, 'error');
				return;
			}
			if (!verifiedRole) {
				client.logger.log('Verified role not found', 'error');
				return;
			}

			interaction.member.roles.add(schoolRole);
			client.logger.log(`Added role ${schoolRole.name} to user ${interaction.user.username}#${interaction.user.discriminator}`, 'log');

			interaction.member.roles.add(verifiedRole);
			client.logger.log(`Added role ${verifiedRole.name} to user ${interaction.user.username}#${interaction.user.discriminator}`, 'log');

			return;
		}
	}
}

// /verify
// do u have verify code
// no --> create code, send email
// yes --> see if time since email is > 5 minutes, then button for resend

// /verify code:xyz
// correct --> verified
// incorrect --> check if > 3 tries, if above three tries, say you can retry verification (/verify)