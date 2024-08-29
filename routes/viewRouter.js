const express = require('express');

const {
  getOverview,
  getLoginForm
} = require('./../controllers/viewsController');

const { isLoggedin } = require(`./../controllers/authController`);

const route = express.Router();

route.get('/', isLoggedin, getOverview);
route.get('/login', getLoginForm);

module.exports = route;
