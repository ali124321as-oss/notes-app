const jwt = require("jsonwebtoken");

const secret = "$ali123$uper";

function CreateTokenOFUser(user) {
  const payload = {
    _id: user._id,
    email: user.email,
  };

  const token = jwt.sign(payload, secret);
  return token;
}

function validateTokenOFUser(token) {
  try {
    const payload = jwt.verify(token, secret);
    return payload;
  } catch (err) {
    return null;
  }
}

module.exports = {
  CreateTokenOFUser,
  validateTokenOFUser,
};
