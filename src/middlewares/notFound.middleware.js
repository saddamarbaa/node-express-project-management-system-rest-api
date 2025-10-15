export function notFound(req, res, next) {
  const error = new Error(404, `Route - ${req.originalUrl}  Not Found`);
  next(error);
}
