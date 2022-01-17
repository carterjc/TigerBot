module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(client, interaction) {
		// if (!interaction.isCommand()) return;
		const command = client.commands.get(interaction.commandName);
		if (!command) return;
		try {
			// if user runs a command with arguments
			const args = interaction.options.data[0].value;
			client.logger.log(`User ${interaction.user.username} has run the command /${interaction.commandName} ${args ? `with args '${args}'` : ''} on guild ${interaction.guild.name}`);
			await command.execute(interaction);
		}
		catch (error) {
			client.logger.log(error, 'error');
			return interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	},
};