const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminShema = new Schema ({
    email: String,
    password: String
});

const admin = mongoose.model("admin", adminShema);

module.exports = admin;