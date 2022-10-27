const User = require('../models/user');

module.exports.getUserId = (req, res) => {
  User.find({})
    .then((userId) => res.send({ data: userId }))
    .catch(() => res.status(500).send({ message: 'Произошла ошибка' }));
};