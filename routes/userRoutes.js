const express = require('express');
const { createUser, getUserById, updateUserBalance, fetchTelegramID } = require('../controllers/userController');

const router = express.Router();

router.post('/register', createUser);
router.get('/:id', getUserById);
router.put('/:id/balance', updateUserBalance);
router.post('/fetchTelegramID', fetchTelegramID);

module.exports = router;
