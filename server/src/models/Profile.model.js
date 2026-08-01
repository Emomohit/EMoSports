import mongoose from 'mongoose';

const AVATAR_COLORS = ['#0a84ff', '#7b1e1e', '#225b30', '#5e3a87', '#b5541a', '#1a5e7c'];

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Profile name is required'],
    trim: true,
    maxlength: [30, 'Profile name cannot exceed 30 characters'],
  },
  // Zero-cost avatar: emoji + background color stored as tiny strings in MongoDB
  avatarEmoji: { type: String, default: '🎬' },
  avatarColor: {
    type: String,
    default: () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
  },
  isKids: { type: Boolean, default: false },
  language: { type: String, default: 'en' },
  maturityRating: { type: String, enum: ['all', '13+', '16+', '18+'], default: 'all' },
}, { timestamps: true });

// Each user can have max 5 profiles
profileSchema.path('user').validate(async function (userId) {
  const count = await mongoose.model('Profile').countDocuments({ user: userId });
  return count < 5;
}, 'A user cannot have more than 5 profiles');

export default mongoose.model('Profile', profileSchema);
