const express = require('express');
const router = express.Router();
const { makeAnOrder, getAllOrders, getOrderById, updateOrder } = require("../controllers/order_controller")


router.get('/', getAllOrders);
router.post('/', makeAnOrder);
router.get('/:id', getOrderById);
router.patch('/:id', updateOrder);


module.exports = router;