import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      index: true
    },
    author: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image URL is required']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Fiction',
        'Mystery',
        'Romance',
        'Self-Help',
        'Technology',
        'Business',
        'Education'
      ],
      index: true
    },
    price: {
      type: Number,
      required: [true, 'Price in INR is required'],
      min: [0, 'Price must be non-negative']
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 25,
      min: [0, 'Stock cannot be negative']
    },
    bookType: {
      type: String,
      enum: ['physical', 'digital', 'both'],
      default: 'both'
    },
    digitalFileReference: {
      type: String,
      default: ''
    },
    freeDownloadStatus: {
      type: Boolean,
      default: false,
      index: true
    },
    downloadUrl: {
      type: String,
      default: ''
    },
    sampleContent: {
      type: String,
      default: ''
    },
    licenseInfo: {
      type: String,
      default: 'Commercial Copyright - All Rights Reserved'
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5
    },
    reviewsCount: {
      type: Number,
      default: 120
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    isBestseller: {
      type: Boolean,
      default: false,
      index: true
    },
    isNewArrival: {
      type: Boolean,
      default: false,
      index: true
    },
    isRecommended: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Text index for search across title, author, and description
bookSchema.index({ title: 'text', author: 'text', description: 'text' });

export default mongoose.model('Book', bookSchema);

