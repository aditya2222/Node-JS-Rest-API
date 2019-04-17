const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check')

const feed = require('../controllers/feed');

router.get('/posts', feed.getPosts);

router.post('/createPost', [
    body('title').trim().isLength({ min: 7 }),
    body('content').trim().isLength({ min: 5 })
], feed.postPost);

module.exports = router