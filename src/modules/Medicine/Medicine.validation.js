import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const addMedicineVal =  joi.object({
    name: generalFields.name.required(),
    brand: generalFields.brand.required(),
    category: generalFields.category.required(),
    price: generalFields.price.required(),
    stock: generalFields.stock.required(),
    expiryDate: generalFields.expiryDate.required(),
    manufacturer: generalFields.manufacturer.required(),
    batchNumber: generalFields.batchNumber.required(),
    dosage: generalFields.dosage.required(),
    prescriptionRequired: generalFields.prescriptionRequired.required(),
    description: generalFields.description,
  });
  
  export const updateMedicineVal = joi.object({
    medicineId: generalFields.objectId.required(),
    name: generalFields.name.optional(),
    brand: generalFields.brand.optional(),
    category: generalFields.category.optional(),
    price: generalFields.price.optional(),
    stock: generalFields.stock.optional(),
    expiryDate: generalFields.expiryDate.optional(),
    manufacturer: generalFields.manufacturer.optional(),
    batchNumber: generalFields.batchNumber.optional(),
    dosage: generalFields.dosage.optional(),
    prescriptionRequired: generalFields.prescriptionRequired.optional(),
    description: generalFields.description.optional(),
  })

  // get specific medicine
  export const getMedicineVal = joi.object({
    medicineId: generalFields.objectId.required(),
    name: generalFields.name.optional(), 
    brand: generalFields.brand.optional(),
    category: generalFields.category.optional(),
  })

  // get all medicine 
  export const getAllMedicineVal = joi.object({
    name: generalFields.name.optional(), 
    brand: generalFields.brand.optional(),
    category: generalFields.category.optional(),
    minPrice : generalFields.price.optional(),
    maxPrice : generalFields.price.optional(),
    minStock : generalFields.stock.optional(),
    maxStock : generalFields.stock.optional(),
    expiryDate : generalFields.expiryDate.optional(),
    manufacturer : generalFields.manufacturer.optional(),
    batchNumber : generalFields.batchNumber.optional(),
    dosage : generalFields.dosage.optional(),
    prescriptionRequired : generalFields.prescriptionRequired.optional(),
  })

  // delete medicine by id
  export const deleteMedicineByIdVal = joi.object({
    medicineId: generalFields.objectId.required(),
    name: generalFields.name.optional(), 
    brand: generalFields.brand.optional(),
  })

