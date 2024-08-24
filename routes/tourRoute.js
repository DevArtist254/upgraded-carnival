const express = require('express');

const tourController = require('../controllers/tourController');

const reviewRouter = require(`./../routes/reviewRoute`);

const router = express.Router();

router.use('/:tourid/reviews', reviewRouter);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
