import User from '../models/User.model.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 199,
    currency: 'INR',
    quality: 'Good',
    resolution: '720p',
    devices: ['Phone', 'Tablet'],
    downloads: false,
    simultaneousStreams: 1,
    popular: false,
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 499,
    currency: 'INR',
    quality: 'Better',
    resolution: '1080p Full HD',
    devices: ['Phone', 'Tablet', 'Computer', 'TV'],
    downloads: true,
    simultaneousStreams: 2,
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 799,
    currency: 'INR',
    quality: 'Best',
    resolution: '4K + HDR',
    devices: ['Phone', 'Tablet', 'Computer', 'TV'],
    downloads: true,
    simultaneousStreams: 4,
    popular: false,
  },
];

// ─── GET /api/subscription/plans ─────────────────────────────────────────────
export const getPlans = (req, res) => {
  return successResponse(res, PLANS, 'Subscription plans fetched');
};

// ─── POST /api/subscription — Mock subscribe (no real payment) ────────────────
export const subscribe = async (req, res, next) => {
  try {
    const { planId } = req.body;
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return errorResponse(res, 'Invalid plan selected', 400);

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        subscription: {
          plan: planId,
          startDate,
          endDate,
          isActive: true,
        },
      },
      { new: true }
    );

    return successResponse(res, {
      subscription: user.subscription,
      plan,
    }, `Successfully subscribed to ${plan.name} plan`);
  } catch (err) {
    next(err);
  }
};

// ─── DELETE /api/subscription — Cancel subscription ──────────────────────────
export const cancelSubscription = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'subscription.isActive': false },
      { new: true }
    );

    return successResponse(res, user.subscription, 'Subscription cancelled');
  } catch (err) {
    next(err);
  }
};
