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

		if (emailDomain == undefined) return await interaction.reply('Please be sure to enter a valid email address');

		// school is an object with key:value mappings of keys
		// ex. { domain: "princeton.edu" }
		for (const school of Object.values(emailAllowList.universities)) {
			if (emailDomain !== school.domain) return await interaction.reply(`Sorry, the domain ${emailDomain} is not currently supported`);

		}

		// eslint-disable-next-line prefer-const
		let [user, created] = await client.db.models.Users.findOrCreate({
			where: { uid: interaction.user.id },
		});

		if (email === user.email) return await interaction.reply(`Your email is already set to ${email}`);

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
			await interaction.reply({ content: 'You currently have an associated email address, do you want to change it?', components: [row] });

			const collector = interaction.channel.createMessageComponentCollector({
				componentType: 'BUTTON',
				max: 1,
				time: 15000,
			});

			// disables all buttons
			for (const component in row.components) {
				row.components[component].setDisabled(true);
			}

			// cartercostic@princeton.edu
			collector.on('collect', async i => {
				await i.deferUpdate();
				if (i.customId === 'No') {
					i.editReply({ content: `You selected ${i.customId.toLowerCase()}. Email change cancelled.`, components: [] });
				}
				if (i.customId === 'Yes') {
					// update returns the number of rows affected
					// when changing email, unverify user
					await client.db.models.Users.update({ email: email, verified: false, verifyEmailTime: null, verifyToken: null, verifyTokenTries: 0 }, { where: { uid: interaction.user.id } });
					user = await client.db.models.Users.findOne({ where: { uid: interaction.user.id } });
					if (user.email) return await interaction.editReply({ content: `Successfully set email address to ${user.email}`, components: [] });
				}
				collector.stop();
			});

			collector.on('end', async collected => {
				if (collected.size === 0) {
					interaction.editReply({ content: 'You didn\'t select anything', components: [row] });
				}
			});
		}
		// ran if user does not have an email already
		if (created) {
			// update returns the number of rows affected
			await client.db.models.Users.update({ email: email, verified: false }, { where: { uid: interaction.user.id } });

			user = await client.db.models.Users.findOne({ where: { uid: interaction.user.id } });

			if (user.email) return await interaction.reply(`Successfully set email address to ${user.email}`);
		}
	},
};