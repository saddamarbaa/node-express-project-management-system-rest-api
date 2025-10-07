import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
      index: true,
      minlength: 3,
      maxlength: 30,
    },
    fullNae: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    password: { type: String, required: true, minlength: 6 },
    isEmailVerified: { type: Boolean, default: false },
    refreshToken: { type: String, default: "" },
    forgetPasswordToken: { type: String, default: "" },
    forgetPasswordTokenExpiry: { type: Date },
    emailVerificationToken: { type: String, default: "" },
    emailVerificationTokenExpiry: { type: Date },

    avatar: {
      type: {
        url: String,
        localPath: String,
      },
      default: { url: "https://placehold.co/600x400", localPath: "" },
    },
  },
  { timestamps: true },
);

mongoose.model("User", userSchema);

export default mongoose.model("User");
