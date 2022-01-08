const fs = require('fs');

module.exports = (client) => {
	const commandFiles = fs.readdirSync(`${process.cwd()}/bot/commands`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		// relative path wouldn't work for some reason
		const command = require(`${process.cwd()}/bot/commands/${file}`);
		if (command.data) {
			client.commands.set(command.data.name, command);
		}
	}
};
