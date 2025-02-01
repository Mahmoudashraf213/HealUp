import { Medicine } from "../../../db/index.js";
import { ApiFeature } from "../../utils/apiFeatures.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";

// add medicine
export const addMedicine = async (req, res, next) => {
    // get data from request body
    const { name, brand, category, price, stock, expiryDate, manufacturer, batchNumber, dosage, prescriptionRequired } = req.body;
  
    // convert name and brand to lowercase for consistency
    const formattedName = name.toLowerCase();
    const formattedBrand = brand.toLowerCase();
  
    // check if the medicine already exists
    const existingMedicine = await Medicine.findOne({ name: formattedName, brand: formattedBrand, batchNumber });
    if (existingMedicine) {
        return next(new AppError(messages.medicine.alreadyExist, 400));
    }
  
    // prepare medicine data
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
        createdBy: req.authUser._id,
    });

    // save the new medicine
    const newMedicine =  await medicine.save();

    // handle fail
    if (!newMedicine) {
        return next(new AppError(messages.medicine.failToCreate, 500));
    }

    // send response
    res.status(201).json({
        success: true,
        message: messages.medicine.created,
        data: newMedicine
    });
};

// update medicine
export const updateMedicine = async (req, res, next) => {
    // get medicineId from params
    const { medicineId } = req.params;
    const { name, brand, category, price, stock, expiryDate, manufacturer, batchNumber, dosage, prescriptionRequired } = req.body;

    // convert name and brand to lowercase for consistency (if provided)
    const formattedName = name ? name.toLowerCase() : undefined;
    const formattedBrand = brand ? brand.toLowerCase() : undefined;

    // check if the medicine exists
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
        return next(new AppError(messages.medicine.notExist, 404));
    }

    // check if a medicine with the same name, brand, and batchNumber already exists (excluding current medicine)
    if (formattedName && formattedBrand && batchNumber) {
        const existingMedicine = await Medicine.findOne({
            name: formattedName,
            brand: formattedBrand,
            batchNumber,
            _id: { $ne: medicineId }
        });
        if (existingMedicine) {
            return next(new AppError(messages.medicine.alreadyExist, 400));
        }
    }

    // update fields if provided
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

    // save updated medicine
    const updatedMedicine = await medicine.save();

    // handle failure
    if (!updatedMedicine) {
        return next(new AppError(messages.medicine.failToUpdate, 500));
    }

    // send response
    return res.status(200).json({
        message: messages.medicine.updated,
        success: true,
        data: updatedMedicine
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
  
    // Find and delete the medicine by ID
    const deletedMedicine = await Medicine.findByIdAndDelete(medicineId);
  
    // Handle if no medicine is found
    if (!deletedMedicine) {
      return next(new AppError(messages.medicine.notExist, 404));
    }
  
    res.status(200).json({
      success: true,
      message: messages.medicine.deleted,
    });
  };
