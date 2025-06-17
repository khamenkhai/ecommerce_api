const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const User = require('../models/user');

// Create a new product
const makeAnOrder = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress1,
            shippingAddress2,
            city,
            zip,
            country,
            phone,
        } = req.body;

        const userId = req.user.userId;


        console.log(`user id : ${userId}`);

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: 'No order items provided' });
        }

        const orderItemsIds = await Promise.all(
            orderItems.map(async (orderItem) => {
                const newOrderItem = new OrderItem({ quantity: orderItem.quantity, product: orderItem.product });
                const savedOrderItem = await newOrderItem.save();
                return savedOrderItem._id;
            })
        );

        const orderItemsIdsResolved = await orderItemsIds;

        const totalPrices = await Promise.all(
            orderItemsIdsResolved.map(async (orderItemId) => {
                const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
                const totalPrice = orderItem.product.price * orderItem.quantity;
                return totalPrice
            })
        );

        const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

        // Step 3: Create and save the order
        const order = new Order({
            orderItems: orderItemsIds,
            shippingAddress1,
            shippingAddress2,
            city,
            zip,
            country,
            phone,
            totalPrice,
            user: userId,
        });

        const savedOrder = await order.save();
        res.status(201).json(savedOrder);


    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Failed to create product",
            error: err.message
        });
    }
};
// Create a new product
const getAllOrders = async (req, res) => {
    try {
        const userId = req.user.userId; // assuming req.user is set by auth middleware

        const orders = await Order.find({ user: userId })
            .populate('orderItems')          // optional: show order item details
            .populate({                       // optional: show product info inside order items
                path: 'orderItems',
                populate: {
                    path: 'product',
                    model: 'Product',
                    select: 'name price'
                }
            }).populate({
                path: 'user',
                model: 'User',
                select: 'name email id' // select only what you want to expose
            });

        res.status(200).json({
            success: true,
            data: orders,
            message: "User orders fetched successfully"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to get user orders",
            error: err.message
        });
    }
};

// Update order partially (PATCH)
const updateOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.userId;
        const updates = req.body;

        // List of allowed fields that can be updated
        const allowedUpdates = [
            'shippingAddress1',
            'shippingAddress2',
            'city',
            'zip',
            'country',
            'phone',
            'status'
        ];

        // Filter updates to only include allowed fields
        const filteredUpdates = Object.keys(updates).reduce((acc, key) => {
            if (allowedUpdates.includes(key)) {
                acc[key] = updates[key];
            }
            return acc;
        }, {});

        // Check if there are no valid updates
        if (Object.keys(filteredUpdates).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for update"
            });
        }

        // Find and update the order
        const order = await Order.findOneAndUpdate(
            { _id: orderId, user: userId }, // Ensure order belongs to user
            filteredUpdates,
            { new: true, runValidators: true } // Return updated document and run validators
        )
            .populate('orderItems')
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    model: 'Product',
                    select: 'name price'
                }
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found or you don't have permission to update it"
            });
        }

        res.status(200).json({
            success: true,
            data: order,
            message: "Order updated successfully"
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Failed to update order",
            error: err.message
        });
    }
};

// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.userId;

        // Find the order by ID and ensure it belongs to the requesting user
        const order = await Order.findOne({ _id: orderId, user: userId })
            .populate('orderItems')
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    model: 'Product',
                    select: 'name price description'
                }
            })
            .populate({
                path: 'user',
                model: 'User',
                select: 'name email phone'
            });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found or you don't have permission to view it"
            });
        }

        res.status(200).json({
            success: true,
            data: order,
            message: "Order fetched successfully"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to get order",
            error: err.message
        });
    }
};


module.exports = {
    makeAnOrder,
    getAllOrders,
    getOrderById,
    updateOrder
};