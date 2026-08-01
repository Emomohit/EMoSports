import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Zap } from 'lucide-react';
import { subscriptionApi } from '../services/api';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

// Fallback plans shown instantly before server responds
const FALLBACK_PLANS = [
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

const Pricing = () => {
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null);
  const [successPlan, setSuccessPlan] = useState<string | null>(null);
  const { user } = useAppContext();
  const navigate = useNavigate();

  // Fetch live plans from backend (overrides fallback when server is up)
  useEffect(() => {
    subscriptionApi.plans()
      .then(res => { if (res?.success && res.data?.length) setPlans(res.data); })
      .catch(() => {}); // silently use fallback
  }, []);

  const handleSubscribe = async (planId: string) => {
    if (!user) { navigate('/login'); return; }
    setIsSubscribing(planId);
    try {
      await subscriptionApi.subscribe(planId);
      setSuccessPlan(planId);
      setTimeout(() => setSuccessPlan(null), 3000);
    } catch (err: any) {
      alert(err?.message || 'Subscription failed. Please try again.');
    } finally {
      setIsSubscribing(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#08080a] pt-28 pb-24 px-[5%]"
    >
      <div className="max-w-6xl mx-auto text-center mb-16">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="inline-flex items-center gap-2 bg-[#0a84ff]/10 border border-[#0a84ff]/30 rounded-full px-4 py-1.5 text-[#0a84ff] text-sm font-semibold mb-6"
        >
          <Zap className="w-3.5 h-3.5" /> Premium Streaming
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="text-4xl sm:text-6xl font-black text-white mb-5 tracking-tight leading-tight"
        >
          Choose your<br />
          <span className="bg-gradient-to-r from-[#0a84ff] to-[#5ac8fa] bg-clip-text text-transparent">perfect plan</span>
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-[#98989d] max-w-xl mx-auto"
        >
          Watch everything ad-free. Cancel anytime. Billed monthly.
        </motion.p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {plans.map((plan, i) => {
          const isPopular = plan.popular;
          const isThisSubscribing = isSubscribing === plan.id;
          const isSuccess = successPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 60, rotateX: 12 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -12, scale: 1.02 }}
              className={`relative rounded-2xl flex flex-col overflow-hidden border transition-all duration-300
                ${isPopular
                  ? 'bg-gradient-to-b from-[#0a84ff]/10 to-[#111113] border-[#0a84ff]/50 shadow-[0_0_40px_rgba(10,132,255,0.12)]'
                  : 'bg-[#111113] border-white/8'
                }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {isPopular && (
                <div className="bg-gradient-to-r from-[#0a84ff] to-[#5ac8fa] text-white text-xs font-black px-4 py-2.5 text-center tracking-widest uppercase">
                  ⭐ Most Popular
                </div>
              )}

              <div className="p-7 flex-1 flex flex-col">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-white mb-1">{plan.name}</h2>
                  <p className="text-[#98989d] text-sm">{plan.quality} video quality</p>
                </div>

                <div className="mb-8">
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-black text-white tracking-tighter">
                      ₹{plan.price}
                    </span>
                    <span className="text-[#98989d] mb-2 text-sm">/month</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-3.5 mb-8 flex-grow">
                  {[
                    { label: `Resolution: ${plan.resolution}`, ok: true },
                    { label: `${plan.simultaneousStreams} simultaneous stream${plan.simultaneousStreams > 1 ? 's' : ''}`, ok: true },
                    { label: `Devices: ${plan.devices.join(', ')}`, ok: true },
                    { label: 'Downloads', ok: plan.downloads },
                    { label: 'Cancel anytime', ok: true },
                    { label: 'No ads', ok: true },
                  ].map((feat) => (
                    <li key={feat.label} className="flex items-start gap-3">
                      <span className={`mt-0.5 font-bold text-sm ${feat.ok ? 'text-[#30d158]' : 'text-[#57575b]'}`}>
                        {feat.ok ? '✓' : '✗'}
                      </span>
                      <span className={`text-sm ${feat.ok ? 'text-[#e0e0e0]' : 'text-[#57575b] line-through'}`}>
                        {feat.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={!!isSubscribing}
                  className={`w-full py-4 rounded-xl font-black text-[15px] transition-all flex items-center justify-center gap-2
                    ${isSuccess
                      ? 'bg-[#30d158] text-white'
                      : isPopular
                        ? 'bg-gradient-to-r from-[#0a84ff] to-[#5ac8fa] text-white shadow-[0_8px_24px_rgba(10,132,255,0.35)] hover:shadow-[0_12px_32px_rgba(10,132,255,0.5)]'
                        : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <AnimatePresence mode="wait">
                    {isThisSubscribing ? (
                      <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                      </motion.span>
                    ) : isSuccess ? (
                      <motion.span key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <Check className="w-5 h-5" /> Subscribed!
                      </motion.span>
                    ) : (
                      <motion.span key="cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        {user ? `Get ${plan.name}` : 'Start Free Trial'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-[#57575b] text-sm mt-12"
      >
        By continuing, you agree to the emoplay+ Terms of Use and Privacy Policy. HD available where service is supported.
      </motion.p>
    </motion.div>
  );
};

export default Pricing;
