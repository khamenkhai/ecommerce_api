const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImages
} = require("../controllers/product_controller.js");

const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error('invalid image type');

    if (isValid) {
      uploadError = null
    }
    cb(uploadError, 'public/uploads')
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(' ').join('-');
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`)
  }
});


const uploadOptions = multer({ storage: storage })

// Create a product
router.post("/", uploadOptions.single('image'), createProduct);

// Get all products
router.get("/", getAllProducts);

// Get a single product by ID
router.get("/:id", getProductById);

// Update a product
router.put("/:id", updateProduct);

// Delete a product
router.delete("/:id", deleteProduct);

router.put("/images/:id", uploadOptions.array('images', 10), uploadProductImages);

module.exports = router;
