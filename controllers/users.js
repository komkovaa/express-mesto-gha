const http2 = require('node:http2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const { BadRequestError } = require('../errors/bad-request-error');
const { NotFoundError } = require('../errors/not-found-error');
const { ServerError } = require('../errors/server-error');
const { UnauthorizedError } = require('../errors/anauthorized-error');
const { ConflictError } = require('../errors/conflict-error');
const HTTPError = require('../errors/http-error');

const responseBadRequestError = (message) => new BadRequestError(`Переданы некорректные данные пользователя. ${message}`);
const responseNotFoundError = () => new NotFoundError('Пользователь не найден.');
const responseServerError = () => new ServerError('На сервере произошла ошибка.');
const responseUnauthorizedError = () => new UnauthorizedError('Неверный логин или пароль');
const errorNotUnique = () => new ConflictError('Пользователь с таким именем уже существует');
const UniqueErrorCode = 11000;

module.exports.getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.send({ data: users });
    })
    .catch((err) => {
      next(err);
      //responseServerError(res, err.message);
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
      const { password: remove, ...user } = document.toObject();
      res.send({ data: user });
    })
    .catch((err) => {
      if (err instanceof HTTPError) {
        next(err);
      } else if (err.code === UniqueErrorCode) {
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
      if (err instanceof HTTPError) {
        next(err);
      } else {
        next(new UnauthorizedError('Неправильные почта или пароль'));
      }
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
        //next(responseServerError(err.message));
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
