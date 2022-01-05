const { SlashCommandBuilder } = require('@discordjs/builders');
const { Collection } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('socials')
		.setDescription('Replies with Pong!')
		// https://discordjs.guide/interactions/replying-to-slash-commands.html#parsing-options
		.addMentionableOption(
			option => option
				.setName('user')
				.setDescription('User you want to view the socials of'),
		),
	async execute(interaction) {
		const mentionable = interaction.options.getMentionable('user');

		const socialsChannel = interaction.guild.channels.cache.find(channel => channel.name.includes('general') && channel.type === 'GUILD_TEXT');
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

		// console.log(socialsChannel.messages.cache.find(m => m));
		// console.log(socialsChannel.messages)
		// socialsChannel.messages.fetch({ limit: 100 }).then(messages => {
		// 	console.log(`Received ${messages.size} messages`);
		// 	// Iterate through the messages here with the variable "messages".
		// 	messages.forEach(message => console.log(message.content));
		// });
		// console.log(socialsChannel.messages.cache.size);
		// console.log(await socialsChannel.messages.fetch('928131300546719745'));

		console.log(res);

		return interaction.reply({
			content: res,
			ephemeral: true,
		});
	},
};

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
