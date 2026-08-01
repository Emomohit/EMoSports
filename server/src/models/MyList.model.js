import mongoose from 'mongoose';

const myListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  profile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true,
  },
  tmdbId: { type: Number, required: true },
  mediaType: { type: String, enum: ['movie', 'tv'], required: true },
  title: { type: String, required: true },
  poster: { type: String },
  backdrop: { type: String },
  year: { type: String },
  rating: { type: String },
  addedAt: { type: Date, default: Date.now },
}, { timestamps: false });

// Prevent duplicate entries per profile
myListSchema.index({ profile: 1, tmdbId: 1, mediaType: 1 }, { unique: true });

export default mongoose.model('MyList', myListSchema);
