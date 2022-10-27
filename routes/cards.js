const cardRouter = require('express').Router();
const { getCards } = require('../controllers/cards');
const { createCard } = require('../controllers/createCard');
const { getCardId } = require('../controllers/cardId');

cardRouter.get('/', getCards);

cardRouter.delete('/:cardId', getCardId);

cardRouter.post('/', createCard);

module.exports = cardRouter;
