function currentUserHandler(req, res, next) {
  res.locals.currentUser = req.user;
  next();
}

export { currentUserHandler };
