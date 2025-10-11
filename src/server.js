import app from './app.js';
import connectDB from './config/db.js';


// Server && Database
connectDB().then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
        console.log(`Server is running on the PORT:${PORT}`);
    })
}).catch((error) => {
    console.log("Database connection failed", error);
})

