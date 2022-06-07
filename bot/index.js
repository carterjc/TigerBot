const { Client, Collection, Intents } = require('discord.js');
const { logger } = require('./utils/logger');
require('dotenv').config();

// can switch to larger class based model in the future
// class Bot extends Client, etc

// create a new client instance
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
	],
});
(async () => {
	client.commands = new Collection();
	client.logger = logger;
	client.db = await require('./db')(client);

	['commands', 'events'].forEach(handler => {
		require(`./handlers/${handler}`)(client);
	});

	client.login(process.env.DISCORD_TOKEN);
})();
