const userRouter = require('express').Router();
const {
  getUsers, getUserId, updateProfileInfo, updateAvatar, currentUser,
} = require('../controllers/users');

userRouter.get('/', getUsers);

userRouter.get('/:userId', getUserId);

userRouter.get('/me', currentUser);

userRouter.patch('/me', updateProfileInfo);

userRouter.patch('/me/avatar', updateAvatar);

module.exports = userRouter;
