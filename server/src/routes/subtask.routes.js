const express = require('express')
const router = express.Router({ mergeParams: true })
const auth = require('../middleware/authMiddleware')
const { getSubtasks, createSubtask, toggleSubtask, deleteSubtask } = require('../controllers/subtask.controller')

router.get('/', auth, getSubtasks)
router.post('/', auth, createSubtask)
router.patch('/:subtaskId/toggle', auth, toggleSubtask)
router.delete('/:subtaskId', auth, deleteSubtask)

module.exports = router
