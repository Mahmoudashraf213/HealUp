import cors from 'cors'
import { adminRouter, authRouter, CartRouter, MedicineRouter, OrderRouter } from "./modules/index.js";
import { globalErrorHandling } from "./utils/appError.js";

export const bootStrap = (app, express) => {
    // parse req
    app.use(express.json());
    // cors edit
    const corsOptions = {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    };
    app.use(cors(corsOptions));

    // routing
    app.use("/medicine", MedicineRouter);
    app.use("/auth", authRouter);
    app.use("/admin", adminRouter);
    app.use("/order", OrderRouter);
    app.use("/cart", CartRouter);

    // global error
    app.use(globalErrorHandling);
};
