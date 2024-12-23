// Importing the Multer library for handling file uploads
import multer from "multer";

// Configuring the storage settings for Multer
const storage = multer.diskStorage({
    // Specifies the destination where uploaded files will be stored temporarily
    destination: function (req, res, cb) {
        cb(null, "./public/temp"); // Files will be saved in the "./public/temp" directory
    },
    // Specifies the filename for the uploaded file
    filename: function (req, file, cb) {
        cb(null, file.originalname); // The uploaded file retains its original name
    },
});

// Export the configured Multer middleware for use in routes
export const upload = multer({ storage: storage });
