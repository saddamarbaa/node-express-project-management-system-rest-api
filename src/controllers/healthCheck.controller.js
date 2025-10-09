import { ApiResponse } from "../utils/app-response.js";
import { asyncHandler } from "../utils/async-handler.js";

export const healthCheck = asyncHandler(async (req, res, next) => {
  const response = new ApiResponse(
    res,
    200,
    {
      status: "OK",
      message: "Health check passed",
    },
    "Health check passed",
  );
  response.send();
});
