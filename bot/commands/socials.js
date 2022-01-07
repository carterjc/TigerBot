const { SlashCommandBuilder } = require('@discordjs/builders');
const { fetchMessageHistory } = require('../utils/fetchMessageHistory');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('socials')
		.setDescription('Find the public socials of other discord members')
		// https://discordjs.guide/interactions/replying-to-slash-commands.html#parsing-options
		.addMentionableOption(
			option => option
				.setName('user')
				.setDescription('User you want to view the socials of'),
		),
	async execute(interaction) {
		const mentionable = interaction.options.getMentionable('user');
		const socialsChannel = interaction.guild.channels.cache.find(channel => channel.name.includes('socials') && channel.type === 'GUILD_TEXT');

		// if there is no socials channel
		if (socialsChannel == null) {
			return interaction.reply({
				content: 'Oops, #socials channel not found',
				ephemeral: true,
			});
		}

		if (mentionable == null) {
			return interaction.reply({
				content: 'Please enter a user to view the socials of!',
				ephemeral: true,
			});
		}

		const messages = await fetchMessageHistory(socialsChannel);
		const userSocials = messages.find(m => m.author.id === mentionable.id);

		return interaction.reply({
			content: userSocials ? userSocials.content : 'no socials found :(',
			ephemeral: true,
		});
	},
};