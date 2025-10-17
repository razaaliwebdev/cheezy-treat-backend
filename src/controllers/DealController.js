import Deal from "../models/DealModel.js";


// Create Deal Controller
export const createDeal = async (req, res) => {
    try {
        let image = req.body.image;
        if (req.file) {
            image = req.file.path;
        }
        const { name, description, items, basePrice, compareAtPrice, category, isAvailable, inStock } = req.body;

        if (!name || !description || !image || !items || !basePrice) {
            return res.status(400).json({
                success: false,
                message: "Name, description, image, items and basePrice are required fields.",
            });
        }

        let parsedItems = items;
        if (items) {
            try {
                parsedItems = JSON.parse(items);
            } catch (e) {
                return res.status(400).json({ success: false, message: "Invalid items format. Must be a valid JSON string." });
            }
        }

        const dealData = {
            name,
            description,
            image,
            items: parsedItems,
            basePrice,
            compareAtPrice,
            category,
            isAvailable,
            inStock,
            createdBy: req.user ? req.user._id : null
        };

        const deal = await Deal.create(dealData);

        return res.status(200).json({
            success: true,
            message: "Deal created successfully.",
            deal
        });
    } catch (error) {
        console.log("Failed to create deal.", error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
};

// Get All Deal Controller
export const getAllDeals = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "", category } = req.query;

        // Convert into integers
        const pageNumber = Number(page);
        const pageSize = Number(limit);

        // Build Dynamic Filter
        const query = { deletedAt: null };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.name = { $regex: search, $options: "i" }; // Case-insensitive search
        }

        // Count Total Documents
        const totalDeals = await Deal.countDocuments(query);

        // Fetch Paginated Data
        const deals = await Deal.find(query)
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

        return res.status(200).json({
            success: true,
            message: "Deals fetched successfully.",
            totalDeals,
            currentPage: pageNumber,
            totalPages: Math.ceil(totalDeals / pageSize),
            deals
        })

    } catch (error) {
        console.log("Failed to get all deals", error);
        return res.status(500).json({
            success: false,
            message: "Inrernal server error"
        })
    }
}


// Get Single Deal Controller
export const getSingleDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const deal = await Deal.findById(id);
        if (!deal) {
            return res.status(404).json({
                success: false,
                message: "Deal not found."
            })
        }

        return res.status(200).json({
            success: true,
            message: "Deal fetched successfully.",
            deal
        })

    } catch (error) {
        clg("Failed to fetch deal", error);
        return ress.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


// Update Deal Controller
export const updateDeal = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if req.body exists
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Request body is missing or invalid.",
            });
        }

        const {
            name,
            description,
            category,
            basePrice,
            compareAtPrice,
            isAvailable,
            inStock,
        } = req.body;

        // Prepare update data object
        const updateData = {};

        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (basePrice !== undefined) updateData.basePrice = basePrice;
        if (compareAtPrice !== undefined) updateData.compareAtPrice = compareAtPrice;
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
        if (inStock !== undefined) updateData.inStock = inStock;


        if (req.user?._id) {
            updateData.updatedBy = req.user._id;
        }

        if (req.file && req.files.length > 0) {
            updateData.image = req.file.path;
        }

        // Check if there's any data to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No data provided for update.",
            });
        }

        const deal = await Deal.findByIdAndUpdate(id, updateData, { new: true });
        if (!deal) {
            return res.status(404).json({
                success: false,
                message: "Deal not found."
            })
        }

        return res.status(200).json({
            success: true,
            message: "Deal updated successfully.",
            deal
        })

    } catch (error) {
        console.log("Failed to update deal", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


// Delete Deal Controller
export const deleteDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const deal = await Deal.findByIdAndDelete(id);
        if (!deal) {
            return res.status(404).json({
                success: false,
                message: "Deal not found."
            })
        }

        return res.status(200).json({
            success: true,
            message: "Deal deleted successfully."
        })

    } catch (error) {
        console.log("Failed to delete deal", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


