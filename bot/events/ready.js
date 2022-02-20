const { generateMessages } = require('../utils/birthdays');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {

		// iterate over each guild and generate birthday messages
		client.guilds.cache.forEach(async g => {
			await generateMessages(g, client);
		});


		client.logger.log(`Ready! Logged in as ${client.user.tag}`, 'ready');
		client.logger.log(`Initialized on the following guilds: ${client.guilds.cache.map(guild => guild.name).join(', ')}`);
	},
};