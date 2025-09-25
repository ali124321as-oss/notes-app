const { validateTokenOFUser } = require("./Auth");

function CheckAuthenticationForJWtToken(cookieName) {
  return (req, res, next) => {
    const token = req.cookies[cookieName];
    const payload = validateTokenOFUser(token);
    if (!payload) {
    return res.redirect("/api/auth/signin?msg=You are not logged in");

    }

    next();
  };
}


module.exports={CheckAuthenticationForJWtToken}
