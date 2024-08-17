const AppError = require(`./../utils/appError`);

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value} `;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = err => {
  const value = err.keyValue.name;

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = error => {
  //const value = error.errors[Object.keys(error.errors)].properties.message;
  // eslint-disable-next-line prettier/prettier
  const value = Object.keys(error.errors)
    .map(el => error.errors[el].properties.message)
    .join(',');

  return value;
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    //1 Log error
    console.error('ERROR 💥', err);

    //2 Send a generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    statck: err.stack
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    if (error.kind === 'ObjectId') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldDB(error);

    error = new AppError(
      // eslint-disable-next-line array-callback-return
      Object.keys(error.errors).map(el => {
        if (error.errors[el].name === 'ValidatorError')
          return handleValidationErrorDB(error);
      })[0],
      400
    );

    sendErrorProd(error, res);
  }
};
