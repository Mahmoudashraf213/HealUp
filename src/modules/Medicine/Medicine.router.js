import { Router } from "express";
import { isValid } from "../../middleware/validation.js";
import { addMedicineVal } from "./Medicine.validation.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { addMedicine } from "./Medicine.controller.js";



const MedicineRouter = Router();

// add medicine
MedicineRouter.post('/',
isValid(addMedicineVal),
asyncHandler(addMedicine)
)
  // todo Authenticated , Authorized , role ;
export default MedicineRouter;