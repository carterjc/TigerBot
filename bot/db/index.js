const { Sequelize } = require('sequelize');
const fs = require('fs');

module.exports = client => {

	const sequelize = new Sequelize('database', 'user', 'password', {
		host: 'localhost',
		dialect: 'sqlite',
		logging: false,
		// SQLite only
		storage: 'database.sqlite',
	});

	const models = fs.readdirSync(`${process.cwd()}/db/models`)
		.filter(filename => filename.endsWith('.model.js'));

	for (const model of models) {
		require(`./models/${model}`)(sequelize);
	}

	sequelize.sync({ alter: false });
	client.logger.log('Synced all sequelize models', 'log');

	return sequelize;
};
