const { Sequelize } = require('sequelize');
const fs = require('fs');
const types = require('./dialects');

// dialects file was an idea taken from https://github.com/discord-tickets/bot/blob/main/src/database/index.js
// in practice, we should only be using postgres or sqlite

// above example is a really amazing db setup flow, so boiler was taken from it

module.exports = async client => {

	const {
		DB_TYPE,
		DB_HOST,
		DB_PORT,
		DB_USER,
		DB_PASS,
		DB_NAME,
	} = process.env;

	// defaults type to sqlite
	const type = (DB_TYPE || 'sqlite').toLowerCase();

	const supported = Object.keys(types);
	if (!supported.includes(type)) {
		client.logger.log(`DB_TYPE (${type}) is not a valid type`, 'error');
		return process.exit();
	}

	let sequelize;

	if (type === 'sqlite') {
		client.logger.log('Using SQLite storage', 'log');

		sequelize = new Sequelize({
			dialect: 'sqlite',
			logging: false,
			storage: 'database.sqlite',
		});
	}
	else {
		client.logger.log(`Connecting to ${types[type].name} database...`, 'log');

		sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
			dialect: types[type].dialect,
			host: DB_HOST,
			logging: false,
			port: DB_PORT,
		});
	}

	try {
		await sequelize.authenticate();
		client.logger.log('Connected to database successfully', 'log');
	}
	catch (error) {
		client.logger.log('Failed to connect to database', 'warn');
		client.logger.log(error, 'error');
		return process.exit();
	}

	const models = fs.readdirSync(`${process.cwd()}/db/models`)
		.filter(filename => filename.endsWith('.model.js'));

	for (const model of models) {
		require(`./models/${model}`)(sequelize);
	}

	await sequelize.sync({ alter: false });
	client.logger.log('Synced all sequelize models', 'log');

	return sequelize;
};
