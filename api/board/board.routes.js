const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const {getBoard, getBoards, deleteBoard, updateBoard, addBoard} = require('./board.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getBoards)
router.get('/:id', getBoard)
router.put('/', updateBoard)
router.post('/', addBoard)
router.delete('/:id', deleteBoard)
//TURN ON IF YOU WANT ONLY LOGGED IN USER AND/OR ADMIN TO MAKE CHANGES
// router.put('/', requireAuth, requireAdmin, updateBoard)
// router.post('/', requireAuth, requireAdmin, addBoard)
// router.delete('/:id', requireAuth, requireAdmin, deleteBoard)
// router.post('/:id', requireAuth, addReview)

//TURN BACK ON WHEN USER IMPLEMENTED
// router.put('/:id',  requireAuth, updateUser)

module.exports = router