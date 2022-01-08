// const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
require('dotenv').config();

// create a new client instance
const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
	],
});

client.commands = new Collection();

['commands', 'events'].forEach(handler => {
	require(`./handlers/${handler}`)(client);
});

// console.log('\x1b[1m\x1b[35m' + 'Running in \x1b[32mhi \x1b[0m');

client.login(process.env.DISCORD_TOKEN);