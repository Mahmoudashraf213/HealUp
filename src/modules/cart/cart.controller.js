import { Cart, Medicine } from "../../../db/index.js";
import { AppError } from "../../utils/appError.js";
import { messages } from "../../utils/constant/messages.js";

// Add medicine to cart
export const addToCart = async (req, res, next) => {
  const { medicineId, quantity } = req.body;
  const user = req.authUser._id;

  // Validate request data
  if (!medicineId || !quantity || quantity <= 0) {
    return next(new AppError(messages.cart.invalidMedicineDetails, 400));
  }

  // Fetch medicine details from database
  const medicine = await Medicine.findById(medicineId);
  if (!medicine) {
    return next(new AppError(messages.medicine.notFound, 404));
  }

  // Ensure stock is available
  if (medicine.stock < quantity) {
    return next(new AppError(messages.cart.stockNotEnough, 400));
  }

  // Check if user already has a cart
  let cart = await Cart.findOne({ user });

  if (!cart) {
    // Create a new cart if it doesn't exist
    cart = new Cart({
      user,
      medicines: [{ medicineId, quantity, price: medicine.price }],
      totalPrice: medicine.price * quantity, // Initialize total price
    });
  } else {
    // Check if the medicine is already in the cart
    const existingMedicine = cart.medicines.find(
      (item) => item.medicineId.toString() === medicineId
    );

    if (existingMedicine) {
      // Update quantity if medicine exists in cart
      existingMedicine.quantity += quantity;
    } else {
      // Add new medicine to cart
      cart.medicines.push({ medicineId, quantity, price: medicine.price });
    }

    // Recalculate total price
    cart.totalPrice = cart.medicines.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  // Save the updated cart
  await cart.save();

  // Send response
  res.status(200).json({
    success: true,
    message: messages.cart.addedToCart,
    data: cart,
  });
};

// Get user's cart
export const getCart = async (req, res, next) => {
    // Get user ID from auth
    const user = req.authUser._id;

    // Get cart data for the user
    const cart = await Cart.findOne({ user }).populate('medicines.medicineId', 'name price');

    // Send response
    return res.status(200).json({
        success: true,
        data: cart
    });
};


// delete medicine from cart
export const deleteFromCart = async (req, res, next) => {
    // Get user ID from auth
    const user = req.authUser._id;
    const { medicineId } = req.params;

    // Find the cart for the user
    const cart = await Cart.findOne({ user });
    if (!cart) {
        return next(new AppError(messages.cart.notFound, 404));
    }

    // Find the medicine index in the cart
    const medicineIndex = cart.medicines.findIndex(
        (item) => item.medicineId.toString() === medicineId
    );

    if (medicineIndex === -1) {
        return next(new AppError(messages.cart.medicineNotInCart, 400));
    }

    // Remove the medicine from the cart
    cart.medicines.splice(medicineIndex, 1);

    // Recalculate total price
    cart.totalPrice = cart.medicines.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Save the updated cart
    await cart.save();

    // Send response
    return res.status(200).json({
        success: true,
        message: messages.cart.medicineRemoved,
    });
};

