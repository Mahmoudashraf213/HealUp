import { Medicine } from "../../../db/index.js";
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
        // createdBy: req.authUser._id,
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
    const { name, brand, category } = req.query;

    // Find the medicine by ID
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
        return next(new AppError(messages.medicine.notExist, 404));
    }

    // Create query for partial search using regex
    const query = {};
    if (name) {
        query.name = { $regex: name, $options: "i" }; 
    }
    if (brand) {
        query.brand = { $regex: brand, $options: "i" };
    }
    if (category) {
        query.category = { $regex: category, $options: "i" };
    }

    // If filters are applied, search with filters
    if (Object.keys(query).length > 0) {
        const filteredMedicine = await Medicine.find({
            _id: medicineId,
            ...query,
        });
        if (filteredMedicine.length === 0) {
            return next(new AppError(messages.medicine.failToFetch, 404));
        }

        return res.status(200).json({
            message: messages.medicine.fetchedSuccessfully,
            success: true,
            data: filteredMedicine,
        });
    }

    // If no filters are applied, return the basic medicine data
    return res.status(200).json({
        message: messages.medicine.fetchedSuccessfully,
        success: true,
        data: medicine,
    });
};

// Get all medicines with advanced filters
export const getAllMedicines = async (req, res, next) => {
    const {
      name,
      brand,
      category,
      minPrice,
      maxPrice,
      minStock,
      maxStock,
      expiryDate,
      manufacturer,
      batchNumber,
      dosage,
      prescriptionRequired,
    } = req.query;
  
    // Create a dynamic filter object based on query parameters
    const filter = {};
  
    if (name) {
      filter.name = { $regex: name, $options: "i" }; 
    }
    if (brand) {
      filter.brand = { $regex: brand, $options: "i" }; 
    }
    if (category) {
      filter.category = { $regex: category, $options: "i" }; 
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (minStock || maxStock) {
      filter.stock = {};
      if (minStock) filter.stock.$gte = Number(minStock);
      if (maxStock) filter.stock.$lte = Number(maxStock);
    }
    if (expiryDate) {
      filter.expiryDate = { $lte: new Date(expiryDate) }; 
    }
    if (manufacturer) {
      filter.manufacturer = manufacturer;
    }
    if (batchNumber) {
      filter.batchNumber = { $regex: batchNumber, $options: "i" }; 
    }
    if (dosage) {
      filter.dosage = { $regex: dosage, $options: "i" }; 
    }
    if (prescriptionRequired !== undefined) {
      filter.prescriptionRequired = prescriptionRequired === "true"; 
    }
  
    // Query the database with filters
    const medicines = await Medicine.find(filter);
  
    if (!medicines || medicines.length === 0) {
      let errorMessage = messages.medicine.failToFetch;
  
      if (name) {
        const nameCheck = await Medicine.find({ name: { $regex: name, $options: "i" } });
        if (nameCheck.length === 0) errorMessage = messages.medicine.noNameMatch(name);
      }
      if (brand) {
        const brandCheck = await Medicine.find({ brand: { $regex: brand, $options: "i" } });
        if (brandCheck.length === 0) errorMessage = messages.medicine.noBrandMatch(brand);
      }
      if (category) {
        const categoryCheck = await Medicine.find({ category: { $regex: category, $options: "i" } });
        if (categoryCheck.length === 0) errorMessage = messages.medicine.noCategoryMatch(category);
      }
      if (minPrice || maxPrice) {
        const priceCheck = await Medicine.find({ price: filter.price });
        if (priceCheck.length === 0) errorMessage = messages.medicine.noPriceMatch;
      }
      if (minStock || maxStock) {
        const stockCheck = await Medicine.find({ stock: filter.stock });
        if (stockCheck.length === 0) errorMessage = messages.medicine.noStockMatch;
      }
      if (expiryDate) {
        const expiryDateCheck = await Medicine.find({ expiryDate: { $lte: new Date(expiryDate) } });
        if (expiryDateCheck.length === 0) errorMessage = messages.medicine.noExpiryDateMatch(expiryDate);
      }
      if (manufacturer) {
        const manufacturerCheck = await Medicine.find({ manufacturer });
        if (manufacturerCheck.length === 0) errorMessage = messages.medicine.noManufacturerMatch(manufacturer);
      }
      if (batchNumber) {
        const batchNumberCheck = await Medicine.find({ batchNumber: { $regex: batchNumber, $options: "i" } });
        if (batchNumberCheck.length === 0) errorMessage = messages.medicine.noBatchNumberMatch(batchNumber);
      }
      if (dosage) {
        const dosageCheck = await Medicine.find({ dosage: { $regex: dosage, $options: "i" } });
        if (dosageCheck.length === 0) errorMessage = messages.medicine.noDosageMatch(dosage);
      }
      if (prescriptionRequired !== undefined) {
        const prescriptionRequiredCheck = await Medicine.find({ prescriptionRequired: prescriptionRequired === "true" });
        if (prescriptionRequiredCheck.length === 0) errorMessage = messages.medicine.noPrescriptionRequiredMatch(prescriptionRequired);
      }
  
      return next(new AppError(errorMessage, 404));
    }
  
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

  // Delete medicine by name or brand
export const deleteMedicineByNameOrBrand = async (req, res, next) => {
    const { name, brand } = req.query;
  
    // Build the filter dynamically
    const filter = {};
    if (name) {
      filter.name = { $regex: name, $options: "i" }; // Case-insensitive match
    }
    if (brand) {
      filter.brand = { $regex: brand, $options: "i" }; // Case-insensitive match
    }
  
    // Ensure at least one filter is provided
    if (Object.keys(filter).length === 0) {
      return next(new AppError(messages.medicine.noFilterProvided, 400));
    }
  
    // Find and delete the medicine
    const deletedMedicine = await Medicine.findOneAndDelete(filter);
  
    // Handle if no medicine is found
    if (!deletedMedicine) {
      return next(new AppError(messages.medicine.notExist, 404));
    }
  
    res.status(200).json({
      success: true,
      message: messages.medicine.deleted,
    });
  };