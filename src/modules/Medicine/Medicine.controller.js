import { Medicine } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";

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
        return next(new AppError('Medicine with the same name and brand already exists, please choose a different name', 400));
    }
  
    // prepare medicine data
    const newMedicine = new Medicine({
        name: formattedName,
        brand: formattedBrand,
        category,
        price,
        stock,
        expiryDate,
        manufacturer,
        batchNumber,
        dosage,
        prescriptionRequired
    });

    // save the new medicine
    await newMedicine.save();

    res.status(201).json({
        success: true,
        message: 'Medicine added successfully',
        data: newMedicine
    });
};