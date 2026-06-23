const express = require('express');
const { addFavorite, removeFavorite, getFavorites, checkFavorite } = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getFavorites);
router.get('/:propertyId/check', checkFavorite);
router.post('/:propertyId', addFavorite);
router.delete('/:propertyId', removeFavorite);

module.exports = router;
