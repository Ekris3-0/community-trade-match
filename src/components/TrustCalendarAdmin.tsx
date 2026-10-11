import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, ShieldCheck, Star, Settings, Globe, WifiOff, Ban, Flag, Award, UserCheck, ChevronRight, Bell, X } from "lucide-react";
import { Lang, PostType, User, MeetupProposal, Rating, Notification, AdminReport, DealTerms, Post } from "../types";
import { t } from "../translations";
import { formatNaira, formatTime, safeZones } from "../mockData";

interface TrustCalendarAdminProps {
  lang: Lang;
  activeTab: string;
  currentUser: User | null;
  users: User[];
  posts: Post[];
  meetups: MeetupProposal[];
  deals: DealTerms[];
  ratings: Rating[];
  notifications: Notification[];
  reports: AdminReport[];
  lowData: boolean;
  offline: boolean;
  onLangChange: (l: Lang) => void;
  onLowDataToggle: () => void;
  onOfflineToggle: () => void;
  onRate: (toUserId: string, stars: number, reliability: string[], review: string) => void;
  onResolveReport: (reportId: string, action: "resolve" | "dismiss" | "ban") => void;
  onApproveVerified: (userId: string) => void;
  onSignOut: () => void;
}

export default function TrustCalendarAdmin({
  lang, activeTab, currentUser, users, posts, meetups, deals, ratings,
  notifications, reports, lowData, offline,
  onLangChange, onLowDataToggle, onOfflineToggle, onRate,
  onResolveReport, onApproveVerified, onSignOut,
}: TrustCalendarAdminProps) {

  if (activeTab === "calendar") return <CalendarView lang={lang} meetups={meetups} users={users} />;
  if (activeTab === "profile") return <ProfileView lang={lang} currentUser={currentUser} users={users} ratings={ratings} lowData={lowData} offline={offline} onLangChange={onLangChange} onLowDataToggle={onLowDataToggle} onOfflineToggle={onOfflineToggle} onSignOut={onSignOut} onRate={onRate} />;
  if (activeTab === "admin") return <AdminView lang={lang} reports={reports} posts={posts} users={users} onResolveReport={onResolveReport} onApproveVerified={onApproveVerified} />;
  if (activeTab === "notifications") return <NotificationsView lang={lang} notifications={notifications} />;
  return null;
}

