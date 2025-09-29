const express = require("express");
const router = express.Router();
const path = require("path"); 
const userModel = require("../models/userModel");
const multer = require("multer");

const Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve("./public/images")); // fixed path reference
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  }
});

const upload = multer({ storage: Storage });

router.get("/auth/signup", (req, res) => {
  res.send("hello form sign up page");
});

router.get("/auth/signin", (req, res) => {
  const message = req.query.msg || "Please login";
  res.send({ msg: message });
});

router.post("/auth/signup", upload.single("CoverImage"), async (req, res) => {
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

    console.log("new user", newUser);

    res.send({
      id: newUser._id,
      email: newUser.email,
      PorfileImageUrl: profileImageUrl,
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
router.post("/auth/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const token = await userModel.matchUserPassword(email, password);
    res.cookie("userToken",token);
    console.log("Cookie set in response:", res.getHeader("Set-Cookie"));
    console.log("authenticate successfully", token);
    
    
   return res.send({ token: token });
  } catch (error) {
       return res.send({ msg: "user not found" });
  }
});

module.exports = router;
