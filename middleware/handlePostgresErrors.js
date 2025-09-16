const ERRORS = {
  INVALID_TYPE: "22P02",
  UNIQUE_CONSTRAINT_VIOLATION: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
};

const handlePostgresErrors = (err, req, res, next) => {
  switch (err.code) {
    case ERRORS.INVALID_TYPE:
      return res.status(400).send(err.message);
    case ERRORS.UNIQUE_CONSTRAINT_VIOLATION:
    case ERRORS.FOREIGN_KEY_VIOLATION:
      return res.status(400).send(err.detail);
    default:
      next(err);
  }
};

export default handlePostgresErrors;
