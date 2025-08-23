const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const DataSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: { type: String, required: true },
  
    phoneNumber: { type: String, required: true }},
  {
    versionKey: false,
    timestamps: true,
  }
);

// ✅ Hash password before saving
DataSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const userModel = mongoose.model("users", DataSchema);

module.exports = userModel;
