const http2 = require('node:http2');
const HTTPError = require('./http-error');

class ServerError extends HTTPError {
  constructor(message = '') {
    super(`Неизвестная ошибка. ${message}`, http2.constants.HTTP_STATUS_SERVICE_UNAVAILABLE);
  }
}

module.exports = ServerError;
