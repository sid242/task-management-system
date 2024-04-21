const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  getUserByEmail,
  getUsers,
  sendPasswordLink,
  resetPassword,
} = require('../controllers/userControllers');
const { verifyUser } = require('../middleware/userMiddleware');

router.post(
  '/register',
  [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({
      min: 5,
    }),
  ],
  registerUser
);

router.post(
  '/login',
  [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
  ],
  loginUser
);

router.get('/getusers', verifyUser, getUsers);

router.get('/getusers/:email', verifyUser, getUserByEmail);

router.post('/sendpasswordlink', sendPasswordLink);

router.post('/:id/:token', resetPassword);

module.exports = router;
