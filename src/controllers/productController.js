import Product from "../models/productModel.js";

// Create Product Controller
export const createProduct = async (req, res) => {
    try {
        // console.log('=== CONTROLLER DEBUG ===');
        // console.log('Request files in controller:', req.files);
        // console.log('Request body in controller:', req.body);

        const {
            name,
            description,
            category,
            basePrice,
            compareAtPrice,
            sizes,
            tags,
            isAvailable,
            inStock,
        } = req.body;

        // Validation
        if (!name || !category || !basePrice) {
            return res.status(400).json({
                success: false,
                message: "Name, category, and basePrice are required fields.",
            });
        }

        // Handle Cloudinary uploaded images
        let imagesUrls = [];
        if (req.files && req.files.length > 0) {
            // console.log('Processing files:', req.files);

            imagesUrls = req.files.map((file) => {
                // console.log('File details:', file);
                return {
                    url: file.path, // Cloudinary URL
                    public_id: file.filename // Cloudinary public_id
                };
            });

            // console.log('Processed image URLs:', imagesUrls);
        } else {
            console.log('No files found in req.files');
        }

        // Parse sizes if provided
        let parsedSizes = [];
        if (sizes) {
            try {
                parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
            } catch (parseError) {
                console.error('Error parsing sizes:', parseError);
                return res.status(400).json({
                    success: false,
                    message: "Invalid sizes format. Please provide valid JSON.",
                });
            }
        }

        // Parse tags
        const parsedTags = tags ? (typeof tags === 'string' ? tags.split(",") : tags) : [];

        const product = await Product.create({
            name,
            description: description || "",
            category,
            basePrice: Math.round(parseFloat(basePrice) * 100), // Convert to cents
            compareAtPrice: compareAtPrice ? Math.round(parseFloat(compareAtPrice) * 100) : 0,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
            inStock: inStock || "available",
            images: imagesUrls,
            sizes: parsedSizes,
            tags: parsedTags,
        });

        // console.log('Product created successfully:', product);

        return res.status(201).json({
            success: true,
            message: "Product created successfully.",
            product,
        });
    } catch (error) {
        console.log("Failed to create product", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};


// Get All Products Controller
export const getAllProducts = async (req, res) => {
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
        const totalProducts = await Product.countDocuments(query);

        // Fetch Paginated Data
        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

        return res.status(200).json({
            success: true,
            message: "Products fetched successfully.",
            count: products.length,
            totalPages: Math.ceil(totalProducts / pageSize),
            currentPage: pageNumber,
            products,
        });
    } catch (error) {
        console.log("Failed to fetch all products", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};

// Get Single Product Controller
export const getSingleProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product fetched successfully.",
            product,
        });
    } catch (error) {
        console.log("Failed to fetch product", error);
        return res
            .status(500)
            .json({ success: false, message: "Internal server error" });
    }
};

// Update Product Controller
export const updateProduct = async (req, res) => {
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
            sizes,
            tags,
            isAvailable,
            inStock,
        } = req.body;

        // Prepare update data object
        const updateData = {};

        // Only add fields to updateData if they are provided
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (category !== undefined) updateData.category = category;
        if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
        if (compareAtPrice !== undefined) updateData.compareAtPrice = parseFloat(compareAtPrice);
        if (tags !== undefined) updateData.tags = tags;
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
        if (inStock !== undefined) updateData.inStock = inStock;

        // Add updatedBy if user exists
        if (req.user?._id) {
            updateData.updatedBy = req.user._id;
        }

        // ✅ If new images are uploaded
        if (req.files && req.files.length > 0) {
            const imageUrls = req.files.map((file) => ({
                url: file.path,
                public_id: file.filename
            }));
            updateData.images = imageUrls;
        }

        // ✅ If sizes provided as string (from JSON)
        if (sizes) {
            try {
                updateData.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
            } catch (parseError) {
                console.error('Error parsing sizes:', parseError);
                return res.status(400).json({
                    success: false,
                    message: "Invalid sizes format. Please provide valid JSON.",
                });
            }
        }

        // Check if there's any data to update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No data provided for update.",
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully.",
            product: updatedProduct,
        });
    } catch (error) {
        console.log("Failed to update product", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

//  Delete Product Controller
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // ✅ CORRECT WAY: Find + Update (Soft Delete)
        const product = await Product.findByIdAndUpdate(
            id,
            {
                deletedAt: new Date(),
                isAvailable: false,
                inStock: "unavailable"
            },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully.",
            data: { id: product._id }
        });

    } catch (error) {
        console.log("❌ Failed to delete product", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
