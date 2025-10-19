import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';



// Create Order Controller
export const createOrder = async (req, res) => {
    try {
        
        const userId = req.user?._id;
        if (!userId) {
            return res
                .status(401)
                .json({ success: false, message: "Unauthorized. Please login again." });
        }

        let {
            items,
            shippingAddress,
            phone,
            totalAmount,
            paymentMethod = "cod",
            paymentStatus = "pending",
            orderStatus = "preparing", // Default is correct spelling
            deliveryFee = 0,
            discount = 0,
        } = req.body;

        
        if (orderStatus === "prepairing") {
            console.log("DEBUG: Auto-correcting misspelled orderStatus from 'prepairing' to 'preparing'.");
            orderStatus = "preparing";
        }


        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Order items are required and must be a non-empty array",
            });
        }

        // 2️⃣ Create the order document
        const order = await Order.create({
            user: userId,
            items,
            shippingAddress,
            phone,
            totalAmount,
            paymentMethod,
            paymentStatus,
            orderStatus, // Using the (now corrected) variable
            deliveryFee,
            discount,
            createdBy: userId,
        });

        // 3️⃣ Push summary into user.orders array
        const pushObj = {
            orderId: order._id,
            status: order.orderStatus,
            totalAmount: order.totalAmount,
            // Map payment methods to align with User schema if necessary
            paymentMethod: order.paymentMethod === "online" ? "stripe" : order.paymentMethod,
            createdAt: order.createdAt,
        };

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $push: { orders: pushObj } },
            { new: true }
        );

        return res.status(201).json({
            success: true,
            message: "Order created successfully and user history updated.",
            order,
            userOrdersCount: updatedUser ? updatedUser.orders.length : undefined,
        });
    } catch (error) {
        console.error("❌ Failed to create order:", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};




// Get my Order Controller  loggedin user
export const getMyOrder = async (req, res) => {
    try {
        const orders = await Order.find(
            {
                user: req.user?._id,
                deletedAt: null
            }
        )
            .sort(({ createdAt: -1 }))
            .populate("items.product", "name images price") // optional: show product info
            .lean();

        return res.status(200).json(
            {
                success: true,
                message: "User's order get successfully",
                count: orders.length,
                orders
            }
        )

    } catch (error) {
        console.log("Failed to fetch user's orders");
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


// Get All Order Controller
export const getAllOrder = async (req, res) => {
    try {

        const { page = 1, limit = 10, search = "", status } = query;

        const pageNumber = Number(page);
        const pageSize = Number(limit)


        // Dynamic filter
        const query = { deletedAt: null }

        if (status) {
            query.orderStatus = status;
        };

        if (search) {
            query.name = { $regex: search, $options: "i" }; // Case-insensitive search
        }

        const totalOrders = await Order.countDocuments(query);

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);


        return res.status(200).json({
            success: true,
            message: "Products fetched successfully.",
            count: orders.length,
            totalPages: Math.ceil(totalOrders / pageSize),
            currentPage: pageNumber,
            orders,
        })


    } catch (error) {
        console.log("Failed to fetch all the orders", error);
        return res.status(500).json(
            {
                success: false,
                message: "Inter server error"
            }
        )
    }
}

// Cancel Order controller
export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findOneAndUpdate(
            {
                _id: id,
                user: req.user._id,
                orderStatus: { $nin: ["delivered", "cancelled"] },
            },
            {
                orderStatus: "cancelled",
                updatedBy: req.user._id,
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found or cannot be cancelled",
            });
        }

        // ✅ Sync status in user’s record
        await User.updateOne(
            { _id: req.user._id, "orders.orderId": id },
            { $set: { "orders.$.status": "cancelled" } }
        );

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order,
        });

    } catch (error) {
        console.error("❌ Cancel order error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}


// Get Single Order Controller
export const getSingleOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id)

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Order fetched successfully",
            order
        })
    } catch (error) {
        console.log("Failed get single order", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


// Update Order Controller
export const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Request body is missing or invalid"
            })
        };

        let { items, shippingAddress, phone, totalAmount, paymentMethod, paymentStatus, orderStatus, deliveryFee, discount } = req.body;

        // 🛠️ FIX 2: Correct the incoming typo if 'orderStatus' is provided
        if (orderStatus === "prepairing") {
            console.log("DEBUG: Auto-correcting misspelled orderStatus from 'prepairing' to 'preparing' during update.");
            orderStatus = "preparing";
        }

        const updateData = {};

        if (items !== undefined) updateData.items = items;
        if (shippingAddress !== undefined) updateData.shippingAddress = shippingAddress;
        if (phone !== undefined) updateData.phone = phone;
        if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
        if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
        if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
        if (orderStatus !== undefined) updateData.orderStatus = orderStatus;
        if (deliveryFee !== undefined) updateData.deliveryFee = deliveryFee;
        if (discount !== undefined) updateData.discount = discount;

        // Add updatedBy if user exists
        if (req.user?._id) {
            updateData.updatedBy = req.user._id;
        }

        // Check if there's any data to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No data provided for update.",
            });
        }

        // 🛑 CRITICAL FIX 1: Changed Product.findByIdAndUpdate to Order.findByIdAndUpdate
        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found.",
            });
        }

        // ✅ Sync user’s embedded order info
        await User.updateOne(
            { _id: updatedOrder.user, "orders.orderId": updatedOrder._id },
            {
                $set: {
                    "orders.$.status": updatedOrder.orderStatus,
                    "orders.$.totalAmount": updatedOrder.totalAmount,
                    "orders.$.paymentMethod": updatedOrder.paymentMethod,
                },
            }
        );

        return res.status(200).json({
            success: true,
            message: "Order updated successfully.",
            updatedOrder,
        });

    } catch (error) {
        console.log("Failed to update order", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


// Delete Order Controller
export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findByIdAndDelete(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }
        return res.status(200).json({
            success: true,
            message: "Order deleted successfully",
            order
        })
    } catch (error) {
        console.log("Failed to delete order", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


