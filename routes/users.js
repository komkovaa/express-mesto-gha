const router = require('express').Router();
const { getUsers } = require('../controllers/users');
const { createUser } = require('../controllers/createUser');
const { getUserId } = require('../controllers/userId');

router.get('/', getUsers);

router.get('/:userId', getUserId);

router.post('/', createUser);

module.exports = router;