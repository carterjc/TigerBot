module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		client.logger.log(`Ready! Logged in as ${client.user.tag}`, 'ready');
		client.logger.log(`Initialized on the following guilds: ${client.guilds.cache.map(guild => guild.name).join(', ')}`);
	},
};