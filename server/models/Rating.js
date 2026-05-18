const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    task: { type: mongoose.Schema.Types.ObjectId, ref: "Task", required: true, unique: true },
    ratedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ratedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["creator_rating_worker", "worker_rating_creator"],
      required: true,
    },
    score: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, default: "", maxlength: 500 },
  },
  { timestamps: true }
);

ratingSchema.index({ task: 1, ratedBy: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);
