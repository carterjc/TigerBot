const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		if (interaction.user.id === '493180729358942226') return interaction.reply('do this again and gort gets it');
		return interaction.reply('Pong!');
	},
};