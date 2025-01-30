import { adminRouter, authRouter, MedicineRouter } from "./modules/index.js";
import { globalErrorHandling } from "./utils/appError.js";


export const bootStrap = (app, express) => {
    // parse req
    app.use(express.json());

    // routing
    app.use("/Medicine", MedicineRouter);
    app.use("/auth", authRouter);
    app.use("/admin", adminRouter)

    // global error
    app.use(globalErrorHandling);
}