
const multer = require("multer");

const storage = multer.memoryStorage();

const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

function fileFilter(req, file, callback) {
    if (!allowedTypes.includes(file.mimetype)) {
        return callback(
            new Error("Only JPEG, PNG and WebP images are allowed")
        );
    }

    callback(null, true);
}

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    }
});

module.exports = upload;