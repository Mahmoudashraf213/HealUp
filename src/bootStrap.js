import { MedicineRouter } from "./modules/index.js";
import { globalErrorHandling } from "./utils/appError.js";


export const bootStrap = (app, express) => {
    // parse req
    app.use(express.json());

 // routing
 app.use("/Medicine", MedicineRouter);

 // global error
 app.use(globalErrorHandling);
}