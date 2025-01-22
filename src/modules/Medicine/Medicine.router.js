import { Router } from "express";
import { isValid } from "../../middleware/validation.js";
import { addMedicineVal, updateMedicineVal } from "./Medicine.validation.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { addMedicine, updateMedicine } from "./Medicine.controller.js";



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

// hello
export default MedicineRouter;