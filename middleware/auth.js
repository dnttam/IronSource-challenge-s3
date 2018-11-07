const jwt = require("jsonwebtoken");

/*
  Express middleware nodel for authentication using Json Web Tokens
  */

module.exports = function(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    // This should really be in an environment variable !!!
    const decoded = jwt.verify(token, "EZ3-IronSource-S3-Challenge");
    req.user = decoded;
    next();
  } catch (ex) {
    return res.status(400).send("Invalid token.");
  }
};
