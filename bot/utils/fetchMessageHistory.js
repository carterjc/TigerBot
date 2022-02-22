const { Collection } = require('discord.js');

module.exports = {
	// returns a Collection with messages form oldest to latest
	fetchMessageHistory: async function(channel) {
		let sum_messages = new Collection;
		let last_id;

		// note the order will be from earliest to latest
		// as of now, this function necessitates administrator permissions (not sure of a workaround yet)
		while (sum_messages.size % 100 === 0) {
			const options = { limit: 100 };
			if (last_id) options.before = last_id;

			const messages = await channel.messages.fetch(options);
			if (messages.size === 0) break;
			sum_messages = sum_messages.concat(messages);
			last_id = messages.last().id;
		}

		return sum_messages.reverse();
	},
};