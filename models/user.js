const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const {
  UnauthorizedError,
} = require('../errors/bad-request-error');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(email) {
        return validator.isEmail(email);
      },
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  // попытаемся найти пользователя по почте
  return this.findOne({ email })
    .select('+password') // this — это модель User
    .then((document) => {
      // не нашёлся — отклоняем промис
      if (!document) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }

      // нашёлся — сравниваем хеши
      return bcrypt.compare(password, document.password)
        .then((matched) => {
          if (!matched) {
            throw new UnauthorizedError('Неправильные почта или пароль');
          }
          const {
            password: remove,
            ...user
          } = document.toObject();
          return user;
        });
    });
};

// Создаем модель и экспортируем ее
module.exports = mongoose.model('user', userSchema);
