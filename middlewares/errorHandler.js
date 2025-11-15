function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("something broke, check server terminal g");
}

export { errorHandler };
