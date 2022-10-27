const Card = require('../models/card');

module.exports.getCardId = (req, res) => {
  Card.find({})
    .then((cardId) => res.send({ data: cardId }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};
