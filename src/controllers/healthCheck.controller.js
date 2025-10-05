import { ApiResponse } from "../utils/app-response.js";

export const healthCheck = (req, res) => {
  try {
    // You can send a success response
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
  } catch (error) {
    // Send an error response
    const response = new ApiResponse(res, 500, null, "Something went wrong");
    response.send();
  }
};
