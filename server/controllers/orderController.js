import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Book from '../models/Book.js';
import Library from '../models/Library.js';

// @desc    Process checkout (Demo simulated payment)
// @route   POST /api/orders/checkout
// @access  Private
export const checkout = async (req, res, next) => {
  try {
    const { deliveryAddress, paymentMethod = 'UPI / NetBanking (Demo Simulation)' } = req.body;

    if (
      !deliveryAddress ||
      !deliveryAddress.fullName ||
      !deliveryAddress.phone ||
      !deliveryAddress.street ||
      !deliveryAddress.city ||
      !deliveryAddress.state ||
      !deliveryAddress.postalCode
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all required delivery address fields.'
      });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add books to proceed.'
      });
    }

    // Validate stock and build order items list
    const orderItems = [];
    let totalAmount = 0;
    const booksToUpdateStock = [];
    const digitalBooksForLibrary = [];

    for (const item of cart.items) {
      const book = item.book;
      if (!book) {
        continue;
      }

      if (book.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${book.title}". Available: ${book.stockQuantity}, in cart: ${item.quantity}.`
        });
      }

      const itemTotal = book.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        book: book._id,
        title: book.title,
        author: book.author,
        price: book.price,
        quantity: item.quantity,
        bookType: book.bookType,
        coverImage: book.coverImage
      });

      booksToUpdateStock.push({
        bookId: book._id,
        quantity: item.quantity
      });

      // Digital access rule: eligible if digital or both
      if (book.bookType === 'digital' || book.bookType === 'both') {
        digitalBooksForLibrary.push(book._id);
      }
    }

    if (orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid books in cart.'
      });
    }

    // 1. Create Order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      currency: 'INR',
      deliveryAddress,
      orderStatus: 'Confirmed',
      demoPaymentStatus: 'Paid (Demo Simulation)',
      demoPaymentMethod: paymentMethod,
      demoTransactionId: 'ATH-DEMO-' + Date.now().toString().slice(-6) + '-' + Math.floor(1000 + Math.random() * 9000)
    });

    // 2. Safely decrement book stock
    for (const item of booksToUpdateStock) {
      await Book.findByIdAndUpdate(item.bookId, {
        $inc: { stockQuantity: -item.quantity }
      });
    }

    // 3. Add eligible purchased digital books to Library
    if (digitalBooksForLibrary.length > 0) {
      let userLibrary = await Library.findOne({ user: req.user._id });
      if (!userLibrary) {
        userLibrary = await Library.create({ user: req.user._id, items: [] });
      }

      for (const bookId of digitalBooksForLibrary) {
        const alreadyInLibrary = userLibrary.items.some(
          libItem => libItem.book.toString() === bookId.toString()
        );
        if (!alreadyInLibrary) {
          userLibrary.items.push({
            book: bookId,
            accessSource: 'purchase',
            readingProgress: 0,
            lastReadPosition: 'Chapter 1: The Beginning'
          });
        }
      }
      await userLibrary.save();
    }

    // 4. Clear user's cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! (Demo payment confirmed)',
      order
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure order belongs to logged-in user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders.'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (err) {
    next(err);
  }
};

