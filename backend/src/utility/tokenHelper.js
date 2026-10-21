const jwt = require("jsonwebtoken");

exports.EncodeToken = (email, _id) => {
  let key = process.env.JWT_KEY;
  let expire = process.env.JWT_Expire_Time;
  let paylaod = { email, _id };

  return jwt.sign(paylaod, key, { expiresIn: expire });
};

exports.decodeToken = (token) => {
  try {
    let key = process.env.JWT_KEY;
    let decode = jwt.verify(token, key);
    return decode;
  } catch (error) {
    return null;
  }
};
