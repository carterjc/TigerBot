// sends messages to a guild from a list of messages
// input: guild, msg arr, channel name

module.exports = {
	sendMessages: async function(guild, client, messages, channelName, repeats = false) {
		// finds channel in guild if exists
		// name in pton server is tiger-bot
		const announcementsChannel = guild.channels.cache.find(channel => channel.name.includes(channelName) && channel.type === 'GUILD_TEXT');
		if (!announcementsChannel) return;

		// checking the last 50 messages *should* be enough, announcements should be sparse
		const announcementsHistory = await announcementsChannel.messages.fetch({ limit: 50 });

		messages.forEach(msg => {
			let duplicate = false;
			announcementsHistory.forEach(m => {
				// if message is the same and it was sent over a year ago, don't send again
				if (m.content === msg && new Date(new Date().getTime() - m.createdTimestamp) / (1000 * 60 * 60 * 24 * 365) < 1) duplicate = true;
			});
			if (repeats || !duplicate) {
				announcementsChannel.send(msg);
				client.logger.log(`Message "${msg}" sent on [${guild.name}] in channel #${channelName}`);
			}
		});
	},
};