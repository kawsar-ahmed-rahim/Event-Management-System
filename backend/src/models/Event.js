import mongoose from "mongoose";

export const CATEGORIES = ["conference", "workshop", "concert", "sports", "networking", "exhibition", "other"];

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    category: { type: String, enum: CATEGORIES, default: "other" },
    venue: { type: String, required: true, trim: true, maxlength: 200 },
    city: { type: String, required: true, trim: true, maxlength: 80 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    price: { type: Number, default: 0, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    registeredCount: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["draft", "published", "cancelled"], default: "published" },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.__v;
        delete ret.id;
        return ret;
      },
    },
  }
);

eventSchema.virtual("seatsLeft").get(function () {
  return Math.max(this.capacity - this.registeredCount, 0);
});
eventSchema.virtual("isFull").get(function () {
  return this.registeredCount >= this.capacity;
});

eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ category: 1 });

export default mongoose.models.Event || mongoose.model("Event", eventSchema);
