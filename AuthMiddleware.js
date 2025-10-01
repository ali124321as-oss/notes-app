const { validateTokenOFUser } = require("./Auth");
  const loginsecret = process.env.loginSecret
function CheckAuthenticationForJWtToken(cookieName) {
  return (req, res, next) => {
    const token = req.cookies[cookieName];
    const payload = validateTokenOFUser(token,loginsecret);
      

    if (!payload) {
      return res.redirect("/api/auth/signin?msg=You are not logged in");
    }
          
    req.user = payload;
   console.log("req.user in auth middle ware",req.user);
   
    next();
  };
}

module.exports = { CheckAuthenticationForJWtToken };
