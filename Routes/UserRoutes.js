const express = require("express");
const router = express.Router();
const path = require("path");
const { createHmac } = require("crypto");
const { CreateTokenOFUser } = require("../Auth");
const userModel = require("../models/userModel");
const multer = require("multer");
const { v4 } = require("uuid");
const { CheckAuthenticationForJWtToken } = require("../AuthMiddleware");
const { body, validationResult } = require("express-validator");


const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array().map((err)=>{
          return   err.msg
    }) });
  }
  next();
};


const Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/images"));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});
const upload = multer({ storage: Storage });


router.get("/auth/signup", (req, res) => {
  res.send("hello form sign up page");
});

router.get("/auth/signin", (req, res) => {
  const message = req.query.msg || "Please login";
  res.send({ msg: message });
});


router.post(
  "/auth/signup",
  upload.single("CoverImage"),
  [
    body("fullName").notEmpty().withMessage("Full name is required"),
    body("email").notEmpty().withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  async (req, res) => {
    const { fullName, email, password } = req.body;

    try {
      const profileImageUrl = req.file
        ? `/images/${req.file.filename}`
        : "/profile_photo.jpg";

      const newUser = await userModel.create({
        fullName,
        email,
        password,
        PorfileImageUrl: profileImageUrl,
      });

      res.send({
        id: newUser._id,
        email: newUser.email,
        PorfileImageUrl: profileImageUrl,
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);


router.post(
  "/auth/signin",
  [
    body("email").notEmpty().withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  async (req, res) => {
    const { email, password } = req.body;

    try {
      const token = await userModel.matchUserPassword(email, password);
      res.cookie("userToken", token);
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
  [
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword").notEmpty().withMessage("New password is required"),
  ],
  validate,
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
  [
    body("password").notEmpty().withMessage("Password is required"),
    body("newEmail").notEmpty().withMessage("New email is required"),
  ],
  validate,
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


router.post(
  "/auth/forgetpassword",
  [body("email").notEmpty().withMessage("Email is required")],
  validate,
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


router.patch(
  "/auth/changePassword",
  [
    body("shortToken").notEmpty().withMessage("Short token is required"),
    body("newPassword").notEmpty().withMessage("New password is required"),
  ],
  validate,
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

module.exports = router;
