const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

const emailAllowList = require('../data/emailAllowList.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('set')
		.setDescription('Set and configure your information')
		.addStringOption(option =>
			option
				.setName('email')
				.setDescription('Your Princeton email address')
				.setRequired(true),
		),
	async execute(interaction, client) {

		const email = interaction.options.getString('email');
		const emailDomain = email.split('@')[1];

		if (emailDomain == undefined) return await interaction.reply({ content: 'Please be sure to enter a valid email address', ephemeral: true });

		const dupEmail = await client.db.models.Users.findOne({ where: { email: email, verified: true } });

		if (dupEmail && dupEmail.email === email) return await interaction.reply({ content: 'You are already verified with this email!', ephemeral: true });
		if (dupEmail) return await interaction.reply({ content: 'This email is already used with a verified account. Please use another email', ephemeral: true });

		// school is an object with key:value mappings of keys
		// ex. { domain: "princeton.edu" }
		if (!Object.values(emailAllowList.universities).some(school => school.domain === emailDomain)) {
			return await interaction.reply({ content: `Sorry, the domain ${emailDomain} is not currently supported`, ephemeral: true });
		}

		// eslint-disable-next-line prefer-const
		let [user, created] = await client.db.models.Users.findOrCreate({
			where: { uid: interaction.user.id },
		});

		if (email === user.email) return await interaction.reply({ content: `Your email is already set to ${email}`, ephemeral: true });

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


		if (user.dataValues.email) {
			await interaction.reply({
				content: 'You currently have an associated email address, do you want to change it? If you are already verified, this will unverify you.',
				components: [row],
				ephemeral: true,
			});

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
					i.editReply({
						content: `You selected ${i.customId.toLowerCase()}. Email change cancelled.`,
						components: [],
						ephemeral: true,
					});
				}
				if (i.customId === 'Yes') {
					// update returns the number of rows affected
					// when changing email, unverify user

					// passes through user object with old email
					removeRoles(client, interaction, user);

					await client.db.models.Users.update({
						fName: null,
						lName: null,
						email: email,
						gradYear: null,
						verified: false,
						verifyEmailTime: null,
						verifyToken: null,
						verifyTokenTries: 0,
					}, { where: { uid: interaction.user.id } });

					user = await client.db.models.Users.findOne({ where: { uid: interaction.user.id } });
					if (user.email) {
						return await interaction.editReply({
							content: `Successfully set email address to ${user.email}. Be sure to verify yourself with /verify.`,
							components: [],
							ephemeral: true,
						});
					}
				}
				collector.stop();
			});

			collector.on('end', async collected => {
				if (collected.size === 0) {
					interaction.editReply({ content: 'You didn\'t select anything', components: [row], ephemeral: true });
				}
			});
		}
		// ran if user does not have an email already
		if (created) {
			// update returns the number of rows affected
			await client.db.models.Users.update({ email: email, verified: false }, { where: { uid: interaction.user.id } });

			user = await client.db.models.Users.findOne({ where: { uid: interaction.user.id } });

			if (user.email) return await interaction.reply({ content: `Successfully set email address to ${user.email}`, ephemeral: true });
		}
	},
};

async function removeRoles(client, interaction, user) {
	// to be called when user is unverified (ie changes their email after being verified)

	const verifiedRole = interaction.member.roles.cache.find(r => r.name === 'Verified');
	if (verifiedRole) {
		interaction.member.roles.remove(verifiedRole);
		client.logger.log(`Removed role ${verifiedRole.name} from user ${interaction.user.username}#${interaction.user.discriminator}`, 'log');
	}

	const emailDomain = user.email.split('@')[1];

	for (const school of Object.values(emailAllowList.universities)) {
		if (school.domain === emailDomain) {
			// check to see if user has the particular school role
			const schoolRole = interaction.member.roles.cache.find(r => r.name === school.role);

			if (schoolRole) {
				interaction.member.roles.remove(schoolRole);
				client.logger.log(`Removed role ${schoolRole.name} from user ${interaction.user.username}#${interaction.user.discriminator}`, 'log');
			}
		}
	}

	// remove grad year roles
	const filteredRoles = interaction.member.roles.cache.filter((r) => /^\d{2}$/.test(r.name));
	filteredRoles.forEach(r => {
		interaction.member.roles.remove(r);
		client.logger.log(`Removed role ${r.name} from user ${interaction.user.username}#${interaction.user.discriminator}`, 'log');
	});

	return;
}