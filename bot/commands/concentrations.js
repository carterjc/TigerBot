const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const concentrations = require('../../data/concentrations.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('concentrations')
		.setDescription('Displays Princeton\'s academic concentrations!'),
	async execute(interaction) {
		const backId = 'back';
		const forwardId = 'forward';
		const backButton = new MessageButton({
			style: 'SECONDARY',
			label: 'Back',
			emoji: '⬅️',
			customId: backId,
		});
		const forwardButton = new MessageButton({
			style: 'SECONDARY',
			label: 'Forward',
			emoji: '➡️',
			customId: forwardId,
		});

		// parse json and create fields
		const concList = [];
		Object.entries(concentrations).forEach(([key, value]) => {
			concList.push({
				name: `${key} (${value.degree.toUpperCase().split('').join('.')})`,
				value: value.description + `\n[Find out more here!](${value.link})`,
			});
		});

		const canFitOnOnePage = concList.length <= 5;
		const embedMessage = await interaction.reply({
			embeds: [await generateEmbed(0, concList)],
			components: canFitOnOnePage ? [] : [new MessageActionRow({ components: [forwardButton] })],
			fetchReply: true,
		});
		if (canFitOnOnePage) return;

		const collector = await embedMessage.createMessageComponentCollector({
			// not sure if this works (only the user who sent the interaction can press buttons)
			filter: ({ user }) => user.id === interaction.user.id,
			time: 30000,
		});

		// const collector = await embedMessage.createMessageComponentCollector({
		// 	time: 30000,
		// });
		let currentIndex = 0;

		collector.on('collect', async (i) => {
			// await i.deferUpdate();
			// Increase/decrease index
			i.customId === backId ? (currentIndex -= 5) : (currentIndex += 5);
			// Respond to interaction by updating message with new embed
			await i.update({
				embeds: [await generateEmbed(currentIndex, concList)],
				components: [
					new MessageActionRow({
						components: [
							// back button if it isn't the start
							...(currentIndex ? [backButton] : []),
							// forward button if it isn't the end
							...(currentIndex + 5 < concList.length ? [forwardButton] : []),
						],
					}),
				],
			});
		});
	},
};

/**
 * @param {number} start The index to start from.
 * @param {Array} fields fields to be displayed
 * @returns {Promise<MessageEmbed>}
 */
const generateEmbed = async (start, fields) => {
	const current = fields.slice(start, start + 5);

	return new MessageEmbed({
		color: 0x0099ff,
		title: `Showing Princeton University Concentrations ${start + 1}-${start + current.length} out of ${fields.length}`,
		description: 'Academic concentrations offered at Princeton University',
		fields: current,
		timestamp: new Date(),
	});
};
