const express = require('express')
const router = express.Router({ mergeParams: true })
const auth = require('../middleware/authMiddleware')
const { getActivity } = require('../controllers/activity.controller')

router.get('/', auth, getActivity)

module.exports = router
