const jwt = require("jsonwebtoken");


function CreateTokenOFUser(user,secret) {
  const payload = {
    _id: user._id,
    email: user.email,
  };

  const token = jwt.sign(payload, secret,{
       expiresIn:"15m"
  });
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
