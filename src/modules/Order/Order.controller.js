import { Medicine } from "../../../db/index.js";
import { Order } from "../../../db/models/Order.Model.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";

// Add a new order
export const addOrder = async (req, res, next) => {
    // Extract order data from the request body
    const { medicines, paymentMethod, shippingAddress } = req.body;
  
    // Validate required fields 
    if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
      return next(new AppError(messages.order.noMedicines, 400));
    }
    if (!paymentMethod) {
      return next(new AppError(messages.order.missingPaymentMethod, 400));
    }
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
      return next(new AppError(messages.order.missingShippingDetails, 400));
    }
  
    // Calculate total price and validate medicines
    let totalPrice = 0;
    const updatedMedicines = []; 
  
    for (const item of medicines) {
      const { medicineId, quantity } = item;
  
      // Ensure medicine ID and quantity are provided
      if (!medicineId || !quantity || quantity <= 0) {
        return next(new AppError(messages.order.invalidMedicineDetails, 400)); 
      }
  
      // Fetch medicine details from the database
      const medicine = await Medicine.findById(medicineId);
      if (!medicine) {
        return next(new AppError(messages.medicine.notFound, 404));
      }
  
      // Ensure stock is sufficient
      if (medicine.stock < quantity) {
        return next(new AppError(messages.order.insufficientStock, 400));
      }
      // Set the createdBy field if not already set (in case the medicine is being updated)
      medicine.createdBy = medicine.createdBy || req.authUser._id;
      // Add medicine details for the order
      updatedMedicines.push({
        medicineId: medicine._id,
        quantity,
        price: medicine.price,
      });
  
      // Add to total price
      totalPrice += medicine.price * quantity;
  
      // Reduce stock
      medicine.stock -= quantity;
      await medicine.save();
    }
  
    // Create a new order
    const order = new Order({
      customer: req.authUser._id,
      medicines: updatedMedicines,
      totalPrice,
      paymentMethod,
      shippingAddress,
      createdBy: req.authUser._id, 
    });
  
    // Save the order to the database
    const newOrder = await order.save();
  
    // Handle failure
    if (!newOrder) {
      return next(new AppError(messages.order.failToCreate, 500));
    }
  
    // Send response
    res.status(201).json({
      success: true,
      message: messages.order.created,
      data: newOrder,
    });
};
