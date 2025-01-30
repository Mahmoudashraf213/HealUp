import { model, Schema, Types } from "mongoose";
import { orderStatuses, paymentMethods } from "../../src/utils/constant/enums.js";

const orderSchema = new Schema(
  {
    customer: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    medicines: [
      {
        medicineId: {
          type: Types.ObjectId,
          ref: "Medicine",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: false,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(orderStatuses),
      default: orderStatuses.PENDING,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(paymentMethods),
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Order = model("Order", orderSchema);
