const Product = require("../models/Product");

// Create a new product
const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json({
      success: true,
      data: savedProduct,
      message: "Product created successfully"
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: "Failed to create product",
      error: err.message
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

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};