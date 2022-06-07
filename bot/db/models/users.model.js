const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {

	// sequelize.STRING has character cap, sequelize.TEXT does not

	sequelize.define('Users', {
		uid: DataTypes.STRING,
		fName: DataTypes.TEXT,
		lName: DataTypes.TEXT,
		nickname: DataTypes.TEXT,
		gradYear: DataTypes.INTEGER,
		email: DataTypes.STRING,
		birthday: DataTypes.DATEONLY,
		verified: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		verifyToken: DataTypes.STRING,
		verifyTokenTries: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
		},
		verifyEmailTime: DataTypes.DATE,
	});
};