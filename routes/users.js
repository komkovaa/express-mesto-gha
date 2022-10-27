const userRouter = require('express').Router();
const { getUsers } = require('../controllers/users');
const { createUser } = require('../controllers/createUser');
const { getUserId } = require('../controllers/userId');

userRouter.get('/', getUsers);

userRouter.get('/:userId', getUserId);

userRouter.post('/', createUser);

module.exports = userRouter;
