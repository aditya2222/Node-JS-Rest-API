const express = require('express')
const router = express.Router()
const { body } = require('express-validator/check')
const User = require('../models/User')
const authController = require('../controllers/auth')



router.put('/signup', [
    body('email')
        .isEmail()
        .withMessage('Please Enter A Valid Email')
        .custom((value, { req }) => {
            return User.findOne({ email: value })
                .then((userDoc) => {
                    return Promise.reject('Email address already exists')
                })
        }).normalizeEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('name').trim().isLength({ min: 5 }).isEmpty()
], authController.signup)





module.exports = router