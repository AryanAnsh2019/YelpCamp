const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const notificationSchema = require("./notifications");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  firstName: String,
  lastName: String,
  avatar: {
    url: String,
    filename: String,
  },
  bio: String,
  lastActive: {
    type: Date,
    default: Date.now(),
  },
  currentlyActive: {
    type: Boolean,
    default: false,
  },
  notifications: [
    {
      type: Schema.Types.ObjectId,
      ref: "Notification",
    },
  ],
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  isPaid: {
    type: Boolean,
    default: false,
  },
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
