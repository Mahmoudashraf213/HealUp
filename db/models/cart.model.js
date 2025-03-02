import { model, Schema, Types } from "mongoose";

// schema
const schema = new Schema(
  {
    user: {
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
          default: 1,
        },
        price: {
          type: Number,
          required: false,
        },
        _id: false,
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

// model
export const Cart = model("Cart", schema);
