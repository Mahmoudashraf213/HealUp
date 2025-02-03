import { Router } from "express";
import { isValid } from "../../middleware/validation.js";
import { addMedicineVal, deleteMedicineByIdVal,   getAllMedicineVal, getMedicineVal, updateMedicineVal } from "./Medicine.validation.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { addMedicine, deleteMedicineById,  getAllMedicines, getSpecificMedicine, updateMedicine } from "./Medicine.controller.js";
import { isAuthenticated } from "../../middleware/authentication.js";
import { isAuthorized } from "../../middleware/autheraization.js";
import { roles } from "../../utils/constant/enums.js";



const MedicineRouter = Router();

// add medicine
MedicineRouter.post('/',
  isAuthenticated(),
  isAuthorized([roles.ADMIN ]),  
  isValid(addMedicineVal),
  asyncHandler(addMedicine)

)
 

// update medicine
MedicineRouter.put('/:medicineId',
  isAuthenticated(),
  isAuthorized([roles.ADMIN ]),  
  isValid (updateMedicineVal),
  asyncHandler(updateMedicine)
)  

// get specific medicine
MedicineRouter.get('/:medicineId',
  isValid (getMedicineVal),
  asyncHandler(getSpecificMedicine)
)

// get all medicine
MedicineRouter.get('/',
  isValid (getAllMedicineVal),
  asyncHandler (getAllMedicines),
  // todo Authenticated , Authorized , role ;
)

// delete medicine by id 
MedicineRouter.delete('/:medicineId',
  isAuthenticated(),
  isAuthorized([roles.ADMIN ]),  
  isValid (deleteMedicineByIdVal),
  asyncHandler (deleteMedicineById)
  // todo Authenticated , Authorized , role ;
)



export default MedicineRouter;