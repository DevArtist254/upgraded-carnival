const multer = require('multer');
const sharp = require('sharp');

const Tour = require(`./../models/tourModel`);
const catchAsync = require(`./../utils/catchAsync`);
const AppError = require(`./../utils/appError`);
const factory = require(`./handlerFactory`);

const mStorage = multer.memoryStorage();

const mFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

exports.upload = multer({
  storage: mStorage,
  fileFilter: mFilter
});

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);

  if (!req.files.imageCover || !req.files.images) return next();

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.body.id}-${Date.now()}-${i + 1}.jpeg`;
      console.log(filename);

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $avg: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/34.111,-118.11/unit/:mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mil' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(new AppError(`Please provide lat ant lng in the format lat,lng`, 400));
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

// /tour-distances/center/:latlng/unit/:unit
// /tour-distances/center/34.111,-118.11/unit/:mi
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mil' ? 0.000621371 : 0.0001;

  if (!lat || !lng) {
    next(new AppError(`Please provide lat ant lng in the format lat,lng`, 400));
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});

// const fs = require('fs');

// const toursData = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);

//   if (req.params.id * 1 > toursData.length) {
//     return res.status(404).JSON({
//       status: 'Fail',
//       message: 'Invaild ID'
//     });
//   }

//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'Fail',
//       messsage: 'Missing name or price'
//     });
//   }
//   next();
// };

// exports.getAllTours = (req, res) => {
//   console.log(req.requestTime);

//   res.status(200).json({
//     status: 'success',
//     requestedAt: req.requestTime,
//     results: toursData.length,
//     data: {
//       toursData
//     }
//   });
// };

// exports.getTour = (req, res) => {
//   console.log(req.params);
//   const id = req.params.id * 1;

//   const tour = toursData.find(el => el.id === id);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour
//     }
//   });
// };

// exports.createTour = (req, res) => {
//   const newId = toursData[toursData.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);

//   toursData.push(newTour);

//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(toursData),
//     err => {
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tour: newTour
//         }
//       });
//     }
//   );
// };

// exports.updateTour = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: '<Updated tour here...>'
//     }
//   });
// };

// exports.deleteTour = (req, res) => {
//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// };
