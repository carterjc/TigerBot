const { fetchMessageHistory } = require('./fetchMessageHistory');
const { sendMessages } = require('./sendMessages');
const { weekMessages, dayMessages, todayMessages } = require('../templates/birthdayMessages');

module.exports = {

	// critera for messages/announcements
	// close birthday is a week away
	// birthday tomorrow
	// birthday is today
	generateMessages: async function(guild, client) {
		// don't get why i can't reference directly, but this works
		const data = await module.exports.parseBirthdays(guild);
		const messages = [];

		let components;

		function createMessage(arr, bday) {
			messages.push(arr[Math.floor(Math.random() * arr.length)].replaceAll('*', bday.person.serverName));
		}

		data.forEach(bday => {
			components = bday.birthday.split('/');
			// no Math.abs because we only want upcoming bdays
			const dist = Math.ceil(
				(new Date(new Date().getFullYear(), components[1] - 1, components[0]) - new Date()) / (1000 * 60 * 60 * 24),
			);

			if (dist === 7) {
				createMessage(weekMessages, bday);
			}
			else if (dist === 1) {
				createMessage(dayMessages, bday);
			}
			// somehow got -0 from the difference
			else if (Math.abs(dist) === 0) {
				createMessage(todayMessages, bday);
			}

		});

		sendMessages(guild, client, messages, 'tiger-bot');
	},
	parseBirthdays: async function(guild) {
		const birthdaysChannel = guild.channels.cache.find(channel => channel.name.includes('birthdays') && channel.type === 'GUILD_TEXT');
		const birthdayMessages = await fetchMessageHistory(birthdaysChannel);

		const data = [];

		for (const msg of birthdayMessages.values()) {
			if (parseDate(msg.content)) {
				data.push(
					{
						birthday: parseDate(msg.content),
						person: await parsePerson(msg),
					},
				);
			}
		}

		return data;
	},
};

// dd/mm/yyyy format
function parseDate(str) {
	const re = /(((0[1-9]|[12][0-9]|3[01])([/])(0[13578]|10|12)([/])(\d{4}))|(([0][1-9]|[12][0-9]|30)([/])(0[469]|11)([/])(\d{4}))|((0[1-9]|1[0-9]|2[0-8])([/])(02)([/])(\d{4}))|((29)(\/)(02)([/])([02468][048]00))|((29)([/])(02)([/])([13579][26]00))|((29)([/])(02)([/])([0-9][0-9][0][48]))|((29)([/])(02)([/])([0-9][0-9][2468][048]))|((29)([/])(02)([/])([0-9][0-9][13579][26])))/;
	const m = str.match(re);
	return m[0];
}

async function parsePerson(msg) {
	const author = await msg.guild.members.fetch(msg.author.id);

	return msg.content.split(':').length > 1 ?
		{
			serverName: msg.content.split(':')[0],
			discordName: null,
			id: null,
		} :
		{
			serverName: author.nickname,
			discordName: `${msg.author.username}#${msg.author.discriminator}`,
			id: msg.author.id,
		};
}