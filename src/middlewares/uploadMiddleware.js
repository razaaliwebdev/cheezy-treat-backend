import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';


// Cloudinary Configuration
cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    }
);

// Configure Storage
const storage = new CloudinaryStorage(
    {
        cloudinary: cloudinary,
        params: {
            folder: "cheezytreat",
            allowed_formats: ["jpg", "png", "jpg", "webp"],
            //  transformation: [{ width: 400, height: 400, crop: "fill" }],
        }
    }
);

export const upload = multer({ storage });


