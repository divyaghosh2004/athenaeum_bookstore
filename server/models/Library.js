import mongoose from 'mongoose';

const libraryItemSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    accessSource: {
      type: String,
      enum: ['purchase', 'free_claim'],
      default: 'purchase'
    },
    readingProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    lastReadPosition: {
      type: String,
      default: 'Chapter 1'
    },
    lastReadAt: {
      type: Date,
      default: Date.now
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const librarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: [libraryItemSchema]
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Library', librarySchema);

