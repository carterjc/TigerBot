const { SlashCommandBuilder } = require('@discordjs/builders');
const { createEmbed } = require('../utils/createEmbed');
const concentrations = require('../../data/concentrations.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('concentrations')
		.setDescription('Displays Princeton\'s academic concentrations!'),
	async execute(interaction) {
		// parse json and create fields array
		const fieldsList = [];
		Object.entries(concentrations).forEach(([key, value]) => {
			fieldsList.push({
				name: `${key} (${value.degree.toUpperCase().split('').join('.')})`,
				value: value.description + `\n[Find out more here!](${value.link})`,
			});
		});

		createEmbed(
			interaction,
			fieldsList,
			'Princeton University Concentrations',
			'Academic concentrations offered at Princeton University',
		);
	},
};