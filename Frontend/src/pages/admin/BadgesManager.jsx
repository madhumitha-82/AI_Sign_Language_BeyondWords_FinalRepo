import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, AlertTriangle, Save, Award } from "lucide-react";
import { GlassCard } from "../../components/shared/GlassCard";
import { GradientBadge } from "../../components/shared/GradientBadge";
import { userApi } from "../../lib/api";

export function BadgesManager() {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    userApi.get("/api/admin/badges")
      .then(res => setBadges(res.data || []))
      .catch(err => console.error(err));
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🏆");
  const [badgeType, setBadgeType] = useState("");

  const openAddModal = () => {
    setName("");
    setDescription("");
    setEmoji("🏆");
    setBadgeType("");
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !badgeType.trim()) return;

    const badgeData = {
      name,
      description,
      emoji,
      badgeType
    };

    try {
      const res = await userApi.post("/api/admin/badges", badgeData);
      setBadges([...badges, res.data]);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await userApi.delete(`/api/admin/badges/${id}`);
      setBadges(badges.filter(b => b.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary flex items-center gap-2">
            <Award className="w-6 h-6 text-purple-500" /> Badges Manager
          </h1>
          <p className="text-textSecondary text-sm">Create and manage XP-based badges automatically awarded to users.</p>
        </div>
        <button onClick={openAddModal} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" /> Add Badge
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {badges.map(b => (
          <GlassCard key={b.id} className="p-6 border-purple-500/20 bg-bgSecondary flex flex-col items-center text-center gap-3 relative group">
            <button onClick={() => handleDelete(b.id)} className="absolute top-3 right-3 p-2 bg-red-500/10 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="w-16 h-16 rounded-full bg-gradient-brand flex items-center justify-center text-3xl">
              {b.emoji || "🏆"}
            </div>
            <h3 className="text-lg font-bold text-textPrimary">{b.name}</h3>
            <p className="text-sm text-textSecondary flex-1">{b.description}</p>
            <div className="inline-flex px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold rounded-full">
              Type: {b.badgeType}
            </div>
          </GlassCard>
        ))}
        {badges.length === 0 && (
          <div className="col-span-full py-12 text-center text-textSecondary">
            No badges created yet.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6 bg-bgPrimary border-glassBorder shadow-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 text-textSecondary hover:text-textPrimary bg-white/5 rounded-full">
              <X className="w-4 h-4" />
            </button>
            <h2 className="text-xl font-bold text-textPrimary mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-500" /> Create Badge
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-bgSecondary border border-glassBorder rounded-xl px-4 py-3 text-textPrimary outline-none focus:border-purple-500 transition-colors" placeholder="e.g. Bronze Signer" />
              </div>
              <div>
                <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Description</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-bgSecondary border border-glassBorder rounded-xl px-4 py-3 text-textPrimary outline-none focus:border-purple-500 transition-colors resize-none h-24" placeholder="Describe the badge..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Badge Type</label>
                  <select required value={badgeType} onChange={e => setBadgeType(e.target.value)} className="w-full bg-bgSecondary border border-glassBorder rounded-xl px-4 py-3 text-textPrimary outline-none focus:border-purple-500 transition-colors">
                    <option value="" disabled>Select Type</option>
                    <option value="FIRST_STEP">First Step (1st Module)</option>
                    <option value="KNOWLEDGE_BUILDER">Knowledge Builder (5 Lessons)</option>
                    <option value="MODULE_MASTER">Module Master</option>
                    <option value="LEGEND_100">100 Day Legend</option>
                    <option value="QUIZ_CHAMPION">Quiz Champion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Emoji</label>
                  <input type="text" required value={emoji} onChange={e => setEmoji(e.target.value)} className="w-full bg-bgSecondary border border-glassBorder rounded-xl px-4 py-3 text-textPrimary outline-none focus:border-purple-500 transition-colors" placeholder="🏆" maxLength={5} />
                </div>
              </div>
              <button type="submit" className="w-full py-3 mt-6 bg-gradient-brand text-white font-bold rounded-xl hover:shadow-glow-purple transition-all duration-300 flex justify-center items-center gap-2">
                <Save className="w-4 h-4" /> Save Badge
              </button>
            </form>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
