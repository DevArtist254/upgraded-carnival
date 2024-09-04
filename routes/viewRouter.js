const express = require('express');

const {
  getOverview,
  getLoginForm,
  getTour
} = require('./../controllers/viewsController');

const { isLoggedin } = require(`./../controllers/authController`);

const router = express.Router();

router.use(isLoggedin);

router.get('/', getOverview);
router.get('/login', getLoginForm);
router.get('/tour/:slug', getTour);

module.exports = router;
