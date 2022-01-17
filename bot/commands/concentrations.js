const { SlashCommandBuilder } = require('@discordjs/builders');
const { createEmbed } = require('../utils/createEmbed');
const concentrations = require('../data/concentrations.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('concentrations')
		.setDescription('Displays Princeton\'s academic concentrations!')
		.addStringOption(option =>
			option
				.setName('degree')
				.setDescription('Filter results by degree type')
				// p1 is what the user sees, idk what p2 does (addChoice)
				.addChoice('ab', 'ab')
				.addChoice('bse', 'bse'),
		),
	async execute(interaction) {
		const degreeType = interaction.options.getString('degree');
		// parse json and create fields array
		const fieldsList = [];
		Object.entries(concentrations)
			// eslint-disable-next-line no-unused-vars
			.filter(([key, value]) => {
				return degreeType ? value.degree === degreeType : value.degree;
			})
			.forEach(([key, value]) => {
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