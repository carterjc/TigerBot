const { Client, Collection, Intents } = require('discord.js');
const { logger } = require('./utils/logger');
require('dotenv').config();

// Create a new client instance
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
	],
});

client.commands = new Collection();
client.logger = logger;

['commands', 'events'].forEach(handler => {
	require(`./handlers/${handler}`)(client);
});

client.login(process.env.DISCORD_TOKEN);