/* ─── CALENDAR VIEW ─── */
function CalendarView({ lang, meetups, users }: { lang: Lang; meetups: MeetupProposal[]; users: User[] }) {
  const confirmed = meetups.filter((m) => m.status === "confirmed");
  const upcoming = meetups.filter((m) => m.status === "proposed");

  return (
    <div className="mx-auto max-w-2xl pb-24 pt-[136px] px-4">
      <h1 className="text-xl font-extrabold text-zinc-900 mb-4">{t("calendar", lang)}</h1>
      <div className="mb-5 rounded-2xl border border-[#0F5132]/15 bg-gradient-to-br from-[#0F5132]/[0.08] to-[#0F5132]/[0.02] p-4 flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#0F5132] flex items-center justify-center shrink-0">
          <ShieldCheck size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-zinc-900">Escrow-Protected Meetups</p>
          <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">Meet only at verified safe zones. Funds release after both parties confirm the exchange.</p>
        </div>
      </div>

      {confirmed.length === 0 && upcoming.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-500 font-medium">{t("no_events", lang)}</p>
          <p className="text-zinc-400 text-sm mt-1">{t("no_events_hint", lang)}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {confirmed.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-[#0F5132] rounded-full" />
                <span className="text-xs font-semibold text-[#0F5132]">{t("confirm_meetup", lang)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-700 mb-1">
                <Calendar size={14} className="text-zinc-400" />
                <span className="font-semibold">{m.slots[m.selectedSlot ?? 0]?.date} at {m.slots[m.selectedSlot ?? 0]?.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600 mb-3">
                <MapPin size={14} className="text-zinc-400" />
                <span>{m.slots[m.selectedSlot ?? 0]?.location}</span>
              </div>
              {/* Safety Checklist */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs font-bold text-amber-800 mb-2">{t("safety_checklist", lang)}</p>
                <ul className="space-y-1">
                  <li className="text-xs text-amber-700 flex items-center gap-1.5">• {t("bring_id", lang)}</li>
                  <li className="text-xs text-amber-700 flex items-center gap-1.5">• {t("tell_friend", lang)}</li>
                  <li className="text-xs text-amber-700 flex items-center gap-1.5">• {t("meet_daylight", lang)}</li>
                  <li className="text-xs text-amber-700 flex items-center gap-1.5">• {t("public_place", lang)}</li>
                </ul>
              </div>
            </motion.div>
          ))}
          {upcoming.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
              <span className="text-xs font-semibold text-zinc-500">{t("propose_meetup", lang)}</span>
              <div className="mt-2 space-y-2">
                {m.slots.map((s, i) => (
                  <div key={i} className="text-sm text-zinc-700 flex items-center gap-2">
                    <Calendar size={12} className="text-zinc-400" /> {s.date} • {s.time} • {s.location}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── PROFILE VIEW ─── */
function ProfileView({
  lang, currentUser, users, ratings, lowData, offline,
  onLangChange, onLowDataToggle, onOfflineToggle, onSignOut, onRate,
}: {
  lang: Lang; currentUser: User | null; users: User[]; ratings: Rating[];
  lowData: boolean; offline: boolean;
  onLangChange: (l: Lang) => void; onLowDataToggle: () => void; onOfflineToggle: () => void;
  onSignOut: () => void; onRate: (toUserId: string, stars: number, reliability: string[], review: string) => void;
}) {
  const [showRating, setShowRating] = useState(false);
  const [rateStars, setRateStars] = useState(0);
  const [rateTags, setRateTags] = useState<string[]>([]);
  const [rateReview, setRateReview] = useState("");
  const [rateTarget, setRateTarget] = useState("");

  if (!currentUser) return null;

  const myRatings = ratings.filter((r) => r.toUserId === currentUser.id);

  const handleSubmitRating = () => {
    if (rateTarget && rateStars > 0) {
      onRate(rateTarget, rateStars, rateTags, rateReview);
      setShowRating(false);
      setRateStars(0); setRateTags([]); setRateReview(""); setRateTarget("");
    }
  };

  return (
    <div className="mx-auto max-w-2xl pb-24 pt-[136px] px-4">
      {/* Profile Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#0F5132]/10 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-[#0F5132]">{currentUser.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-bold text-zinc-900">{currentUser.name}</h2>
              {currentUser.verified && <ShieldCheck size={16} className="text-[#0F5132]" />}
            </div>
            <p className="text-sm text-zinc-500">{currentUser.location}, {currentUser.city}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{t("member_since", lang)}: {currentUser.joinedAt}</p>
          </div>
        </div>
        <p className="text-sm text-zinc-600 mt-3">{currentUser.bio}</p>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center bg-zinc-50 rounded-xl py-3">
            <span className="text-lg font-bold text-[#0F5132]">{currentUser.trustScore}</span>
            <p className="text-[10px] text-zinc-500 font-medium">{t("trust_score", lang)}</p>
          </div>
          <div className="text-center bg-zinc-50 rounded-xl py-3">
            <span className="text-lg font-bold text-[#D97706]">{currentUser.dealsCompleted}</span>
            <p className="text-[10px] text-zinc-500 font-medium">{t("deals_completed", lang)}</p>
          </div>
          <div className="text-center bg-zinc-50 rounded-xl py-3">
            <span className="text-lg font-bold text-zinc-900">{myRatings.length}</span>
            <p className="text-[10px] text-zinc-500 font-medium">{t("rate_deal", lang)}</p>
          </div>
        </div>
      </div>

      {/* Recent Ratings */}
      {myRatings.length > 0 && (
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 mb-4">
          <h3 className="font-bold text-sm text-zinc-900 mb-3">{t("rate_deal", lang)}</h3>
          <div className="space-y-3">
            {myRatings.slice(0, 3).map((r) => {
              const from = users.find((u) => u.id === r.fromUserId);
              return (
                <div key={r.id} className="bg-zinc-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-zinc-700">{from?.name}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={10} className={i < r.stars ? "fill-[#D97706] text-[#D97706]" : "text-zinc-300"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600">{r.review}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 mb-4">
        <h3 className="font-bold text-sm text-zinc-900 mb-3 flex items-center gap-2">
          <Settings size={14} /> {t("settings", lang)}
        </h3>
        <div className="space-y-3">
          {/* Language */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-700 flex items-center gap-2"><Globe size={14} /> {t("language", lang)}</span>
            <div className="flex gap-1">
              {(["en", "ha", "ig", "yo", "tiv"] as Lang[]).map((l) => (
                <button key={l} onClick={() => onLangChange(l)} className={`px-2 py-1 rounded-md text-[10px] font-bold ${lang === l ? "bg-[#0F5132] text-white" : "bg-zinc-100 text-zinc-600"}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          {/* Low Data */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-700 flex items-center gap-2"><WifiOff size={14} /> {t("low_data_mode", lang)}</span>
            <button onClick={onLowDataToggle} className={`w-11 h-6 rounded-full transition-all ${lowData ? "bg-[#0F5132]" : "bg-zinc-300"}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-all ${lowData ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
            </button>
          </div>
          {/* Offline Sim */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-700 flex items-center gap-2"><Ban size={14} /> Simulate Offline</span>
            <button onClick={onOfflineToggle} className={`w-11 h-6 rounded-full transition-all ${offline ? "bg-red-500" : "bg-zinc-300"}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-all ${offline ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Rate Someone */}
      <button onClick={() => setShowRating(true)} className="w-full py-3.5 bg-[#D97706] text-white font-bold rounded-xl text-sm active:scale-[0.98] transition-all mb-3 flex items-center justify-center gap-2">
        <Star size={16} /> {t("rate_deal", lang)}
      </button>

      {/* Sign Out */}
      <button onClick={onSignOut} className="w-full py-3.5 bg-zinc-100 text-zinc-700 font-bold rounded-xl text-sm active:scale-[0.98] transition-all">
        {t("sign_out", lang)}
      </button>

      {/* Rating Modal */}
      {showRating && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowRating(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-zinc-900 mb-4">{t("rate_deal", lang)}</h3>
            <select value={rateTarget} onChange={(e) => setRateTarget(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm mb-3">
              <option value="">Select user...</option>
              {users.filter((u) => u.id !== currentUser.id && u.role !== "admin").map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <div className="flex gap-1 mb-3 justify-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} onClick={() => setRateStars(i + 1)}>
                  <Star size={28} className={i < rateStars ? "fill-[#D97706] text-[#D97706]" : "text-zinc-300"} />
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {["on_time", "good_quality", "fair_price", "friendly"].map((tag) => (
                <button key={tag} onClick={() => setRateTags((prev) => prev.includes(tag) ? prev.filter((t2) => t2 !== tag) : [...prev, tag])} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${rateTags.includes(tag) ? "bg-[#0F5132] text-white" : "bg-zinc-100 text-zinc-600"}`}>
                  {t(tag, lang)}
                </button>
              ))}
            </div>
            <textarea value={rateReview} onChange={(e) => setRateReview(e.target.value)} placeholder={t("write_review", lang)} rows={3} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm mb-3 resize-none" />
            <button onClick={handleSubmitRating} className="w-full py-3 bg-[#0F5132] text-white font-bold rounded-xl text-sm">
              {t("submit_rating", lang)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── ADMIN VIEW ─── */
function AdminView({
  lang, reports, posts, users, onResolveReport, onApproveVerified,
}: {
  lang: Lang; reports: AdminReport[]; posts: Post[]; users: User[];
  onResolveReport: (id: string, action: "resolve" | "dismiss" | "ban") => void;
  onApproveVerified: (userId: string) => void;
}) {
  const pending = reports.filter((r) => r.status === "pending");
  const unverified = users.filter((u) => !u.verified && u.role !== "admin");

  return (
    <div className="mx-auto max-w-2xl pb-24 pt-[136px] px-4">
      <h1 className="text-xl font-extrabold text-zinc-900 mb-4">{t("admin", lang)}</h1>

      {/* Flagged Reports */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-zinc-700 mb-3 flex items-center gap-2">
          <Flag size={14} /> {t("flagged_posts", lang)} ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-zinc-400">{t("all_caught_up", lang)}</p>
        ) : (
          <div className="space-y-3">
            {pending.map((r) => {
              const reporter = users.find((u) => u.id === r.reportedBy);
              const flaggedPost = posts.find((p) => p.id === r.postId);
              return (
                <div key={r.id} className="bg-white border border-zinc-200 rounded-xl p-4">
                  <p className="text-sm font-semibold text-zinc-900">{flaggedPost?.title || "Post #" + r.postId}</p>
                  <p className="text-xs text-zinc-500 mt-1">Reason: {r.reason}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">By: {reporter?.name}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => onResolveReport(r.id, "resolve")} className="px-3 py-1.5 bg-[#0F5132] text-white text-xs font-semibold rounded-lg">
                      {t("resolve", lang)}
                    </button>
                    <button onClick={() => onResolveReport(r.id, "dismiss")} className="px-3 py-1.5 bg-zinc-100 text-zinc-600 text-xs font-semibold rounded-lg">
                      {t("dismiss", lang)}
                    </button>
                    <button onClick={() => onResolveReport(r.id, "ban")} className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-semibold rounded-lg">
                      {t("ban_user", lang)}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Verify Requests */}
      <div>
        <h2 className="text-sm font-bold text-zinc-700 mb-3 flex items-center gap-2">
          <UserCheck size={14} /> {t("approve_verified", lang)}
        </h2>
        <div className="space-y-2">
          {unverified.map((u) => (
            <div key={u.id} className="bg-white border border-zinc-200 rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-zinc-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-zinc-600">{u.name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 truncate">{u.name}</p>
                <p className="text-xs text-zinc-500">{u.city}</p>
              </div>
              <button onClick={() => onApproveVerified(u.id)} className="px-3 py-1.5 bg-[#0F5132] text-white text-xs font-semibold rounded-lg active:scale-95">
                ✓ Verify
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── NOTIFICATIONS VIEW ─── */
function NotificationsView({ lang, notifications }: { lang: Lang; notifications: Notification[] }) {
  return (
    <div className="mx-auto max-w-2xl pb-24 pt-[136px] px-4">
      <h1 className="text-xl font-extrabold text-zinc-900 mb-4">{t("notifications", lang)}</h1>
      {notifications.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-8">{t("all_caught_up", lang)}</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className={`p-4 rounded-xl border ${n.read ? "bg-white border-zinc-200" : "bg-emerald-50 border-emerald-200"}`}>
              <p className="text-sm font-semibold text-zinc-900">{n.title}</p>
              <p className="text-xs text-zinc-600 mt-1">{n.body}</p>
              <span className="text-[10px] text-zinc-400 mt-1 block">{formatTime(n.createdAt, lang)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}