const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads/ exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const sanitizeFilename = (name) =>
    name.replace(/[^a-zA-Z0-9.-]/g, '_'); // replace spaces & special chars

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const safeName = sanitizeFilename(file.originalname);
        cb(null, `${Date.now()}-${safeName}`);
    }
});

module.exports = multer({ storage });
