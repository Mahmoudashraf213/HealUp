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


// update order
export const updateOrder = async (req, res, next) => {
  const { orderId } = req.params;
  let {
    medicines,
    status,
    paymentMethod,
    isPaid,
    shippingAddress,
  } = req.body;

  // Check if the order exists
  const orderExist = await Order.findById(orderId);
  if (!orderExist) {
    return next(new AppError(messages.order.notExist, 404)); 
  }

  // If medicines are provided, update them and calculate total price
  if (medicines) {
    // Calculate total price
    let calculatedTotalPrice = 0;

    // Iterate through medicines to calculate total price
    for (let medicine of medicines) {
      // Get medicine details from the database using medicineId
      const medicineDetails = await Medicine.findById(medicine.medicineId); // Fetching the medicine details
      if (!medicineDetails) {
        return next(new AppError(messages.medicine.notFound, 404)); 
      }

      const medicinePrice = medicineDetails.price; // Assuming price is in the Medicine model
      if (!medicinePrice) {
        return next(new AppError(messages.medicine.priceNotFound, 400)); 
      }

      // Calculate the total price for the medicine based on quantity
      calculatedTotalPrice += medicinePrice * medicine.quantity;
    }

    // Update the medicines in the order
    orderExist.medicines = medicines;
    // Set the calculated total price
    orderExist.totalPrice = calculatedTotalPrice;
  }

  // Update other fields if provided
  if (status) orderExist.status = status;
  if (paymentMethod) orderExist.paymentMethod = paymentMethod;
  if (typeof isPaid !== "undefined") orderExist.isPaid = isPaid;
  if (shippingAddress) orderExist.shippingAddress = shippingAddress;

  // Save the updated order
  const orderUpdated = await orderExist.save();
  if (!orderUpdated) {
    return next(new AppError(messages.order.failToUpdate, 500)); 
  }

  // Send response with the updated order
  return res.status(200).json({
    message: messages.order.updated,
    success: true,
    data: orderUpdated,
  });
};


// get specific order
export const getOrder = async (req, res, next) => {
  const { orderId } = req.params;

  // Find the order by ID
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError(messages.order.notExist, 404));
  }

  // Return the order data
  return res.status(200).json({
    message: messages.order.fetchedSuccessfully,
    success: true,
    data: order,
  });
};

// Get all orders with advanced filters
export const getAllOrders = async (req, res, next) => {
  // Fetch all orders from the database and populate related fields
  const orders = await Order.find()
    .populate("customer", "firstName lastName email")
    .populate("medicines.medicineId", "name brand category price");

  // Check if no orders exist
  if (!orders.length) {
    return next(new AppError(messages.order.notFound, 404));
  }

  // Return the orders in the response
  res.status(200).json({
    message: messages.order.getAllSuccessfully,
    success: true,
    length: orders.length,
    data: orders,
  });
};

// Delete an order 
export const deleteOrder = async (req, res, next) => {
  const { orderId } = req.params;

  // Ensure orderId is provided
  if (!orderId) {
    return next(new AppError(messages.order.noIdProvided, 400));
  }

  // Find and delete the order by ID
  const deletedOrder = await Order.findByIdAndDelete(orderId);

  // Handle if no order is found
  if (!deletedOrder) {
    return next(new AppError(messages.order.notExist, 404));
  }

  res.status(200).json({
    success: true,
    message: messages.order.deleted,
  });
};
