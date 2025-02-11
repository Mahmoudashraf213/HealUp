import cloudinary from "../../utils/cloud.js";
import { Medicine } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import { deleteCloudImage } from "../../utils/cloud.js";
import { deleteFile } from "../../utils/file-functions.js";

// Add Medicine
export const addMedicine = async (req, res, next) => {
  // Get data from request body
  const {
    name,
    brand,
    category,
    price,
    stock,
    expiryDate,
    manufacturer,
    batchNumber,
    dosage,
    prescriptionRequired,
    description,
  } = req.body;

  // Convert name and brand to lowercase for consistency
  const formattedName = name.toLowerCase();
  const formattedBrand = brand.toLowerCase();

  // Check if the medicine already exists
  const existingMedicine = await Medicine.findOne({
    name: formattedName,
    brand: formattedBrand,
    batchNumber,
  });
  if (existingMedicine) {
    return next(new AppError(messages.medicine.alreadyExist, 400));
  }

  // Handle image upload
  let Image = { secure_url: "", public_id: "" };
  if (req.files?.Image) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.Image[0].path,
      { folder: "healup/medicine" }
    );
    Image = { secure_url, public_id };
    req.failImages = [public_id]; // Store for rollback
  }

  // Prepare medicine data
  const medicine = new Medicine({
    name: formattedName,
    brand: formattedBrand,
    category,
    price,
    stock,
    expiryDate,
    manufacturer,
    batchNumber,
    dosage,
    prescriptionRequired,
    description,
    Image,
    createdBy: req.authUser._id,
  });

  // Save the new medicine
  const newMedicine = await medicine.save();
  if (!newMedicine) {
    if (req.files?.Image) {
      await deleteCloudImage(req.failImages[0]); // Rollback if save fails
    }
    return next(new AppError(messages.medicine.failToCreate, 500));
  }

  // Send response
  res.status(201).json({
    success: true,
    message: messages.medicine.created,
    data: newMedicine,
  });
};

// update medicine
export const updateMedicine = async (req, res, next) => {
  // Get medicineId from params
  const { medicineId } = req.params;
  const {
    name,
    brand,
    category,
    price,
    stock,
    expiryDate,
    manufacturer,
    batchNumber,
    dosage,
    prescriptionRequired,
    description,
  } = req.body;

  // Convert name and brand to lowercase for consistency (if provided)
  const formattedName = name ? name.toLowerCase() : undefined;
  const formattedBrand = brand ? brand.toLowerCase() : undefined;

  // Check if the medicine exists
  const medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    return next(new AppError(messages.medicine.notExist, 404));
  }

  // Check for duplicate medicine (excluding current one)
  if (formattedName && formattedBrand && batchNumber) {
    const existingMedicine = await Medicine.findOne({
      name: formattedName,
      brand: formattedBrand,
      batchNumber,
      _id: { $ne: medicineId },
    });
    if (existingMedicine) {
      return next(new AppError(messages.medicine.alreadyExist, 400));
    }
  }

  req.failImages = [];

  // **Update Medicine Image on Cloudinary**
  if (req.files?.Image) {
    try {
      // Delete old image if exists
      if (medicine.Image && medicine.Image.public_id) {
        await deleteCloudImage(medicine.Image.public_id);
      }

      // Upload new image
      const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.Image[0].path, {
        folder: "healup/medicine",
      });

      // Assign new image
      medicine.Image = { secure_url, public_id };
      req.failImages.push(public_id);
    } catch (error) {
      // Rollback file system
      if (req.files.Image[0]?.path) {
        deleteFile(req.files.Image[0].path);
      }

      // Rollback Cloudinary
      if (req.failImages.length > 0) {
        for (const public_id of req.failImages) {
          await deleteCloudImage(public_id);
        }
      }

      return next(new AppError(messages.medicine.failToUpdate, 500));
    }
  }

  // **Update Other Fields If Provided**
  if (formattedName) medicine.name = formattedName;
  if (formattedBrand) medicine.brand = formattedBrand;
  if (category) medicine.category = category;
  if (price !== undefined) medicine.price = price;
  if (stock !== undefined) medicine.stock = stock;
  if (expiryDate) medicine.expiryDate = expiryDate;
  if (manufacturer) medicine.manufacturer = manufacturer;
  if (batchNumber) medicine.batchNumber = batchNumber;
  if (dosage) medicine.dosage = dosage;
  if (prescriptionRequired !== undefined) medicine.prescriptionRequired = prescriptionRequired;
  if (description) medicine.description = description;

  // Update last modified user
  medicine.updatedBy = req.authUser._id;

  // **Save Updated Medicine**
  const updatedMedicine = await medicine.save();
  if (!updatedMedicine) {
    return next(new AppError(messages.medicine.failToUpdate, 500));
  }

  // **Send Response**
  return res.status(200).json({
    message: messages.medicine.updated,
    success: true,
    data: updatedMedicine,
  });
};


// get specific medicine
export const getSpecificMedicine = async (req, res, next) => {
  const { medicineId } = req.params;

  // Find the medicine by ID
  const medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    return next(new AppError(messages.medicine.notExist, 404));
  }

  // Return the medicine data
  return res.status(200).json({
    message: messages.medicine.fetchedSuccessfully,
    success: true,
    data: medicine,
  });
};

// Get all medicines with advanced filters
export const getAllMedicines = async (req, res, next) => {
  const { name, brand, category } = req.query;

  // Create a dynamic filter object based on query parameters
  const filter = {};

  // Check for "name", "brand", or "category"
  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }
  if (brand) {
    filter.brand = { $regex: brand, $options: "i" };
  }
  if (category) {
    filter.category = { $regex: category, $options: "i" };
  }

  // Query the database using the filters
  const medicines = await Medicine.find(filter);

  // If no medicines are found
  if (!medicines || medicines.length === 0) {
    let noMatchMessage = messages.medicine.failToFetch;

    if (name) {
      noMatchMessage = messages.medicine.noNameMatch(name);
    } else if (brand) {
      noMatchMessage = messages.medicine.noBrandMatch(brand);
    } else if (category) {
      noMatchMessage = messages.medicine.noCategoryMatch(category);
    }

    return next(new AppError(noMatchMessage, 404));
  }

  // Return the data
  res.status(200).json({
    success: true,
    message: messages.medicine.fetchedSuccessfully,
    count: medicines.length,
    data: medicines,
  });
};

// Delete medicine by ID
export const deleteMedicineById = async (req, res, next) => {
  const { medicineId } = req.params;

  // Ensure medicineId is provided
  if (!medicineId) {
    return next(new AppError(messages.medicine.noIdProvided, 400));
  }

  // Find the medicine by ID
  const medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    return next(new AppError(messages.medicine.notExist, 404));
  }

  // Delete the associated image from Cloudinary (if exists)
  if (medicine.Image?.public_id) {
    await deleteCloudImage(medicine.Image.public_id);
  }

  // Delete the medicine from the database
  const deletedMedicine = await Medicine.findByIdAndDelete(medicineId);
  if (!deletedMedicine) {
    return next(new AppError(messages.medicine.failToDelete, 500));
  }

  // Send response
  res.status(200).json({
    success: true,
    message: messages.medicine.deleted,
    // data: deletedMedicine,
  });
};
