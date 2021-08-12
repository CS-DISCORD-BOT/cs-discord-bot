require("dotenv").config();
const Sequelize = require("sequelize");
const password = process.env.POSTGRES_PASSWORD;

let username = process.env.POSTGRES_USERNAME;
if (!username) {
  username = "postgres";
}

const sequelize = new Sequelize("postgres", username, password, {
  dialect: "postgres",
  host: process.env.DB_HOST || "localhost",
  logging: false,
});

const Invites = require("./models/Invites")(sequelize, Sequelize.DataTypes);
const Groups = require("./models/Groups")(sequelize, Sequelize.DataTypes);
const Course = require("./models/Course")(sequelize, Sequelize.DataTypes);

sequelize.sync();

module.exports = { Invites, Groups, Course, sequelize };
