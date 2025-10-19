import User from '../models/userModel.js';

// Get All User . Admin can view all the users
export const getAllUsers = async (req, res) => {
    try {

        // Get query parameters for pagination from URL
        let { page = 1, limit = 10, search = "" } = req.query;

        // Convert page and limit to integers
        page = Number(page);
        limit = Number(limit);

        // Optional search filter (by name or email)
        const searchQuery = search ? {
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: "i" } }
            ]
        } : {};

        // Count total users (for pagination info)
        const totalUsers = await User.countDocuments(searchQuery);

        // Calulate how many to skip
        const skip = (page - 1) * limit;

        // Get users with skip and limit
        const users = await User.find(searchQuery)
            .skip(skip)
            .limit(limit)
            .select("-password") // Exclude password field
            .sort({ createdAt: -1 }); // Sort by creation date (newest first)

        return res.status(200).json({
            success: true,
            message: "All users fetched successfully",
            users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page
        })

    } catch (error) {
        console.log("Failed to get all the users", error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

// Get User profile
export const userProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            })
        }

        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                profileImage: user.profileImage,
                orders: user.orders
            }
        })

    } catch (error) {
        console.log("Failed to get user profile", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please log in again.",
            });
        }

        const updateData = {};

        // 🆕 FIXED: Name - optional
        if (req.body.name && req.body.name.trim() !== '') {
            updateData.name = req.body.name.trim();
        }

        // 🆕 FIXED: Phone - optional + VALIDATE
        if (req.body.phone && req.body.phone.trim() !== '') {
            const cleanPhone = req.body.phone.replace(/\D/g, ''); // Remove *
            if (cleanPhone.length === 10 && cleanPhone.startsWith('03')) {
                updateData.phone = cleanPhone;
            }
        }

        // 🆕 FIXED: Address - PARSE + ARRAY!
        if (req.body.address) {
            try {
                const addressObj = JSON.parse(req.body.address);
                // 🆕 CRITICAL: Wrap in ARRAY []
                updateData.address = [addressObj];
                // console.log('✅ Address array:', updateData.address);
            } catch (e) {
                console.log('❌ Address parse error:', e);
            }
        }

        // 🆕 Image - optional
        if (req.file) {
            updateData.profileImage = req.file.path;
        }

        // 🆕 No changes?
        if (Object.keys(updateData).length === 0) {
            return res.status(200).json({
                success: true,
                message: "ℹ️ No changes provided.",
                user: await User.findById(userId).select("-password")
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        return res.status(200).json({
            success: true,
            message: "🎉 Profile updated successfully.",
            user: updatedUser,
        });

    } catch (error) {
        console.error("❌ Profile update error:", error.message);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error.",
        });
    }
};