const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http2 = require('node:http2');
const { User } = require('../models/user');

const BadRequestError = require('../errors/bad-request-error');
const NotFoundError = require('../errors/not-found-error');
const ServerError = require('../errors/server-error');
const UnauthorizedError = require('../errors/anauthorized-error');
const ConflictError = require('../errors/conflict-error');
const HTTPError = require('../errors/http-error');

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.send({ data: users });
    })
    .catch((err) => {
      next(err);
      // responseServerError(res, err.message);
    });
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((document) => {
      const user = document.toObject();
      delete user.password;
      res.send({ data: user });
    })
    .catch((err) => {
      if (err instanceof HTTPError) {
        next(err);
      } else if (err.code === 11000) {
        next(new ConflictError('Пользователь с такой почтой уже существует'));
      } else if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные пользователя.'));
      } else {
        next(new ServerError(err.message));
      }
    });
};

module.exports.login = (req, res, next) => {
  const {
    email, password,
  } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // создадим токен
      const token = jwt.sign(
        { _id: user._id },
        'some-secret-key',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch((err) => {
      if (err instanceof HTTPError) {
        next(err);
      } else {
        next(new UnauthorizedError('Неправильные почта или пароль'));
      }
    });
};

module.exports.currentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден.');
      } else {
        res.status(http2.constants.HTTP_STATUS_OK).send({ data: user });
      }
    })
    .catch((err) => {
      next(new ServerError(err.message));
    });
};

module.exports.getUserId = (req, res, next) => {
  User.findById({ _id: req.params.userId })
    .then((userId) => {
      if (userId === null) {
        throw new NotFoundError('Пользователь не найден.');
      } else {
        res.send({ data: userId });
      }
    })
    .catch((err) => {
      if (err instanceof HTTPError) {
        next(err);
      } else if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные пользователя.'));
      } else {
        next(err);
        // next(responseServerError(err.message));
      }
    });
};

module.exports.updateProfileInfo = (req, res, next) => {
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
      if (!user) {
        throw new NotFoundError('Пользователь не найден.');
      } else {
        res.send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные пользователя.'));
      } else {
        next(new ServerError(err.message));
      }
    });
};

module.exports.updateAvatar = (req, res, next) => {
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
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден.');
      } else {
        res.send({ data: user });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные пользователя.'));
      } else {
        next(new ServerError(err.message));
      }
    });
};
