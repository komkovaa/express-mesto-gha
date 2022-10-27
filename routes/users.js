const userRouter = require('express').Router();
const { getUsers, createUser, getUserId } = require('../controllers/users');

userRouter.get('/', getUsers);

userRouter.get('/:userId', getUserId);

userRouter.post('/', createUser);

module.exports = userRouter;
