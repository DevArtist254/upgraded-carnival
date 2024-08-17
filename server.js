const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log(`Uncaught exception! Shutting down...`);
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: `./config.env` });
const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => console.log(`DB is connected successful...`));

const port = process.env.PORT || 3000;

const server = app.listen(3000, () => {
  console.log(`App running on port ${port}..`);
});

process.on('unhandleRejection', err => {
  console.log(`Unhandle Rejection! Shutting down...`);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
