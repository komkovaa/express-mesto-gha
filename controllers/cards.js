const http2 = require('node:http2');

const Card = require('../models/card');

const responseBadRequestError = (res, message) => res
  .status(http2.constants.HTTP_STATUS_BAD_REQUEST)
  .send({ message: `Переданы некорректные данные. ${message}` });

const responseNotFoundError = (res, message) => res
  .status(http2.constants.HTTP_STATUS_NOT_FOUND)
  .send({ message: `Карточка не найдена. ${message}` });

const responseServerError = (res, message) => res
  .status(http2.constants.HTTP_STATUS_SERVICE_UNAVAILABLE)
  .send({ message: `На сервере произошла ошибка. ${message}` });

module.exports.getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ data: cards }))
    .catch((err) => {
      responseServerError(res, err.message);
    });
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        responseBadRequestError(res, err.message);
      } else {
        next(err);
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findByIdAndDelete({ _id: req.params.cardId })
    .then((cardId) => {
      if (cardId === null) {
        responseNotFoundError(res);
      } else {
        res.send({ message: 'Карточка удалена' });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        responseBadRequestError(res, err.message);
      } else {
        next(err);
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((cardId, likes) => {
      if (cardId === null) {
        responseNotFoundError(res);
      } else {
        res.send({ data: likes });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        responseBadRequestError(res, err.message);
      } else {
        next(err);
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((cardId, likes) => {
      if (cardId === null) {
        responseNotFoundError(res);
      } else {
        res.send({ data: likes });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        responseBadRequestError(res, err.message);
      } else {
        next(err);
      }
    });
};
