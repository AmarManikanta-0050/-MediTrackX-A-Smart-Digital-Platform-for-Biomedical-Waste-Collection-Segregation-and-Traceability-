import WasteCategory from '../models/WasteCategory.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getCategories = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const categories = await WasteCategory.find(query).sort({ name: 1 });
    return successResponse(res, 200, 'Waste categories retrieved.', categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const category = await WasteCategory.findById(req.params.id);
    if (!category) {
      return errorResponse(res, 404, 'Category not found.');
    }
    return successResponse(res, 200, 'Waste category retrieved.', category);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, code, description, recommendedContainer, colorCode, hazardLevel, status } = req.body;

    const existingCode = await WasteCategory.findOne({ code: code?.toUpperCase() });
    if (existingCode) {
      return errorResponse(res, 400, `Category with code '${code}' already exists.`);
    }

    const category = await WasteCategory.create({
      name,
      code: code?.toUpperCase(),
      description,
      recommendedContainer,
      colorCode: colorCode || '#0D9488',
      hazardLevel: hazardLevel || 'Medium',
      status: status || 'active',
    });

    return successResponse(res, 201, 'Waste category created successfully.', category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    let category = await WasteCategory.findById(req.params.id);
    if (!category) {
      return errorResponse(res, 404, 'Category not found.');
    }

    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
    }

    category = await WasteCategory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, 200, 'Waste category updated successfully.', category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const category = await WasteCategory.findById(req.params.id);
    if (!category) {
      return errorResponse(res, 404, 'Category not found.');
    }

    await WasteCategory.findByIdAndDelete(req.params.id);
    return successResponse(res, 200, 'Waste category deleted.');
  } catch (error) {
    next(error);
  }
};
