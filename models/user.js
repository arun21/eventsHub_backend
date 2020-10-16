const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  countryCode: String
});

module.exports = mongoose.model("user", userSchema, "users");
