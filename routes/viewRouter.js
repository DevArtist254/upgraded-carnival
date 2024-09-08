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
router.get('/tour/:name', getTour);

module.exports = router;
