import { Medicine } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";
import { updateMedicineVal } from "./Medicine.validation.js";

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