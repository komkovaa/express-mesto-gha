const userRouter = require('express').Router();
const {
  getUsers, createUser, getUserId, updateProfileInfo, updateAvatar,
} = require('../controllers/users');

userRouter.get('/', getUsers);

userRouter.get('/:userId', getUserId);

userRouter.post('/', createUser);

userRouter.patch('/me', updateProfileInfo);

userRouter.patch('/me/avatar', updateAvatar);

module.exports = userRouter;
