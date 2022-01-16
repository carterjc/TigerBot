const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
	createEmbed: async function(interaction, fields, title, description, length = 5) {
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

		const canFitOnOnePage = fields.length <= length;

		// fetchReply makes it so embedMessage is not null
		const embedMessage = await interaction.reply({
			embeds: [await generateEmbed(0, fields, title, description, length)],
			components: canFitOnOnePage ? [] : [new MessageActionRow({ components: [forwardButton] })],
			fetchReply: true,
		});

		if (canFitOnOnePage) return;

		const collector = await embedMessage.createMessageComponentCollector({
			// not sure if this works (only the user who sent the interaction can press buttons)
			filter: ({ user }) => user.id === interaction.user.id,
			time: 30000,
		});

		let currentIndex = 0;

		collector.on('collect', async (i) => {
			// await i.deferUpdate();
			i.customId === backId ? (currentIndex -= length) : (currentIndex += length);
			// Respond to interaction by updating message with new embed
			await i.update({
				embeds: [await generateEmbed(currentIndex, fields, title, description, length)],
				components: [
					new MessageActionRow({
						components: [
							// back button if it isn't the start
							...(currentIndex ? [backButton] : []),
							// forward button if it isn't the end
							...(currentIndex + length < fields.length ? [forwardButton] : []),
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
 * @param {String} title title to be displayed on the embed
 * @param {String} description description to be displayed on the embed
 * @param {number} length number of fields per page
 * @returns {Promise<MessageEmbed>}
 */
const generateEmbed = async (start, fields, title, description, length) => {
	const current = fields.slice(start, start + length);

	if (fields.length > length) title += ` / ${start + 1}-${start + current.length} out of ${fields.length}`;

	return new MessageEmbed({
		color: 0x0099ff,
		title,
		description,
		fields: current,
		timestamp: new Date(),
	});
};
