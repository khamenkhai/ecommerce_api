const Product = require("../models/Product");
const Category = require("../models/category");


// Create a new product
const createProduct = async (req, res) => {
  try {
    console.log('BODY:', req.body); // Debug: Check what's actually received
    console.log('FILE:', req.file); // Debug: Check the uploaded file

    // Extract category ID (handles both form-data and raw JSON)
    const categoryId = req.body.category;
    if (!categoryId) {
      return res.status(400).json({ message: 'Category ID is required' });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Invalid Category' });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No image in the request' });
    }

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    // Create the product (handle both form-data and JSON)
    const productData = {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: `${basePath}${fileName}`,
      brand: req.body.brand,
      price: req.body.price,
      category: categoryId,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    };

    let product = new Product(productData);
    product = await product.save();

    if (!product) {
      return res.status(500).json({ message: 'The product cannot be created' });
    }

    res.status(201).json({
      success: true,
      message: "Product created successfully!",
      data: product,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to create product",
      error: err.message,
    });
  }
};

// Get all products with optional query parameters
const getAllProducts = async (req, res) => {
  try {
    // Example of adding filtering capability
    const { category, featured } = req.query;
    const query = {};

    if (category) query.category = category;
    if (featured) query.featured = featured === 'true';

    const products = await Product.find(query).populate('category');;

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
      error: err.message
    });
  }
};

// Get a single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id ${req.params.id}`
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format"
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while fetching product",
      error: err.message
    });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
        context: 'query' // Ensures proper validation context
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id ${req.params.id}`
      });
    }

    res.json({
      success: true,
      data: updatedProduct,
      message: "Product updated successfully"
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format"
      });
    }
    res.status(400).json({
      success: false,
      message: "Failed to update product",
      error: err.message
    });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: `Product not found with id ${req.params.id}`
      });
    }

    res.json({
      success: true,
      data: {},
      message: "Product deleted successfully"
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format"
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while deleting product",
      error: err.message
    });
  }
};

// Upload multiple images for a product
const uploadProductImages = async (req, res) => {
  try {
    const productId = req.params.id;
    const files = req.files; // Array of uploaded files

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }

    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    const imagesPaths = files.map(file => `${basePath}${file.filename}`);

    const product = await Product.findByIdAndUpdate(
      productId,
      {
        images: imagesPaths
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: product.images,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: err.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImages
};