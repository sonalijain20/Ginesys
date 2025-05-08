const fs = require('fs');
const path = require('path');
const dbConnection = require("../config/dbConnection");


// TODO: Images can be saved on cloud storage like AWs S#, cloudinary instead of local disk storage
/**
 * Handles uploading of the image.
 *
 * Extracts image metadata from the uploaded file and saves it to the database
 * along with the user ID of the logged-in user.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.file - File object provided by Multer middleware
 * @param {string} req.file.originalname - Original file name of the uploaded image
 * @param {string} req.file.mimetype - MIME type of the uploaded image
 * @param {string} req.file.path - File system path where the image is stored
 * @param {number} req.user.id - ID of the authenticated user
 * @param {Object} res - Express response object
 * @returns {Object} JSON response indicating upload success or failure
 */
exports.uploadDog = async (req, res) => {
    try {
        const { originalname, mimetype, path: filePath } = req.file;
        await dbConnection.query('INSERT INTO dog_images (name, image_path, content_type, user_id) VALUES (?, ?, ?, ?)', [
            originalname, filePath, mimetype, req.user.id
        ]);
        res.status(201).json({ message: 'Dog image uploaded' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch images' });
    }
};

/**
 * Updates an existing image.
 *
 * Deletes the old image file from disk, replaces it with the new uploaded image,
 * and updates the metadata in the database.
 *
 * @param {Object} req - Express request object
 * @param {Object} req.params - Route parameters
 * @param {string} req.params.id - ID of the dog image to update
 * @param {Object} req.file - Uploaded file object (from Multer)
 * @param {string} req.file.originalname - Original file name of the new image
 * @param {string} req.file.mimetype - MIME type of the new image
 * @param {string} req.file.path - File system path of the new image
 * @param {Object} res - Express response object
 * @returns {Object} JSON response indicating success or failure
 */
exports.updateDog = async (req, res) => {
    try {
        const { id } = req?.params;
        if (!id)
            return res.status(400).json({ error: 'Please mention image ID' });

        const [existing] = await dbConnection.query('SELECT * FROM dog_images WHERE id = ?', [id]);
        if (!existing.length)
            return res.status(404).json({ error: 'Dog image not found' });

        fs.unlinkSync(existing[0].image_path);
        const { originalname, mimetype, path: filePath } = req.file;

        await dbConnection.query('UPDATE dog_images SET name = ?, image_path = ?, content_type = ? WHERE id = ?', [
            originalname, filePath, mimetype, id
        ]);
        res.json({ message: 'Dog image updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update image.' });

    }
};


/**
 * Retrieves a paginated list of images uploaded by the logged-in user.
 *
 * Uses query parameters for pagination (`page` and `limit`) and returns metadata
 * including total record count along with image records.
 *
 * @param {Object} req - Express request object
 * @param {string} [req.query.page] - Page number (defaults to 1)
 * @param {string} [req.query.limit] - Number of items per page (defaults to 10)
 * @param {number} req.user.id - ID of the logged-in user
 * @param {Object} res - Express response object
 * @returns {Object} JSON object with pagination metadata and list of dog images
 */
exports.listDogs = async (req, res) => {
    try {
        const userId = req?.user?.id;
        const page = parseInt(req.query?.page) || 1;
        const limit = parseInt(req.query?.limit) || 10;
        const offset = (page - 1) * limit;
        // Fetch total count for pagination metadata
        const [[{ total }]] = await dbConnection.query(
            'SELECT COUNT(*) as total FROM dog_images WHERE user_id = ?',
            [userId]
        );

        // Fetch paginated records
        const [rows] = await dbConnection.query(
            'SELECT id, name, image_path FROM dog_images WHERE user_id = ? LIMIT ? OFFSET ?',
            [userId, limit, offset]
        );

        res.json({
            page,
            limit,
            total,
            data: rows
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch images' });
    }
};


/**
 * Retrieves a specific image by ID, only if it belongs to the logged-in user.
 *
 * Performs authorization check to ensure users can only access their own uploaded images.
 * Sends the image file as a response if found and authorized.
 *
 * @param {Object} req - Express request object
 * @param {string} req.params.id - ID of the image to fetch
 * @param {number} req.user.id - ID of the logged-in user
 * @param {Object} res - Express response object
 * @returns {File|Object} The image file as a response, or a JSON error message
 */
exports.getDog = async (req, res) => {
    try {
        const userId = req?.user?.id;
        const dogId = req?.params?.id;

        const [rows] = await dbConnection.query('SELECT * FROM dog_images WHERE id = ?', [dogId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Dog image not found.' });
        }

        const dog = rows[0];

        if (dog?.user_id !== userId) {
            return res.status(403).json({ error: 'You are not authorized to access this image.' });
        }

        res.sendFile(path.resolve(dog.image_path));
    } catch (err) {
        res.status(500).json({ error: 'Failed to retrieve dog image.' });
    }
};


/**
 * Deletes a specific image from both the database and the file system.
 *
 * Ensures that the logged-in user is the owner of the image before deletion.
 *
 * @param {Object} req - Express request object
 * @param {string} req.params.id - ID of the image to delete
 * @param {number} req.user.id - ID of the logged-in user
 * @param {Object} res - Express response object
 * @returns {Object} JSON response indicating success or error
 */
exports.deleteDog = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const [results] = await dbConnection.query('SELECT * FROM dog_images WHERE id = ?', [id]);
        const dog = results[0];

        if (!dog) {
            return res.status(404).json({ error: 'Dog image not found' });
        }

        if (dog.user_id !== userId) {
            return res.status(403).json({ error: 'You are not authorizeds to delete this dog image' });
        }

        await dbConnection.query('DELETE FROM dog_images WHERE id = ?', [id]);
        fs.unlinkSync(path.resolve(dog.image_path));
        res.json({ message: 'Dog image deleted' });
    } catch (err) {
        return res.status(500).json({ error: 'Failed to delete image file' });
    }
};
