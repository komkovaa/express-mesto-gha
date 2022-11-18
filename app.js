const express = require('express');
const mongoose = require('mongoose');
const http2 = require('node:http2');

const { PORT = 3000 } = process.env;
const app = express();

const bodyParser = require('body-parser');
const { errors } = require('celebrate');
const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');
const login = require('./controllers/users');
const createUser = require('./controllers/users');
const auth = require('./middlewares/auth');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.post('/signup', createUser);
app.post('/signin', login);

app.use('/users', auth, userRouter);
app.use('/cards', auth, cardRouter);

app.use(errors());
app.use((err, req, res, next) => {
  const status = err.statusCode || http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR;
  const message = err.message || 'Неизвестная ошибка';
  res.status(status).send({ message });
  next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
