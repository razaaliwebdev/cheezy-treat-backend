import User from '../models/userModel.js';

// Get All User . Admin can view all the users
export const getAllUsers = async (req, res) => {
    try {

        // Get query parameters for pagination from URL
        let { page = 1, limit = 10 } = req.query;

        // Convert page and limit to integers
        page = Number(page);
        limit = Number(limit);

        // Optional search filter (by name or email)
        const searchQuery = searc ? {
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
        const user = req.user;
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            })
        };

        return res.status(200).json({
            success: true,
            message: "Get user's profile successfully",
            user
        })
    } catch (error) {
        console.log("Failed to get user's profile.", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


// Edit User profile
export const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please log in again.",
            });
        }

        // Whitelist allowed fields
        const allowedFields = ["name", "phone", "address"];
        const updateData = {};

        for (const key of allowedFields) {
            if (req.body[key] !== undefined) {
                updateData[key] = req.body[key];
            }
        }

        // Optional: Handle uploaded image via Multer + Cloudinary
        if (req.file) {
            updateData.profileImage = req.file.path; // Cloudinary URL or local path
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            user: updatedUser,
        });
    } catch (error) {
        console.error("❌ Profile update error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
        });
    }
};
