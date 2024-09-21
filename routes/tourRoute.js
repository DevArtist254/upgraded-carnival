const express = require('express');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  upload,
  resizeTourImages
} = require('../controllers/tourController');

const { protect, restrictTo } = require(`./../controllers/authController`);
const reviewRouter = require(`./../routes/reviewRoute`);

const router = express.Router();

// /tour/23455435/reviews CRUD
router.use('/:tourid/reviews', reviewRouter);

router.route('/tour-stats').get(getTourStats);
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);
router.route('/distances/center/:latlng/unit/:unit').get(getDistances);

router.route('/').get(getAllTours);
router.route('/:id').get(getTour);

router.use(protect, restrictTo('admin', 'lead-guide'));

router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/').post(createTour);

router.route('/:id').patch(
  upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 3 }
  ]),
  resizeTourImages,
  updateTour
);

router.route('/:id').delete(deleteTour);

module.exports = router;
