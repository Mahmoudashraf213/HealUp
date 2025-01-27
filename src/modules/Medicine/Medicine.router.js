import { Router } from "express";
import { isValid } from "../../middleware/validation.js";
import { addMedicineVal, deleteMedicineByIdVal,  deleteMedicineByNameBrandVal,  getAllMedicineVal, getMedicineVal, updateMedicineVal } from "./Medicine.validation.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { addMedicine, deleteMedicineById, deleteMedicineByNameOrBrand, getAllMedicines, getSpecificMedicine, updateMedicine } from "./Medicine.controller.js";



const MedicineRouter = Router();

// add medicine
MedicineRouter.post('/',
isValid(addMedicineVal),
asyncHandler(addMedicine)
  // todo Authenticated , Authorized , role ;
)
 

// update medicine
MedicineRouter.put('/:medicineId',
  isValid (updateMedicineVal),
 asyncHandler(updateMedicine)
   // todo Authenticated , Authorized , role ;
)  

// get specific medicine
MedicineRouter.get('/:medicineId',
   isValid (getMedicineVal),
   asyncHandler(getSpecificMedicine)
    // todo Authenticated , Authorized , role ;
)

// get all medicine
MedicineRouter.get('/', 
  isValid (getAllMedicineVal),
  asyncHandler (getAllMedicines),
  // todo Authenticated , Authorized , role ;
)

// delete medicine by id 
MedicineRouter.delete('/:medicineId',
  isValid (deleteMedicineByIdVal),
  asyncHandler (deleteMedicineById)
  // todo Authenticated , Authorized , role ;
)

// delete medicine by name , brand
MedicineRouter.delete('/',
  isValid (deleteMedicineByNameBrandVal) ,
  asyncHandler (deleteMedicineByNameOrBrand),
  // todo Authenticated , Authorized , role ;
)

export default MedicineRouter;