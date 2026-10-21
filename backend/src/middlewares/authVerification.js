const { decodeToken } = require("../utility/tokenHelper");

module.exports = (req, res, next) => {
  let token = req.cookies["token"];

  let decoded = decodeToken(token);

  if (decoded === null) {
    return res.status(401).json({
      status: false,
      message: "Invalid token.",
    });
  } else {
    req.headers.email = decoded.email;
    req.headers._id = decoded._id;
    next();
  }
};
