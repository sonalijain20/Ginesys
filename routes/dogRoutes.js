const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    uploadDog, getDog, listDogs, updateDog, deleteDog
} = require('../controllers/dogController');

router.use(auth);
router.post('/', upload.single('image'), uploadDog);
router.get('/:id', getDog);
router.get('/', listDogs);
router.put('/:id', upload.single('image'), updateDog);
router.delete('/:id', deleteDog);

module.exports = router;
