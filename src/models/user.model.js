import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      // note: username is intentionally NOT unique; allow duplicates
      minlength: 3,
      maxlength: 30,
    },
    fullName: {
      type: String,
      // required: true,
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
    lastPasswordResetAt: { type: Date },
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

// Note: `index: true` is already declared on the schema fields above; avoid duplicate index() calls.

// Hash password before saving the user
// Virtual for confirmPassword (not persisted)
userSchema.virtual("confirmPassword").set(function (value) {
  this._confirmPassword = value;
});

// Validate confirmPassword and hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    // If confirmPassword was provided via virtual, compare
    if (typeof this._confirmPassword === "undefined") {
      // invalidate will create a ValidationError
      this.invalidate("confirmPassword", "Please confirm your password");
      return next(new Error("Validation failed"));
    }

    if (this._confirmPassword !== this.password) {
      this.invalidate("confirmPassword", "Passwords do not match");
      return next(new Error("Validation failed"));
    }

    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, username: this.username, email: this.email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m" },
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id, username: this.username, email: this.email },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" },
  );
};

userSchema.methods.generateTemporaryToken = function () {
  const unHashToken = crypto.randomBytes(32).toString("hex");
  const hashToken = crypto
    .createHash("sha256")
    .update(unHashToken)
    .digest("hex");

  const tokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes from now
  return { unHashToken, hashToken, tokenExpiry };
};

// Static helpers to find users by token (centralize hashing logic)
userSchema.statics.findByVerificationToken = function (token, email) {
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  return this.findOne({
    email,
    emailVerificationToken: hashed,
    emailVerificationTokenExpiry: { $gt: Date.now() },
  });
};

userSchema.statics.findByResetToken = function (token) {
  const hashed = crypto.createHash("sha256").update(token).digest("hex");
  return this.findOne({
    forgetPasswordToken: hashed,
    forgetPasswordTokenExpiry: { $gt: Date.now() },
  });
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.forgetPasswordToken;
  delete obj.forgetPasswordTokenExpiry;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationTokenExpiry;
  return obj;
};

export default mongoose.model("User", userSchema);
