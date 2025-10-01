const { Schema, model } = require("mongoose");

const { createHmac, randomBytes } = require("crypto");
const { CreateTokenOFUser } = require("../Auth");
const { type } = require("os");
  const loginsecret = process.env.loginSecret
const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },

    password: {
      type: String,
      required: true,
    },
    resetHash:{
    type:String,
      unique:true
    },
     PorfileImageUrl: {
      type: String,
      default: "/profile_photo.jpg",
    },


  },

  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (!this.isModified) {
    return next();
  }
     if (this.skipHashing) {
        return next()
     }

     
  const salt = randomBytes(16).toString("hex");
  const hashPassword = createHmac("sha256", salt)
    .update(this.password)
    .digest("hex");

  this.salt = salt;
  this.password = hashPassword;

  console.log("Saving user:", {
    fullName: this.fullName,
    email: this.email,
    salt: this.salt,
    password: this.password,
  });

  next();
});

userSchema.static("matchUserPassword", async function (email, password) {
  const finduser = await this.findOne({ email: email });

  if (!finduser) {
    throw new Error("user not found");
  }
  const salt = finduser.salt;
  const UserProvidedhash = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  if (UserProvidedhash !== finduser.password) {
    throw new Error("user not found");
  }

  const token = CreateTokenOFUser(finduser,loginsecret);

  return token;
});
const UserModel = model("user", userSchema);

module.exports = UserModel;
