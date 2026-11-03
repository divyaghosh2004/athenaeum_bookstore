import express from 'express';
import { checkout, getMyOrders, getOrderById } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All order actions require authentication

router.post('/checkout', checkout);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);

export default router;

