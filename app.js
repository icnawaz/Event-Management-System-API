const express = require('express');
const createError = require('http-errors');
const userRoute = require('./routes/userRoute');
const eventRoute = require('./routes/eventRoute');
const { mongoConnect } = require('./utils/database');
const client = require('./utils/redis');
const app = express();

require('dotenv').config();

(async () => {
  await client.connect();
})();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(userRoute);
app.use(eventRoute);

app.use(async (req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

const PORT = 3000;

mongoConnect(() => {
  app.listen(PORT);
});
