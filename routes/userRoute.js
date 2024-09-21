const express = require('express');

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo
} = require(`./../controllers/authController`);

const {
  updateMe,
  deleteMe,
  getUsers,
  getMe,
  getUser,
  upload,
  resizeUserPhoto
} = require(`./../controllers/userController`);

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotPassword', forgotPassword);
router.patch('/resestPassword/:token', resetPassword);

router.use(protect);

router.patch('/updateMyPassword', updatePassword);
router.patch('/updateMe', upload.single('photo'), resizeUserPhoto, updateMe);
router.patch('/deleteMe', deleteMe);

router.get('/getUsers', restrictTo('admin'), getUsers);
router.get('/me', getMe, getUser);

module.exports = router;
