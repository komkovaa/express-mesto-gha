const express = require('express');
const mongoose = require('mongoose');

const { PORT = 3000 } = process.env;
const app = express();

const bodyParser = require('body-parser');
const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');
const login = require('./controllers/users');
const createUser = require('./controllers/users');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
});

app.post('/signin', login);
app.post('/signup', createUser);

app.use((req, res, next) => {
  req.user = {
    _id: '635a693e7972a32d41cff120',
  };

  next();
});

app.use('/users', userRouter);
app.use('/cards', cardRouter);

app.use((req, res) => {
  res.status(404)
    .send({ message: 'Запрашиваемый ресурс не найден' });
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
