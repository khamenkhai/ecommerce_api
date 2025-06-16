const Category = require('../models/category');

// Get all categories
const getCategories = async (req, res) => {
  try {
    // Add optional query parameters for filtering
    const { name, featured } = req.query;
    const query = {};
    
    if (name) query.name = { $regex: name, $options: 'i' }; // Case-insensitive search
    if (featured) query.featured = featured === 'true';
    
    const categories = await Category.find(query).select('-__v'); // Exclude version key
    
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error while fetching categories",
      error: err.message
    });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).select('-__v');
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: `Category not found with id ${req.params.id}`
      });
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format"
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while fetching category",
      error: err.message
    });
  }
};

// Create a new category
const createCategory = async (req, res) => {
  const { name, icon, color } = req.body;

  // Basic validation
  if (!name || !icon || !color) {
    return res.status(400).json({
      success: false,
      message: "Name, icon and color are required"
    });
  }

  try {
    const category = new Category({
      name,
      icon,
      color
    });

    const savedCategory = await category.save();
    
    res.status(201).json({
      success: true,
      data: savedCategory,
      message: "Category created successfully"
    });
  } catch (err) {
    if (err.code === 11000) { // Duplicate key error
      return res.status(400).json({
        success: false,
        message: "Category name must be unique"
      });
    }
    res.status(400).json({
      success: false,
      message: "Failed to create category",
      error: err.message
    });
  }
};

// Update a category
const updateCategory = async (req, res) => {
  try {
    const { name, icon, color } = req.body;
    const updateFields = {};
    
    if (name !== undefined) updateFields.name = name;
    if (icon !== undefined) updateFields.icon = icon;
    if (color !== undefined) updateFields.color = color;

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateFields,
      {
        new: true,
        runValidators: true,
        context: 'query'
      }
    ).select('-__v');

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: `Category not found with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: updatedCategory,
      message: "Category updated successfully"
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format"
      });
    }
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category name must be unique"
      });
    }
    res.status(400).json({
      success: false,
      message: "Failed to update category",
      error: err.message
    });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);
    
    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: `Category not found with id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: "Category deleted successfully"
    });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format"
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while deleting category",
      error: err.message
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};