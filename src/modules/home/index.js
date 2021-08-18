const express = require('express')
const router = express.Router()
const { GET, POST, USER, USERS /*MESSAGES, MESSAGE  */} = require('./controller')

router.route('/')
    .get(GET)
    .post(POST)

router.get('/users', USERS)
router.get('/users/:id', USER)
// router.get('/messages', MESSAGES)
// router.get('/messages/:id', MESSAGE)

module.exports = router