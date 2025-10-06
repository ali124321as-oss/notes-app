const express = require("express");
const router = express.Router();
const path = require("path");
const { createHmac } = require("crypto");
const { CreateTokenOFUser, validateTokenOFUser } = require("../Auth");
const userModel = require("../models/userModel");
const multer = require("multer");
const { v4 } = require("uuid");
const { CheckAuthenticationForJWtToken } = require("../AuthMiddleware");
const {
  textValidator,
  emailValidator,
  passwordValidator,
  fileValidator,
  validationMiddleware,
} = require("../expressValidator/allValidatons");
const { createStorage } = require("../uploadimagehandler");
const userInformation = {};
const signupSecret = process.env.signupSecret;
const email_user = process.env.userEmail;
const email_password = process.env.userPassword;
const sender_email = process.env.senderEmail;
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "in-v3.mailjet.com",
  port: 587,
  secure: false,
  auth: {
    user: "494d88322c2bb74b44b597615b6f05cc",
    pass: "ddba87939f4d507ec143ccc7524f4119",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const upload = multer({ storage: createStorage("images") });

router.get("/auth/signup", (req, res) => {
  res.send("hello form sign up page");
});

router.get("/auth/signin", (req, res) => {
  const message = req.query.msg || "Please login";
  res.send({ msg: message });
});

// ----- Signup -----
router.post(
  "/auth/signup",
  upload.single("CoverImage"),
  [
    textValidator("fullName"),
    emailValidator("email"),
    passwordValidator("password"),
    fileValidator("CoverImage"),
  ],
  validationMiddleware,
  async (req, res) => {
    try {
      const { fullName, email, password } = req.body;
      const profileImageUrl = req.file
        ? `/images/${req.file.filename}`
        : "/profile_photo.jpg";

      const createuser = await userModel.create({
        fullName,
        email,
        password,
        PorfileImageUrl: profileImageUrl,
      });

      if (!createuser) {
        return res.status(400).send({ msg: "you can not create account " });
      }

      return res.send({
        msg: "you accont has been created successfully ",
        yourName: `${createuser.fullName}`,
      });
    } catch (error) {
         console.log("error in signup routes",error);
         
      return res.send({ msg: "some thing went wrong " });
    }
  }
);

// ----- Signin -----
router.post(
  "/auth/signin",
  [emailValidator("email"), passwordValidator("password")],
  validationMiddleware,
  async (req, res) => {
    const { email, password } = req.body;
    try {
      const token = await userModel.matchUserPassword(email, password);
      res.cookie("userToken", token, { httpOnly: true, maxAge: 15 * 60 * 1000 });
      return res.send({ token });
    } catch (error) {
      return res.send({ msg: "user not found" });
    }
  }
);

// ----- Update Password -----
router.patch(
  "/auth/updatePassword",
  CheckAuthenticationForJWtToken("userToken"),
  [passwordValidator("oldPassword"), passwordValidator("newPassword")],
  validationMiddleware,
  async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;

      const user = await userModel.findById(req.user._id);
      if (!user) {
        return res.send({ msg: "user not found" });
      }

      const userProvidedHash = createHmac("sha256", user.salt)
        .update(oldPassword)
        .digest("hex");

      if (user.password !== userProvidedHash) {
        return res.send({ msg: "please enter correct password" });
      }

      user.password = newPassword;
      user.skipHashing = false;
      await user.save();

      const token = CreateTokenOFUser(user);
      res.cookie("userToken", token);

      return res.send({
        msg: "password successfully updated",
        yourName: user.fullName,
      });
    } catch (error) {
      console.log(error);
      return res.send({ msg: "please enter old and new password" });
    }
  }
);

// ----- Update Email -----
router.patch(
  "/auth/email",
  CheckAuthenticationForJWtToken("userToken"),
  [passwordValidator("password"), emailValidator("newEmail")],
  validationMiddleware,
  async (req, res) => {
    const { password, newEmail } = req.body;
    try {
      const user = await userModel.findOne({ _id: req.user._id });
      if (!user) {
        return res.send({ msg: "user not found" });
      }

      const userProvidedHash = createHmac("sha256", user.salt)
        .update(password)
        .digest("hex");

      if (user.password !== userProvidedHash) {
        return res.send({ msg: "please enter valid password" });
      }

      user.email = newEmail;
      user.skipHashing = true;
      await user.save();

      const token = CreateTokenOFUser(user);
      res.cookie("userToken", token);

      return res.send({
        msg: "your email successfully updated",
        yourName: user.fullName,
      });
    } catch (error) {
      console.log(error);
      return res.send({ msg: "email can not be updated" });
    }
  }
);

