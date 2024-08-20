/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoute');
const userRouter = require('./routes/userRoute');

//app init
const app = express();

//1) Global Middleware
//Set security http headers
app.use(helmet());

if (process.env.NODE_ENV === `development`) {
  app.use(morgan('dev'));
}

//Limit requests from same API
const limiter = rateLimit({
  limit: 100,
  statusCode: 429,
  windowMs: 60 * 60 * 1000,
  message: 'Too many req from this IP, please try again in an hour!'
});

app.use('/api', limiter);

//Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

//Data sanitization NOSQL query injection
app.use(mongoSanitize());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

//cspisawesome
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' https://apis.google.com"
  );
  next();
});

//Serving static files
app.use(express.static(`${__dirname}/public`));

//Routes
app.use(`/api/v1/tours`, tourRouter);
app.use(`/api/v1/users`, userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
