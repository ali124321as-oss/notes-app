const express = require("express");
const router = express.Router();

const userModel = require("../models/userModel");
router.get("/auth/signup", (req, res) => {
        res.send("hello form sign up page ");
});

router.get("/auth/signin", (req, res) => {
  const message = req.query.msg || "Please login";
  res.send({ msg: message });
});

router.post("/auth/signup", async (req, res) => {
  const { fullName, email, password } = req.body;
  const newUser = await userModel.create({
    fullName: fullName,
    email: email,
    password: password,
  });

  console.log("new user", newUser);

  res.send({ user: newUser });
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
