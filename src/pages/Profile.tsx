import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { Plus, Check, Pencil, Trash2, X, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { profileApi } from '../services/api';

// ─── Preset Options (mirrored from server/src/config/cloudinary.js) ────────────
const PRESET_EMOJIS = [
  '🎬','🦁','🐯','🦊','🐼','🦅','🐉','🦋','🌙','⚡',
  '🔥','🎭','🚀','🌊','🎮','👑','💎','🎯','🌸','🦄',
  '🎵','🏆','🌈','🦸','🤖','👾','🐲','🌺','🎪','🦩',
];

const PRESET_COLORS = [
  '#0a84ff','#5e5ce6','#bf5af2','#ff375f','#ff9f0a',
  '#30d158','#2c2c2e','#7b1e1e','#225b30','#0d3a6e',
  '#4a1a6b','#1c7a6e',
];

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ProfileData {
  _id: string;
  name: string;
  avatarEmoji: string;
  avatarColor: string;
  isKids?: boolean;
}

// ─── Avatar Display Component ─────────────────────────────────────────────────
const Avatar = ({ emoji, color, size = 'lg' }: { emoji: string; color: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = { sm: 'w-10 h-10 text-xl', md: 'w-16 h-16 text-3xl', lg: 'w-32 h-32 text-6xl' };
  return (
    <div
      className={`${sizes[size]} rounded-xl flex items-center justify-center font-bold select-none flex-shrink-0`}
      style={{ background: `linear-gradient(135deg, ${color}dd, ${color}88)`, boxShadow: `0 4px 20px ${color}44` }}
    >
      {emoji}
    </div>
  );
};

// ─── Create / Edit Profile Modal ───────────────────────────────────────────────
const ProfileModal = ({
  profile,
  onClose,
  onSave,
}: {
  profile?: ProfileData | null;
  onClose: () => void;
  onSave: () => void;
}) => {
  const [name, setName]       = useState(profile?.name || '');
  const [emoji, setEmoji]     = useState(profile?.avatarEmoji || '🎬');
  const [color, setColor]     = useState(profile?.avatarColor || '#0a84ff');
  const [isKids, setIsKids]   = useState(profile?.isKids || false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');

  const handleSave = async () => {
    if (!name.trim()) { setError('Please enter a name'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = { name: name.trim(), avatarEmoji: emoji, avatarColor: color, isKids };
      if (profile) {
        await profileApi.update(profile._id, payload as any);
      } else {
        await profileApi.create(payload as any);
      }
      onSave();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
        transition={{ type: 'spring', damping: 24, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#111113] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <h2 className="text-white font-black text-lg">{profile ? 'Edit Profile' : 'Add Profile'}</h2>
          <button onClick={onClose} className="text-[#98989d] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Live Preview */}
          <div className="flex items-center gap-4 p-4 bg-white/4 rounded-xl border border-white/8">
            <Avatar emoji={emoji} color={color} size="md" />
            <div>
              <p className="text-white font-bold text-lg">{name || 'Your Name'}</p>
              <p className="text-[#98989d] text-sm">{isKids ? '👶 Kids Profile' : 'Standard Profile'}</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-[#98989d] text-xs font-bold uppercase tracking-wider mb-2 block">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Profile name"
              maxLength={30}
              className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl outline-none focus:border-[#0a84ff] transition-colors placeholder-[#57575b]"
            />
          </div>

          {/* Emoji Picker */}
          <div>
            <label className="text-[#98989d] text-xs font-bold uppercase tracking-wider mb-2 block">Avatar</label>
            <div className="grid grid-cols-10 gap-1.5">
              {PRESET_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all hover:scale-110 ${emoji === e ? 'ring-2 ring-[#0a84ff] bg-[#0a84ff]/20' : 'hover:bg-white/10'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-[#98989d] text-xs font-bold uppercase tracking-wider mb-2 block">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all hover:scale-110 ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111113] scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Kids Toggle */}
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-white font-medium text-sm">Kids Profile</p>
              <p className="text-[#57575b] text-xs">Only shows age-appropriate content</p>
            </div>
            <button
              onClick={() => setIsKids(!isKids)}
              className={`w-12 h-6 rounded-full transition-all relative ${isKids ? 'bg-[#30d158]' : 'bg-[#333]'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isKids ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* Error */}
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 bg-[#0a84ff] hover:bg-[#0070e0] disabled:opacity-60 text-white font-black rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main Profile Page ────────────────────────────────────────────────────────
const Profile = () => {
  const { user, setActiveProfile, profiles: ctxProfiles } = useAppContext();
  const navigate = useNavigate();

  const [profiles, setProfiles]           = useState<ProfileData[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [isManaging, setIsManaging]       = useState(false);
  const [showCreateModal, setShowCreate]  = useState(false);
  const [editingProfile, setEditing]      = useState<ProfileData | null>(null);
  const [deletingId, setDeletingId]       = useState<string | null>(null);

  if (!user) return <Navigate to="/login" />;

  // ─── Load profiles from backend ────────────────────────────────────────────
  const loadProfiles = async () => {
    try {
      const res = await profileApi.list();
      if (res.success) setProfiles(res.data);
    } catch {
      // Fallback to context profiles
      setProfiles(ctxProfiles.map((p: any) => ({
        _id: p.id, name: p.name,
        avatarEmoji: p.avatarEmoji || '🎬',
        avatarColor: p.avatarColor || '#0a84ff',
      })));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadProfiles(); }, []);

  const handleSelect = (p: ProfileData) => {
    if (isManaging) return;
    setActiveProfile({ id: p._id, name: p.name, avatar: '', avatarEmoji: p.avatarEmoji, avatarColor: p.avatarColor } as any);
    navigate('/');
  };

  const handleDelete = async (p: ProfileData) => {
    if (!confirm(`Delete "${p.name}"? This will remove their watchlist and progress.`)) return;
    setDeletingId(p._id);
    try {
      await profileApi.delete(p._id);
      setProfiles(prev => prev.filter(x => x._id !== p._id));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete profile');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center relative pt-16 px-4"
    >
      {/* Subtle BG gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#0a84ff0a_0%,_transparent_60%)] pointer-events-none" />

      {/* Title */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">Who's watching?</h1>
        <p className="text-[#57575b] text-sm">Choose your profile to continue</p>
      </motion.div>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="flex gap-8">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-xl bg-white/5 animate-pulse" />
              <div className="w-20 h-3 bg-white/5 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 max-w-3xl">
          {/* Profile cards */}
          {profiles.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.07, type: 'spring', damping: 18 }}
              onClick={() => handleSelect(p)}
              className="group cursor-pointer flex flex-col items-center gap-3 relative"
            >
              <div className={`relative rounded-xl overflow-hidden ring-2 ring-transparent transition-all duration-200 ${!isManaging ? 'group-hover:ring-white group-hover:scale-105' : ''}`}>
                <Avatar emoji={p.avatarEmoji} color={p.avatarColor} size="lg" />

                {/* Manage mode overlay */}
                <AnimatePresence>
                  {isManaging && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 rounded-xl"
                    >
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditing(p); }}
                        className="w-10 h-10 bg-white/20 hover:bg-[#0a84ff] rounded-full flex items-center justify-center text-white transition-colors hover:scale-110"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(p); }}
                        disabled={deletingId === p._id || profiles.length <= 1}
                        className="w-10 h-10 bg-white/20 hover:bg-red-500 disabled:opacity-40 rounded-full flex items-center justify-center text-white transition-colors hover:scale-110"
                      >
                        {deletingId === p._id
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Trash2 className="w-4 h-4" />
                        }
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="text-center">
                <span className={`font-semibold text-base transition-colors ${isManaging ? 'text-white' : 'text-[#98989d] group-hover:text-white'}`}>
                  {p.name}
                </span>
                {p.isKids && <span className="block text-[#57575b] text-xs">Kids</span>}
              </div>
            </motion.div>
          ))}

          {/* Add Profile button */}
          {profiles.length < 5 && (
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: profiles.length * 0.07 + 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreate(true)}
              className="flex flex-col items-center gap-3 group"
            >
              <div className="w-32 h-32 rounded-xl border-2 border-dashed border-white/15 hover:border-white/40 bg-white/3 hover:bg-white/8 flex items-center justify-center transition-all">
                <Plus className="w-10 h-10 text-white/40 group-hover:text-white/80 transition-colors" />
              </div>
              <span className="text-[#98989d] group-hover:text-white font-semibold text-base transition-colors">Add Profile</span>
            </motion.button>
          )}
        </div>
      )}

      {/* Manage / Done button */}
      {!isLoading && (
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          onClick={() => setIsManaging(!isManaging)}
          className={`mt-14 px-8 py-2.5 rounded-full text-sm font-black uppercase tracking-widest transition-all border ${
            isManaging
              ? 'bg-white text-black border-white hover:bg-white/90'
              : 'border-white/20 text-[#98989d] hover:border-white hover:text-white'
          }`}
        >
          {isManaging ? (
            <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Done</span>
          ) : (
            <span className="flex items-center gap-2"><Pencil className="w-3 h-3" /> Manage Profiles</span>
          )}
        </motion.button>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && (
          <ProfileModal onClose={() => setShowCreate(false)} onSave={loadProfiles} />
        )}
        {editingProfile && (
          <ProfileModal
            profile={editingProfile}
            onClose={() => setEditing(null)}
            onSave={loadProfiles}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
