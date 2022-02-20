const { SlashCommandBuilder } = require('@discordjs/builders');
// const { fetchMessageHistory } = require('../utils/fetchMessageHistory');
const { parseBirthdays } = require('../utils/birthdays');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('birthdays')
		.setDescription('Find the birthday of other discord members')
		// https://discordjs.guide/interactions/replying-to-slash-commands.html#parsing-options
		.addMentionableOption(option =>
			option
				.setName('user')
				.setDescription('User you want to view the birthday of')
				.setRequired(true),
		),
	async execute(interaction) {
		const mentionable = interaction.options.getMentionable('user');
		const birthdaysChannel = interaction.guild.channels.cache.find(channel => channel.name.includes('birthdays') && channel.type === 'GUILD_TEXT');

		// if there is no socials channel
		if (birthdaysChannel == null) {
			return interaction.reply({
				content: 'Oops, #birthdays channel not found',
				ephemeral: true,
			});
		}

		if (mentionable == null) {
			return interaction.reply({
				content: 'Please enter a user to view the birthday of!',
				ephemeral: true,
			});
		}

		const messages = await parseBirthdays(interaction.guild);
		const userBirthday = messages.find(m => m.person.id === mentionable.id);

		// make date readable
		const components = userBirthday.birthday.split('/');
		const options = { year: 'numeric', month: 'long', day: 'numeric' };
		const birthday = new Date(components[2], components[1] - 1, components[0]);
		const readable = `${birthday.toLocaleDateString('en-US', options)} (${getAge(birthday)} years old)`;

		return interaction.reply({
			content: readable ? readable : 'no birthday found :(',
			ephemeral: true,
		});
	},
};

function getAge(date) {
	const today = new Date();
	let age = today.getFullYear() - date.getFullYear();
	const m = today.getMonth() - date.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
		age--;
	}
	return age;
}