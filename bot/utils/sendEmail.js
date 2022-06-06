const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
	sendEmail: async function({ to, from, subject, text, html, templateId, dynamicTemplateData, client }) {

		let msg;
		if (templateId && dynamicTemplateData) {
			msg = {
				to,
				from,
				templateId,
				dynamicTemplateData,
			};
		}
		else {
			msg = {
				to,
				from,
				subject,
				text,
				html,
			};
		}

		let res = null;

		sgMail
			.send(msg)
			.then(() => {
				client.logger.log(`Email sent to ${to} from ${from}: ${text ? text : 'used template ' + templateId}`, 'log');
			})
			.catch((error) => {
				client.logger.log(error, 'error');
				res = error;
			});

		return res;
	},
};