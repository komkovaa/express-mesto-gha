const userRouter = require('express').Router();
const {
  getUsers, getUserId, updateProfileInfo, updateAvatar,
} = require('../controllers/users');

userRouter.get('/', getUsers);

userRouter.get('/:userId', getUserId);

userRouter.patch('/me', updateProfileInfo);

userRouter.patch('/me/avatar', updateAvatar);

module.exports = userRouter;
