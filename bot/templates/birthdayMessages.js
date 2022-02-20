// replace * with the person's name
const weekMessages = [
	// 'A little birdy told me that *\'s birthday is in a week!🥳',
	'I can\'t believe it - *\'s birthday this week!🎉🎉🎉',
];

const dayMessages = [
	'It\'s *\'s big day tomorrow!🥳',
	// '(One more day, * 🎊🎊)',
];

const todayMessages = [
	'HAPPY BIRTHDAY *',
];

// BUG
// for the time being, only one message format will be allowed
// with multiple, many messages may be sent bc of randomization. fix tbd

module.exports = { weekMessages, dayMessages, todayMessages };

// 🎉
// 🥳
// 🎈
// 🎊