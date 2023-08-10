const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    userType: String, // Manufacturer or Transporter
    address: String
});

const User = mongoose.model('User', UserSchema);

module.exports = {
    User:User
 };
 