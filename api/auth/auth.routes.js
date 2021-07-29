const express = require('express')
const {login, signup, logout, getGoogleUrl, googleAuth, checkIfUserExists} = require('./auth.controller')

const router = express.Router()

router.post('/login', login)
router.post('/signup', signup)
router.post('/logout', logout)
router.get('/google/login/url', getGoogleUrl)
router.get('/google/login/auth', googleAuth)
router.get('/google/login/check', checkIfUserExists)

module.exports = router