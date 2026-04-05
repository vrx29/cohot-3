const mongoose = require("mongoose");
require("dotenv").config();

try {
  mongoose.connect(process.env.MONGODB_URI, {
    dbName: "paytm-db",
  });
  console.log("Connected to DB...");
} catch (error) {
  console.log(error);
}

const UserSchema = mongoose.Schema({
  email: { type: String, unique: true, required: true },
  userName: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
});

const AccountSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 5000,
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", UserSchema);
const Account = mongoose.model("Account", AccountSchema);

module.exports = {
  User,
};
