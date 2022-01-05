const { SlashCommandBuilder } = require('@discordjs/builders');
const { Collection } = require('discord.js');


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

		const res = await retrieveUserSocial(socialsChannel, mentionable);

		return interaction.reply({
			content: res,
			ephemeral: true,
		});
	},
};

// as of now, this function necessitates administrator permissions (not sure of a workaround yet)
const retrieveUserSocial = async (channel, user) => {
	let sum_messages = new Collection;
	let last_id;

	// note the order will be from earliest to latest
	while (sum_messages.size % 100 === 0) {
		const options = { limit: 100 };
		if (last_id) options.before = last_id;

		const messages = await channel.messages.fetch(options);
		sum_messages = sum_messages.concat(messages);
		last_id = messages.last().id;
	}

	// oldest to latest
	const oldest_messages = sum_messages.reverse();
	const userSocials = oldest_messages.find(m => m.author.id === user.id);


	return userSocials ? userSocials.content : 'no socials found :(';
};
