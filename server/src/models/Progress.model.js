import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
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
  title: { type: String },
  poster: { type: String },
  // For movies: timestamp in seconds. For TV: season + episode
  timestamp: { type: Number, default: 0 },    // seconds elapsed
  duration: { type: Number, default: 0 },      // total seconds
  percent: { type: Number, default: 0 },       // 0–100 completion
  season: { type: Number, default: null },
  episode: { type: Number, default: null },
  completed: { type: Boolean, default: false },
  watchedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// One record per profile + content combination
progressSchema.index({ profile: 1, tmdbId: 1, mediaType: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);
