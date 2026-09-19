import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, AlertTriangle, Save, Megaphone, Calendar } from "lucide-react";
import { GlassCard } from "../../components/shared/GlassCard";
import { GradientBadge } from "../../components/shared/GradientBadge";
import { cn } from "../../lib/utils";
import { userApi } from "../../lib/api";

export function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    userApi.get("/api/admin/announcements")
      .then(res => setAnnouncements(res.data || []))
      .catch(err => console.error(err));
  }, []);
  const [toastMessage, setToastMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info"); // "info" | "success" | "warning"
  const [displayType, setDisplayType] = useState("banner"); // "banner" | "bell"
  const [startImmediately, setStartImmediately] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);


  const openAddModal = () => {
    setEditingAnn(null);
    setTitle("");
    setMessage("");
    setType("info");
    setDisplayType("banner");
    setStartImmediately(true);
    setStartDate(new Date().toISOString().split("T")[0]);
    setExpiryDate("");
    setIsModalOpen(true);
  };

  const openEditModal = (ann) => {
    setEditingAnn(ann);
    setTitle(ann.title || "");
    setMessage(ann.content || "");
    setType(ann.type || "info");
    setDisplayType(ann.displayType || "banner");
    setStartImmediately(ann.startImmediately ?? true);
    setStartDate(ann.startDate || "");
    setExpiryDate(ann.expiryDate || "");
    setIsModalOpen(true);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    let computedStatus = editingAnn ? editingAnn.status : "active";
    const today = new Date().toISOString().split("T")[0];
    if (expiryDate && expiryDate < today) {
      computedStatus = "expired";
    } else if (!startImmediately && startDate > today) {
      computedStatus = "scheduled";
    } else {
      computedStatus = "active";
    }

    const annData = {
      title,
      content: message,
      type,
      target: displayType,
      status: computedStatus
    };

    try {
      if (editingAnn) {
        await userApi.put(`/api/admin/announcements/${editingAnn.id}`, annData);
        setAnnouncements(announcements.map(a => a.id === editingAnn.id ? { ...a, ...annData } : a));
        showToast("Announcement updated successfully! 🚀");
      } else {
        const res = await userApi.post("/api/admin/announcements", annData);
        setAnnouncements([...announcements, res.data]);
        showToast("Announcement published successfully! 🚀");
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      showToast("Error saving announcement.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await userApi.delete(`/api/admin/announcements/${id}`);
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleDeactivate = async (ann) => {
    const nextStatus = ann.status === "active" ? "expired" : "active";
    try {
      await userApi.put(`/api/admin/announcements/${ann.id}`, { ...ann, status: nextStatus });
      setAnnouncements(announcements.map(a => a.id === ann.id ? { ...a, status: nextStatus } : a));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-textPrimary select-none">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-textPrimary">Announcements Manager</h2>
          <p className="text-xs text-textTertiary mt-1 font-semibold">
            Post dashboard banners and notification bell updates to user profiles
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-brand text-white text-xs font-bold rounded-xl hover:shadow-glow-purple transition-all duration-300 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* Grid of Announcements Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {announcements.map(ann => {
          let badgeColor = "blue";
          if (ann.status === "active") badgeColor = "green";
          if (ann.status === "expired") badgeColor = "gray";

          let typeColor = "text-blue-400";
          if (ann.type === "success") typeColor = "text-emerald-400";
          if (ann.type === "warning") typeColor = "text-amber-400";

          return (
            <GlassCard key={ann.id} className="p-5 flex flex-col justify-between gap-4 border-white/[0.08] relative hover:scale-[1.01] transition-all duration-300">
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-extrabold uppercase ${typeColor}`}>
                    Type: {ann.type} ({ann.displayType})
                  </span>
                  <GradientBadge label={ann.status} gradient={badgeColor} className="scale-90" />
                </div>

                <div className="flex flex-col gap-1 text-left">
                  <h3 className="font-extrabold text-sm text-textPrimary truncate">{ann.title}</h3>
                  <p className="text-[11px] text-textSecondary line-clamp-3 leading-relaxed mt-0.5">
                    {ann.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.04] pt-3 mt-1">
                <div className="flex items-center gap-1 text-[9px] font-mono text-textTertiary">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {ann.startDate || "Immediate"} → {ann.expiryDate || "Never"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleDeactivate(ann)}
                    className="px-2.5 py-1.5 border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] text-[9.5px] font-bold rounded-lg transition-all"
                  >
                    {ann.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => openEditModal(ann)}
                    className="p-1.5 border border-white/[0.06] hover:bg-white/10 text-textSecondary rounded-lg transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteConfirmTarget({
                        id: ann.id,
                        title: ann.title
                      });
                    }}
                    className="p-1.5 border border-red-500/10 bg-red-500/[0.02] hover:bg-red-500/[0.06] text-red-400 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </GlassCard>
          );
        })}

        {announcements.length === 0 && (
          <GlassCard className="col-span-2 p-10 flex flex-col items-center justify-center text-center border-dashed border-white/10 py-16">
            <Megaphone className="w-10 h-10 text-textTertiary mb-3" />
            <h3 className="font-extrabold text-sm text-textPrimary">No Announcements Found</h3>
            <p className="text-[11px] text-textSecondary mt-1 max-w-sm">
              Click the "+ New Announcement" button to post system notices.
            </p>
          </GlassCard>
        )}
      </div>

      {/* Forms Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6 border-white/[0.08] shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 text-textSecondary rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-extrabold text-textPrimary border-b border-white/[0.06] pb-2 mb-4">
              {editingAnn ? "Edit Announcement" : "Post New Announcement"}
            </h3>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-textSecondary uppercase">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. New Course Available!"
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3.5 py-2.5 text-xs text-textPrimary placeholder-textTertiary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-textSecondary uppercase">Message Body</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Write the full update notes..."
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3.5 py-2.5 text-xs text-textPrimary placeholder-textTertiary resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-textSecondary uppercase">Alert Type</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2.5 text-xs text-textPrimary"
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="success">Success (Green)</option>
                    <option value="warning">Warning (Amber)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-textSecondary uppercase">Display Method</label>
                  <select
                    value={displayType}
                    onChange={e => setDisplayType(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2.5 text-xs text-textPrimary"
                  >
                    <option value="banner">Dashboard Banner</option>
                    <option value="bell">Notification Bell</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.04] pt-2">
                <span className="text-[10px] font-bold text-textSecondary uppercase">Start Immediately</span>
                <button
                  type="button"
                  onClick={() => setStartImmediately(!startImmediately)}
                  className={cn(
                    "px-3 py-1 rounded-xl text-[9px] font-bold uppercase border transition-colors",
                    startImmediately ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/[0.02] border-white/10 text-textSecondary"
                  )}
                >
                  {startImmediately ? "Active Now" : "Schedule"}
                </button>
              </div>

              {!startImmediately && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-textSecondary uppercase">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-textSecondary uppercase">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 outline-none rounded-xl px-3 py-2 text-xs text-textPrimary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-brand text-white text-xs font-bold rounded-xl mt-2 flex items-center justify-center gap-1.5 hover:shadow-glow-purple transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Publish Announcement</span>
              </button>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm relative z-10">
            <GlassCard className="p-6 bg-bgSecondary border-glassBorder shadow-2xl text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-textPrimary">Delete Announcement?</h3>
                <p className="text-xs text-textTertiary mt-1 font-semibold leading-relaxed">
                  Are you sure you want to delete "{deleteConfirmTarget.title}"? This cannot be undone.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button
                  onClick={() => setDeleteConfirmTarget(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-xs font-bold text-textSecondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDelete(deleteConfirmTarget.id);
                    setDeleteConfirmTarget(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-500 text-xs font-bold shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all"
                >
                  Confirm Delete
                </button>
              </div>
            </GlassCard>
          </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-500/90 text-white px-6 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
            <span className="font-bold text-sm">{toastMessage}</span>
          </div>
        )}

      </div>
    );
  }
