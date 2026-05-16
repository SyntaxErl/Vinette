const express = require('express')
const router = express.Router({ mergeParams: true })
const auth = require('../middleware/authMiddleware')
const { getComments, createComment } = require('../controllers/comment.controller')

router.get('/', auth, getComments)
router.post('/', auth, createComment)

module.exports = router
