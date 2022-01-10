const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
// instead of importing client which has some weird side effects, just import the logger class directory
const { logger } = require('./utils/logger');
require('dotenv').config();

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

if (process.env.ENV === 'prod') {
	// global commands take an hour to cache, guild commands are updated instantly
	// applicationCommands(CLIENT_ID) v. applicationGuildCommands(CLIENT_ID, GUILD_ID)
	(async () => {
		try {
			logger.log('Started refreshing application (/) commands.', 'log');

			await rest.put(
				Routes.applicationCommands(process.env.CLIENT_ID),
				{ body: commands },
			);

			logger.log('Successfully reloaded application (/) commands.', 'log');
		}
		catch (error) {
			logger.log(error, 'error');
		}
	})();
}
// for dev
else {
	// only makes commands available in one guild (good for development) - updated instantly
	rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands })
		.then(() => logger.log('Successfully registered application commands.', 'log'))
		.catch(console.error);
}