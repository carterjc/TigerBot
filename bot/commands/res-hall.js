const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

const housing = require('../data/housing.json');

module.exports = {
	data: new SlashCommandBuilder()
		// is this name approachable enough?
		.setName('res-halls')
		.setDescription('Display information about Princeton\'s residential halls!')
		.addStringOption(option =>
			option
				.setName('hall')
				.setDescription('Get information about a specific residential hall')
				.addChoice('Butler', 'Butler')
				.addChoice('First', 'First')
				.addChoice('Forbes', 'Forbes')
				.addChoice('Mathey', 'Mathey')
				.addChoice('Rockefeller', 'Rockefeller')
				.addChoice('Whitman', 'Whitman'),
		),
	async execute(interaction) {
		const resHall = interaction.options.getString('hall');

		const hallNames = Object.keys(housing);
		let embed;
		const max_length = 900;

		// if parameter is passed through, return specific information for the res hall
		if (resHall !== '' && resHall !== null && hallNames.includes(resHall)) {
			embed = new MessageEmbed({
				color: 0x0099ff,
				image: {
					url: housing[resHall].image,
				},
				title: `${resHall} Residential Hall`,
				description: `View information about ${resHall}`,
				fields: [{
					name: 'Description',
					value: ((
						housing[resHall].description.length > max_length
							?
							housing[resHall].description.substring(0, max_length) + '...'
							:
							housing[resHall].description
					) + `\n\n[Find out more here!](${housing[resHall].r_url})`),
				}],
				timestamp: new Date(),
			});
		}
		else {
			embed = new MessageEmbed({
				color: 0x0099ff,
				title: 'Princeton\'s Residential Halls',
				description: 'View a list of residential halls and some corresponding information',
				fields: [{
					name: 'Res Halls',
					value: Object.keys(housing).join('\n'),
				}],
				timestamp: new Date(),
			});
		}

		return interaction.reply({ embeds: [embed] });
	},
};