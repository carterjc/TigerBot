const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

const { sendEmail } = require('../utils/sendEmail');
const { ptonAdvancedSearch } = require('../utils/advancedSearch');
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


		if (!user || !user.email) return await interaction.reply({ content: 'Be sure to set an email first!', ephemeral: true });

		// if user is already verified, bounce them
		if (user.verified) return await interaction.reply({ content: 'You are already verified!', ephemeral: true });

		if (token && user.verifyToken) {
			if (user.verifyTokenTries >= 3) {
				await client.db.models.Users.update({ verifyTokenTries: 0, verifyToken: null }, { where: { uid: interaction.user.id } });
				// log user who went over retry limit
				client.logger.log(`User ${interaction.user.username}#${interaction.user.discriminator} exceed token verification retries`, 'warn');
				return await interaction.reply({ content: 'Too many verification attempts. Please request a new code.', ephemeral: true });
			}
			if (token === user.verifyToken) {
				await client.db.models.Users.update({ verified: true, verifyEmailTime: null, verifyToken: null, verifyTokenTries: 0 }, { where: { uid: interaction.user.id } });
				// log successful verification
				client.logger.log(`User ${interaction.user.username}#${interaction.user.discriminator} was successfully verified`, 'log');

				const userInfo = await ptonAdvancedSearch(client, user.email);

				if (!userInfo) client.logger.log(`Error adding name and grad year to user ${interaction.user.username}#${interaction.user.discriminator}`, 'error');

				// add fName, lName, and gradYear to user
				await client.db.models.Users.update(userInfo, { where: { uid: interaction.user.id } });
				const updatedUser = await client.db.models.Users.findOne({ where: { uid: interaction.user.id } });

				addRoles(client, interaction, updatedUser);

				return await interaction.reply({ content: 'Successfully verified', ephemeral: true });
			}
			else {
				await client.db.models.Users.increment('verifyTokenTries', { by: 1, where: { uid: interaction.user.id } });
				return await interaction.reply({ content: 'Incorrect token', ephemeral: true });
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

				await interaction.reply({ content: 'Do you want to resend your verification email?', components: [row], ephemeral: true });

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
						await i.editReply({ content: 'Verification email was not resent', components: [], ephemeral: true });
					}
					if (i.customId === 'Yes') {
						// check if a verified account exists with this email
						const dupEmail = await client.db.models.Users.findOne({ where: { email: user.email, verified: true } });
						if (dupEmail) return await interaction.reply({ content: 'This email is already used with a verified account. Please use another email', ephemeral: true });

						const res = sendVerificationEmail(client, interaction, user);
						if (!res) {
							await i.editReply({ content: 'There was an issue sending the verification email. Please try again later', components: [], ephemeral: true });
						}
						else {
							await i.editReply({ content: `Verification email was sent to ${user.email}`, components: [], ephemeral: true });
						}
					}
					collector.stop();
				});

				collector.on('end', async collected => {
					if (collected.size === 0) {
						await interaction.editReply({ content: 'You didn\'t select anything', components: [row], ephemeral: true });
					}
				});
			}
			// if it hasn't been 5 minutes
			else {
				return await interaction.reply({ content: 'Please wait a little longer before resending the verification email', ephemeral: true });
			}
		}
		else {
			// check if a verified account exists with this email
			const dupEmail = await client.db.models.Users.findOne({ where: { email: user.email, verified: true } });
			if (dupEmail) return await interaction.reply({ content: 'This email is already used with a verified account. Please use another email', ephemeral: true });

			const res = sendVerificationEmail(client, interaction, user);
			if (!res) {
				return await interaction.reply({ content: 'There was an issue sending the verification email. Please try again later', ephemeral: true });
			}
			else {
				return await interaction.reply({ content: `Email sent to ${user.email}!`, ephemeral: true });
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

	if (!user.verified) return;

	// add verified role
	const verifiedRole = interaction.guild.roles.cache.find(r => r.name === 'Verified');
	if (!verifiedRole) {
		client.logger.log('Verified role not found', 'error');
		return;
	}
	interaction.member.roles.add(verifiedRole);
	client.logger.log(`Added role ${verifiedRole.name} to user ${interaction.user.username}#${interaction.user.discriminator}`, 'log');


	const emailDomain = user.email.split('@')[1];

	// add school roles
	for (const school of Object.values(emailAllowList.universities)) {
		if (school.domain === emailDomain) {
			const schoolRole = interaction.guild.roles.cache.find(r => r.name === school.role);
			if (!schoolRole) {
				client.logger.log(`Role ${school.role} not found`, 'error');
				return;
			}

			interaction.member.roles.add(schoolRole);
			client.logger.log(`Added role ${schoolRole.name} to user ${interaction.user.username}#${interaction.user.discriminator}`, 'log');
		}
	}

	// if no grad year, don't try to add role
	if (!user.gradYear) return;

	// add grad year roles
	const gradYear = user.gradYear.toString().slice(-2);
	const gradYearRole = interaction.guild.roles.cache.find(r => r.name === gradYear);
	if (!gradYearRole) {
		client.logger.log(`Grad year ${gradYearRole} role not found`, 'error');
		return;
	}
	interaction.member.roles.add(gradYearRole);
	client.logger.log(`Added role ${gradYearRole.name} to user ${interaction.user.username}#${interaction.user.discriminator}`, 'log');

	return;
}

// /verify
// do u have verify code
// no --> create code, send email
// yes --> see if time since email is > 5 minutes, then button for resend

// /verify code:xyz
// correct --> verified
// incorrect --> check if > 3 tries, if above three tries, say you can retry verification (/verify)