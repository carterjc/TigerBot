const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		// the julie special
		const embed = new MessageEmbed()
			.setTitle('gort ded')
			.setImage('attachment://gort.jpg');
		if (interaction.user.id === '493180729358942226') return interaction.reply({ embeds: [embed], files: ['./data/gort.jpg'] });
		// regular command
		return interaction.reply('Pong!');
	},
};