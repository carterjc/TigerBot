module.exports = {
	postgres: {
		dialect: 'postgres',
		name: 'PostgreSQL',
		packages: ['pg', 'pg-hstore'],
	},
	postgresql: {
		dialect: 'postgres',
		name: 'PostgreSQL',
		packages: ['pg', 'pg-hstore'],
	},
	sqlite: {
		dialect: 'sqlite',
		name: 'SQLite',
		packages: ['sqlite3'],
	},
};