// ----- Forget Password -----
router.post(
  "/auth/forgetpassword",
  [emailValidator("email")],
  validationMiddleware,
  async (req, res) => {
    try {
      const shortToken = v4().replace(/-/g, "").slice(0, 6);
      const { email } = req.body;

      const findUser = await userModel.findOneAndUpdate(
        { email: email },
        { resetHash: shortToken },
        { runValidators: true }
      );

      if (!findUser) {
        return res.send({ msg: "please enter valid email" });
      }

      return res.send({
        shortToken,
        msg: "use this token to change the password",
      });
    } catch (error) {
      return res.send({ msg: "request can not be proceed" });
    }
  }
);

// ----- Change Password -----
router.patch(
  "/auth/changePassword",
  [textValidator("shortToken"), passwordValidator("newPassword")],
  validationMiddleware,
  async (req, res) => {
    try {
      const { shortToken, newPassword } = req.body;

      const user = await userModel.findOne({ resetHash: shortToken });
      if (!user) {
        return res.send({ msg: "your short token is not valid" });
      }

      user.password = newPassword;
      user.skipHashing = false;
      user.resetHash = undefined;

      await user.save();

      return res.send({ msg: "your password is successfully updated" });
    } catch (error) {
      console.log(error);
      return res.send({ msg: "password can not be updated" });
    }
  }
);

// router.post(

//   "/auth/signup",
//   upload.single("CoverImage"),
//   [
//     textValidator("fullName"),
//     emailValidator("email"),
//     passwordValidator("password"),
//     fileValidator("CoverImage"),
//   ],
//   validationMiddleware(),
//   async (req, res) => {
//     const { fullName, email, password } = req.body;

//     try {
//       const profileImageUrl = req.file
//         ? `/images/${req.file.filename}`
//         : "/profile_photo.jpg";

//       userInformation[fullName] = fullName;
//       userInformation[email] = email;
//       userInformation[password] = password;
//       userInformation[profileImageUrl] = profileImageUrl;
//       const shortToken = v4().replace(/-/g, "").slice(0, 6);
//       const signUpToken = CreateTokenOFUser(shortToken, signupSecret);
//       console.log("all secret keys", signupSecret);
//       console.log(sender_email);
//       console.log("email password", email_password);

//       const html = `
//       <p>Hello <strong>${fullName}</strong>,</p>
//       <p>Your verification code is:</p>
//       <p style="font-size:18px;font-weight:700">${shortToken}</p>
//       <p>This code will expire in 15 minutes.</p>
//     `;

//       const info = await transporter.sendMail({
//         from: "haiderzamanyzi@gmail.com",
//         to: email,
//         subject: "Your verification code",
//         html,
//       });

//       return res.json({
//         message: "Verification code sent to your inbox.",
//         msgId: info.messageId,
//         signUpToken: signUpToken,
//       });
//     } catch (err) {
//       console.error("Error sending email:", err);
//       return res
//         .status(500)
//         .json({ message: "Failed to send verification email" });
//     }
//   }
// );

// router.post(

//   "/auth/token",
//   [textValidator("shortToken")],
//   async (req, res) => {
//     const { shortToken } = req.body;
//     const verifyToken = validateTokenOFUser(shortToken, signupSecret);

//     if (!verifyToken) {
//       return res.send({
//         msg: "please enter correct short token",
//       });
//     }

//     const createUser = await userModel.create({
//       fullName: userInformation.fullName,
//       email: userInformation.email,
//       password: userInformation.password,
//       PorfileImageUrl: userInformation.profileImageUrl,
//     });

//     if (!createUser) {
//       return res.send({
//         msg: "you account can not be created",
//       });
//     }

//     return res.send({
//       msg: "your account create successfully",
//       yourName: createUser.fullName,
//     });
//   }
// );

module.exports = router;