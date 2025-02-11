import { model, Schema, Types } from "mongoose";

const medicineSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    manufacturer: {
      type: Types.ObjectId,
      ref: "Manufacturer", 
    },
    batchNumber: {
      type: String,
      required: true,
    },
    dosage: {
      type: String,
      required: true,
    },
    prescriptionRequired: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: true,
      trim: true, 
    },
    Image: {
      secure_url: { type: String, required: true },
      public_id: { type : String, required: true },
    },
   createdBy: {
      type: Types.ObjectId, 
      ref: "User",
      required: true
  }
},
  { timestamps: true }
);

export const Medicine = model("Medicine", medicineSchema);
