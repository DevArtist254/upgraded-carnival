const Tour = require('../models/tourModel');

const User = require(`./../models/userModel`);

const catchAsync = require('../utils/catchAsync');
//const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('base', {
    title: 'All Tours',
    tours
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'log into your account'
  });
};
