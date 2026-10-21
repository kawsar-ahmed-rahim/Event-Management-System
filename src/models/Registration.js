import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: { type: String, enum: ["registered", "cancelled"], default: "registered" },
  },
  { timestamps: true, toJSON: { transform: (doc, ret) => { delete ret.__v; return ret; } } }
);

// One registration record per user per event (prevents double booking).
registrationSchema.index({ event: 1, user: 1 }, { unique: true });

export default mongoose.models.Registration || mongoose.model("Registration", registrationSchema);
