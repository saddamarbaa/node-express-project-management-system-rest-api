import User from "../models/user.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/app-response.js";

export const getProfile = asyncHandler(async (req, res, next) => {
  const userId = req.user && req.user.id;
  if (!userId)
    return new ApiResponse(res, 401, null, "Authentication required").send();

  const user = await User.findById(userId).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry -forgetPasswordToken -forgetPasswordTokenExpiry",
  );
  if (!user) return new ApiResponse(res, 404, null, "User not found").send();

  return new ApiResponse(
    res,
    200,
    { user: user.toJSON() },
    "Profile fetched",
  ).send();
});

export default { getProfile };
