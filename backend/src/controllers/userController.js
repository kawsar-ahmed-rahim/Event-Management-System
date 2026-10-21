const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const { EncodeToken } = require("../utility/tokenHelper");

//! Create User
exports.register = async (req, res) => {
  try {
    let { name, email, password, phoneNumber } = req.body;

    let result = await userModel.create({ name, email, password, phoneNumber });

    res.status(200).json({
      success: true,
      message: "User create successfully!",
      result: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
      message: "Something went wrong!",
    });
  }
};

//! User Login
exports.login = async (req, res) => {
  try {
    let { email, password } = req.body;

    let user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email not match!",
      });
    }

    // isMatch password
    let isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      let token = EncodeToken(user.email, user._id);

      let option = {
        maxAge: process.env.Cookie_Expire_Time,
        httpOnly: true,
        sameSite: "none",
        secure: true,
      };

      // Set cookie
      res.cookie("token", token, option);

      res.status(200).json({
        success: true,
        message: "Login success.",
        user: {
          id: user._id,
          email: user.email,
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password not match!",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
      message: "Something went wrong!",
    });
  }
};

//! get User
exports.user = async (req, res) => {
  try {
    let email = req.headers.email;

    let matchStage = {
      $match: { email },
    };

    let project = {
      $project: {
        name: 0,
        password: 0,
        phoneNumber: 0
      },
    };

    let result = await userModel.aggregate([matchStage, project]);

    res.status(200).json({
      success: true,
      result: result[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
      message: "Something went wrong!",
    });
  }
};

//! user Logout
exports.logout = (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      success: true,
      message: "Logout success.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
      message: "Something went wrong!",
    });
  }
};

//! update user
exports.update = async (req, res) => {
  try {
    let { email, password } = req.body;
    let userId = req.headers._id;

    let updatedData = { email };

    if (password) {
      let hashPassword = await bcrypt.hash(password, 10);
      updatedData.password = hashPassword;
    }
    // update user
    await userModel.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "User data update.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.toString(),
      message: "Something went wrong!",
    });
  }
};
