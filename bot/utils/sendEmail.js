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

		try {
			await sgMail.send(msg);
			client.logger.log(`Email sent to ${to} from ${from}: ${text ? text : 'used template ' + templateId}`, 'log');

			// return null if nothing is wrong (can change later)
			return null;

		}
		catch (error) {
			const res = { 'message': error.response.body.errors[0].message, 'statusCode': error.code };
			client.logger.log(res.message, 'error');

			return res;
		}
	},
};