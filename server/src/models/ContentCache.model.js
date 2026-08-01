import mongoose from 'mongoose';

// Caches TMDB API responses to reduce external API calls
const contentCacheSchema = new mongoose.Schema({
  cacheKey: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // MongoDB TTL index auto-deletes
  },
}, { timestamps: true });

export default mongoose.model('ContentCache', contentCacheSchema);
