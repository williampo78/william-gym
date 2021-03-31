const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
  },
  gender: { type: String },
  birth: { type: Object },
  phone: {
    type: Number,
  },
  username: {
    type: String,
  },
});

userSchema.plugin(passportLocalMongoose); //一定要先plugin才能建立model
const User = mongoose.model("User", userSchema);

module.exports = User;
