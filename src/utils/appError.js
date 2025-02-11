import { deleteCloudImage } from "./cloud.js";
import { deleteFile } from "./file-functions.js";

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode || 500;
    this.success = false;
  }
}

// globalErrorHandling
export const globalErrorHandling = async (err, req, res, next) => {
  // rollback file system
  if (req.file) {
    deleteFile(req.file.path);
  }
  // rollback cloud
  if (req.failImage) {
    await deleteCloudImage(req.failImage.public_id);
  }
  // delete multi image
  if (req.failImages?.length > 0) {
    for (const public_id of req.failImages) {
      await deleteCloudImage(public_id);
    }
  }
  return res.status(err.statusCode || 500).json({
    message: err.message,
    success: false,
  });
};

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
