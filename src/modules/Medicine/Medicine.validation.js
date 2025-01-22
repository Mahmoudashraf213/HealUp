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
  });
  