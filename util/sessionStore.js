require("dotenv").config();
const session = require("express-session");
const mongodbStore = require("connect-mongodb-session")(session);

const mongodbUri = process.env.MONGO_URL;

const store = new mongodbStore({
  uri: mongodbUri,
  collection: "sessions",
});

module.exports = store;
