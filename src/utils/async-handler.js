export const asyncHandler = (requestHandlerFn) => (req, res, next) => {
  return Promise.resolve(requestHandlerFn(req, res, next)).catch(next);
};

export default asyncHandler;
