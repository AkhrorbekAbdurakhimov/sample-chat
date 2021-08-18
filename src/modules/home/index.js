const express = require('express')
const router = express.Router()
const { GET, POST, USER, USERS, MESSAGES } = require('./controller')

router.route('/')
    .get(GET)
    .post(POST)

router.get('/users', USERS)
router.get('/messages', MESSAGES)

module.exports = router