module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(client, interaction) {
		// if (!interaction.isCommand()) return;
		const command = client.commands.get(interaction.commandName);
		if (!command) return;
		try {
			const args = interaction.options.data && interaction.options.data[0];
			client.logger
				.log(
					`User ${interaction.user.username}#${interaction.user.discriminator} ` +
					`has run the command /${interaction.commandName} ` +
					// ex. user:TigerBot-test#7770 or degree:ab
					`${args ?
						`${args.name}:${args.type === 'MENTIONABLE' ? `${args.user.username}#${args.user.discriminator}` : args.value} `
						: ''
					}` +
					`on guild ${interaction.guild.name}`,
				);
			await command.execute(interaction);
		}
		catch (error) {
			client.logger.log(error, 'error');
			return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	},
};