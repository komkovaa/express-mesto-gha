const http2 = require('node:http2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const noExtraneousDependencies = require('eslint-plugin-import/lib/rules/no-extraneous-dependencies');

const responseBadRequestError = (res) => res
  .status(http2.constants.HTTP_STATUS_BAD_REQUEST)
  .send({ message: 'Переданы некорректные данные пользователя.' });

const responseNotFoundError = (res) => res
  .status(http2.constants.HTTP_STATUS_NOT_FOUND)
  .send({ message: 'Пользователь не найден.' });

const responseServerError = (res) => res
  .status(http2.constants.HTTP_STATUS_SERVICE_UNAVAILABLE)
  .send({ message: 'На сервере произошла ошибка.' });

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.send({ data: users });
    })
    .catch((err) => {
      responseServerError(res, err.message);
    });
};

module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        responseBadRequestError(res, err.message);
      } else {
        responseServerError(res, err.message);
      }
    });
};

module.exports.login = (req, res) => {
  const {
    email, password,
  } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // создадим токен
      const token = jwt.sign(
        { _id: user._id },
        'some-secret-key',
        // { expiresIn: '7d' },
      );

      // вернём токен
      res
        .cookie('jwt', token, {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        })
        .end();// если у ответа нет тела, можно использовать метод end
      // аутентификация успешна
      res.send({ message: 'Всё верно!' });
    })
    .catch((err) => {
      // возвращаем ошибку аутентификации
      res
        .status(401)
        .send({ message: err.message });
    });
};

module.exports.currentUser = (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user) {
        res.send({ data: user });
      } else {
        responseNotFoundError(res);
      }
    })
    .catch((err) => {
if (err.name === 'CastError') {
  responseBadRequestError(res, err.message);
} else {
  responseServerError(res, err.message);
}
});

module.exports.getUserId = (req, res) => {
  User.findById({ _id: req.params.userId })
    .then((userId) => {
      if (userId === null) {
        responseNotFoundError(res);
      } else {
        res.send({ data: userId });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        responseBadRequestError(res, err.message);
      } else {
        responseServerError(res, err.message);
      }
    });
};

module.exports.updateProfileInfo = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
      // upsert: true, // если пользователь не найден, он будет создан
    },
  )
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        responseBadRequestError(res, err.message);
      } else {
        responseServerError(res, err.message);
      }
    });
};

module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true, // обработчик then получит на вход обновлённую запись
      runValidators: true, // данные будут валидированы перед изменением
      // upsert: true, // если пользователь не найден, он будет создан
    },
  )
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        responseBadRequestError(res, err.message);
      } else {
        responseServerError(res, err.message);
      }
    });
};
