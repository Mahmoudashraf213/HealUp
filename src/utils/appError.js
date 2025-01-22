export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode || 500;
        this.success = false;
    }
}

// globalErrorHandling
export const globalErrorHandling = async (err, req, res, next) => {

    return res.status(err.statusCode || 500).json({
        message: err.message,
        success: false
    })

}

/*
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const globalErrorHandling = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
    });
};
*/