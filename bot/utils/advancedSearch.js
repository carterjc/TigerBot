const axios = require('axios');
const { parse } = require('node-html-parser');

module.exports = {
	ptonAdvancedSearch: async function(client, email) {
		let url = `https://www.princeton.edu/search/people-advanced?e=${email}&ef=eq`;

		try {
			let res = await axios.get(url);
			let root = parse(res.data);

			// see if email returns no result (may happen if user created an alias but didn't enter it here)
			const noResult = root.querySelector('#block-tony-content > p');
			if (noResult) {
				const netId = email.match(/(\w{2}\d{4})/)[0];
				url = `https://www.princeton.edu/search/people-advanced?i=${netId}&if=eq`;
				res = await axios.get(url);
				root = parse(res.data);
			}

			const gradElement = root.querySelector('#block-tony-content > div > div > div > div.people-search-result-department.columns.small-12.medium-6.large-3');
			const gradYear = gradElement.childNodes[0]._rawText.trim().match(/\d{4}$/g)[0];

			const nameElement = root.querySelector('#block-tony-content > div > div > div > div.people-search-result-name.columns.small-11.large-3.toggleparent');
			const fName = nameElement.childNodes[1].childNodes[0]._rawText.split(', ')[1].split(' ')[0];
			const lName = nameElement.childNodes[1].childNodes[0]._rawText.split(', ')[0];

			client.logger.log(`Queried ${url}: ${email} is associated with grad year ${gradYear} and name ${fName} ${lName}`, 'log');

			return { 'fName': fName, 'lName': lName, 'gradYear': gradYear };
		}
		catch (err) {
			client.logger.log(`Error with Princeton advanced search query: ${err}`, 'error');
			return null;
		}
	},
};
