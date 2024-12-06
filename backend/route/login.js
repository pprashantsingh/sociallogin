const router = require('express').Router()
const controller = require('../controller/login')
router.get('/profile',controller.profile)

module.exports = router