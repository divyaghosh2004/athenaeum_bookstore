import User from '../models/User.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, email, phone, street, city, state, postalCode, country, profilePicture } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;

    // Email change with uniqueness check
    if (email && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'This email address is already in use by another account.'
        });
      }
      user.email = email.toLowerCase();
    }

    // Handle delivery address update
    user.deliveryAddress = {
      street: street !== undefined ? street : user.deliveryAddress?.street || '',
      city: city !== undefined ? city : user.deliveryAddress?.city || '',
      state: state !== undefined ? state : user.deliveryAddress?.state || '',
      postalCode: postalCode !== undefined ? postalCode : user.deliveryAddress?.postalCode || '',
      country: country !== undefined ? country : user.deliveryAddress?.country || 'India'
    };

    // If an image file was uploaded via multer
    if (req.file) {
      user.profilePicture = `/uploads/${req.file.filename}`;
    } else if (profilePicture !== undefined) {
      user.profilePicture = profilePicture;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    next(err);
  }
};

