import express from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import {
  createDemand, getDemands, getMyDemands,
  respondToDemand, closeDemand, deleteDemand
} from '../controllers/demandController.js'

const router = express.Router()

// Public routes
router.get('/', getDemands)

// Protected routes (auth required)
router.use(authMiddleware)

router.post('/', createDemand)
router.get('/mine', getMyDemands)
router.post('/:id/respond', respondToDemand)
router.put('/:id/close', closeDemand)
router.delete('/:id', deleteDemand)

export default router
