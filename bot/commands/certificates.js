const { SlashCommandBuilder } = require('@discordjs/builders');
const { createEmbed } = require('../utils/createEmbed');
const certificates = require('../data/certificates.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('certificates')
		.setDescription('Displays Princeton\'s academic certificates!'),
	async execute(interaction) {
		// parse json and create fields array
		const fieldsList = [];
		Object.entries(certificates).forEach(([key, value]) => {
			fieldsList.push({
				name: key,
				value: `\n[Find out more here!](${value})`,
			});
		});

		createEmbed(
			interaction,
			fieldsList,
			'Princeton University Certificates',
			'Academic certificates offered at Princeton University',
			10,
		);
	},
};