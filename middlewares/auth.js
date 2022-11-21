const jwt = require('jsonwebtoken');

const UnauthorizedError = require('../errors/anauthorized-error');

module.exports.auth = (req, res, next) => {
  const { authorization } = req.headers;
  console.log('что здесь - ', req.headers);
  if (!authorization || !authorization.startsWith('Bearer ')) {
    console.log('что в if - ', authorization);
    throw new UnauthorizedError('Необходима авторизация.ОШИБКА');
  }

  // извлечём токен
  const token = authorization.replace('Bearer ', '');
  let payload;
  // верифицируем токен
  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    next(new UnauthorizedError('Необходима авторизация.'));
  }
  req.user = payload; // записываем пейлоуд в объект запроса
  next(); // пропускаем запрос дальше
};
