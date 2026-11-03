import Cart from '../models/Cart.js';
import Book from '../models/Book.js';

// Helper to calculate cart totals and sync prices/stock
const sanitizeCart = async (cart) => {
  await cart.populate('items.book');

  // Filter out any deleted books
  const validItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    if (item.book) {
      // Validate current price
      item.priceSnapshot = item.book.price;
      // Cap quantity to current stock
      if (item.quantity > item.book.stockQuantity) {
        item.quantity = Math.max(1, item.book.stockQuantity);
      }
      validItems.push(item);
      subtotal += item.priceSnapshot * item.quantity;
    }
  }

  cart.items = validItems;
  await cart.save();

  return {
    cart,
    subtotal,
    itemCount: validItems.reduce((acc, it) => acc + it.quantity, 0)
  };
};

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const { cart: syncedCart, subtotal, itemCount } = await sanitizeCart(cart);

    res.json({
      success: true,
      cart: syncedCart,
      subtotal,
      itemCount
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
export const addToCart = async (req, res, next) => {
  try {
    const { bookId, quantity = 1 } = req.body;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (book.stockQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'This book is currently out of stock.'
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      item => item.book && item.book.toString() === bookId
    );

    const qtyToAdd = parseInt(quantity) || 1;

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + qtyToAdd;
      if (newQty > book.stockQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Only ${book.stockQuantity} units available in stock.`
        });
      }
      cart.items[itemIndex].quantity = newQty;
      cart.items[itemIndex].priceSnapshot = book.price;
    } else {
      if (qtyToAdd > book.stockQuantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${book.stockQuantity} units available in stock.`
        });
      }
      cart.items.push({
        book: bookId,
        quantity: qtyToAdd,
        priceSnapshot: book.price
      });
    }

    await cart.save();
    const { cart: syncedCart, subtotal, itemCount } = await sanitizeCart(cart);

    res.json({
      success: true,
      message: `"${book.title}" added to cart.`,
      cart: syncedCart,
      subtotal,
      itemCount
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update quantity of item in cart
// @route   PUT /api/cart/items/:bookId
// @access  Private
export const updateCartItem = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { quantity } = req.body;

    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1.'
      });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (qty > book.stockQuantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${book.stockQuantity} units available in stock.`
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      item => item.book && item.book.toString() === bookId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart.'
      });
    }

    cart.items[itemIndex].quantity = qty;
    cart.items[itemIndex].priceSnapshot = book.price;

    await cart.save();
    const { cart: syncedCart, subtotal, itemCount } = await sanitizeCart(cart);

    res.json({
      success: true,
      cart: syncedCart,
      subtotal,
      itemCount
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:bookId
// @access  Private
export const removeCartItem = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      item => item.book && item.book.toString() !== bookId
    );

    await cart.save();
    const { cart: syncedCart, subtotal, itemCount } = await sanitizeCart(cart);

    res.json({
      success: true,
      message: 'Item removed from cart.',
      cart: syncedCart,
      subtotal,
      itemCount
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({
      success: true,
      message: 'Cart cleared successfully.',
      cart: { items: [] },
      subtotal: 0,
      itemCount: 0
    });
  } catch (err) {
    next(err);
  }
};

