const cardRouter = require('express').Router();
const { getCards, createCard, getCardId, likeCard, dislikeCard } = require('../controllers/cards');

cardRouter.get('/', getCards);

cardRouter.delete('/:cardId', getCardId);

cardRouter.post('/', createCard);

cardRouter.put('/:cardId/likes', likeCard);

cardRouter.delete('/:cardId/likes', dislikeCard);

module.exports = cardRouter;
