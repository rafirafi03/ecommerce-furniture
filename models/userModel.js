const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  mobile: {
    type: Number,
    required: true
  },
  verified: {
    type:Boolean,
    default: false,
  },
  isAdmin: {
    type: Number,
    default: 0,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  wallet: {
    type : Number,
  },
  walletHistory : [{
    date : {
      type : Date
    },
    amount : {
      type : Number
    }
  }]

});

const user = mongoose.model("user", UserSchema);

module.exports = user;
