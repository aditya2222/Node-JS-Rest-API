const express = require('express');
const router = express.Router();

const feed = require('../controllers/feed');

router.get('/posts', feed.getPosts);

module.exports = router