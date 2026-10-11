import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, MapPin, BadgeCheck, Search, SlidersHorizontal, Image, ChevronDown, ShieldCheck, TrendingUp, Sparkles, Clock } from "lucide-react";
import { Lang, Post, PostType, Category, User } from "../types";
import { t } from "../translations";
import { formatNaira, categories } from "../mockData";

type PostStatus = "active" | "paused" | "closed";

interface FeedProps {
  lang: Lang;
  mode: PostType;
  posts: Post[];
  users: User[];
  currentUser: User | null;
  onCreatePost: (post: Omit<Post, "id" | "createdAt" | "userId">) => void;
  onMessage: (userId: string, postId: string) => void;
  onEditPost: (postId: string, status: PostStatus) => void;
}

function trustTier(score: number): { label: string; cls: string } {
  if (score >= 4.8) return { label: "Platinum", cls: "bg-[#0F5132]/10 text-[#0F5132] border-[#0F5132]/20" };
  if (score >= 4.5) return { label: "Gold", cls: "bg-[#D97706]/10 text-[#B45309] border-[#D97706]/20" };
  if (score >= 4.0) return { label: "Silver", cls: "bg-zinc-100 text-zinc-600 border-zinc-200" };
  return { label: "New", cls: "bg-zinc-100 text-zinc-500 border-zinc-200" };
}

export default function FeedAndComposer({
  lang, mode, posts, users, currentUser, onCreatePost, onMessage, onEditPost,
}: FeedProps) {
  const [showComposer, setShowComposer] = useState(false);
  const [filterCat, setFilterCat] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortNew, setSortNew] = useState(true);

  const visible = posts.filter((p) => p.type === mode || p.userId === currentUser?.id);
  const categoryKeys = Array.from(new Set(visible.map((p) => p.category)));

  const filtered = visible
    .filter((p) => {
      if (filterCat !== "all" && p.category !== filterCat) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => (sortNew ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt)));

  return (
    <div className="pb-24 pt-[136px] app-mesh min-h-[100dvh]">
      <div className="mx-auto max-w-2xl">
        {/* Search & Filter */}
        <div className="px-4 mb-3 flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search listings..."
              className="w-full pl-9 pr-9 py-3 bg-white border border-zinc-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132]/30"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-zinc-100">
                <X size={14} className="text-zinc-400" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-2xl border transitions-all active:scale-95 ${
              showFilters ? "bg-[#0F5132] border-[#0F5132] text-white" : "bg-white border-zinc-200 text-zinc-600"
            }`}
            aria-label="Filters"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-4 overflow-hidden"
            >
              <div className="mb-3 p-3 bg-white border border-zinc-200 rounded-2xl flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-600">Sort</span>
                <div className="flex bg-zinc-100 rounded-xl p-0.5">
                  <button onClick={() => setSortNew(true)} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${sortNew ? "bg-white text-[#0F5132] shadow-sm" : "text-zinc-500"}`}>Newest</button>
                  <button onClick={() => setSortNew(false)} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${!sortNew ? "bg-white text-[#0F5132] shadow-sm" : "text-zinc-500"}`}>Oldest</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Chips */}
        <div className="px-4 mb-4 flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setFilterCat("all")}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              filterCat === "all" ? "bg-[#0F5132] text-white shadow-sm shadow-[#0F5132]/30" : "bg-white border border-zinc-200 text-zinc-600"
            }`}
          >
            All · {visible.length}
          </button>
          {categoryKeys.map((key) => {
            const count = visible.filter((p) => p.category === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilterCat(key)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filterCat === key ? "bg-[#0F5132] text-white shadow-sm shadow-[#0F5132]/30" : "bg-white border border-zinc-200 text-zinc-600"
                }`}
              >
                {t(key, lang)} · {count}
              </button>
            );
          })}
        </div>

        {/* Posts List */}
        <div className="px-4 space-y-4">
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center mb-3">
                  <Search size={22} className="text-zinc-400" />
                </div>
                <p className="text-zinc-600 font-semibold">{t("no_posts", lang)}</p>
                <p className="text-zinc-400 text-sm mt-1">{t("no_posts_hint", lang)}</p>
              </motion.div>
            ) : (
              filtered.map((post) => {
                const author = users.find((u) => u.id === post.userId);
                const tier = trustTier(author?.trustScore ?? 0);
                return (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white border border-zinc-200/80 rounded-3xl p-4 card-soft"
                  >
                    {/* Author */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#0F5132]/15 to-[#0F5132]/5 rounded-full flex items-center justify-center ring-hairline">
                          <span className="text-sm font-extrabold text-[#0F5132]">{author?.name?.charAt(0) || "?"}</span>
                        </div>
                        {author?.verified && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#0F5132] rounded-full flex items-center justify-center ring-2 ring-white">
                            <BadgeCheck size={10} className="text-white" />
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-zinc-900 truncate">{author?.name}</span>
                          <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border ${tier.cls}`}>{tier.label}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-zinc-500">
                          <MapPin size={11} /> <span className="truncate">{post.location}, {post.city}</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                        post.type === "need" ? "bg-[#0F5132]/10 text-[#0F5132]" : "bg-[#D97706]/10 text-[#B45309]"
                      }`}>
                        {t(post.type, lang)}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-[17px] font-bold text-zinc-900 mb-1 leading-snug">{post.title}</h3>
                    <p className="text-sm text-zinc-600 mb-3 line-clamp-2 leading-relaxed">{post.description}</p>

                    {/* Trust signals */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {post.matchReason && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-700 font-semibold">
                          <TrendingUp size={11} /> {t(post.matchReason, lang)}
                        </span>
                      )}
                      {post.status !== "active" && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 border border-zinc-200 rounded-lg text-[11px] text-zinc-500 font-semibold">
                          <Clock size={11} /> {t(post.status, lang)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-[11px] text-zinc-600 font-semibold">
                        <ShieldCheck size={11} className="text-[#0F5132]" /> Escrow protected
                      </span>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
                      <div>
                        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">{post.type === "need" ? "Budget" : "Price"}</p>
                        <span className="text-lg font-extrabold text-[#0F5132] tabular">{formatNaira(post.budget)}</span>
                      </div>
                      <div className="flex gap-2">
                        {currentUser && currentUser.id !== post.userId && (
                          <button
                            onClick={() => onMessage(post.userId, post.id)}
                            className="px-4 py-2.5 bg-[#0F5132] text-white text-sm font-bold rounded-xl active:scale-95 transition-all shadow-sm shadow-[#0F5132]/30"
                          >
                            {t("messages", lang)}
                          </button>
                        )}
                        {currentUser && currentUser.id === post.userId && (
                          <button
                            onClick={() => onEditPost(post.id, post.status === "active" ? "paused" : "active")}
                            className="px-3 py-2.5 bg-zinc-100 text-zinc-700 text-sm font-bold rounded-xl active:scale-95 transition-all hover:bg-zinc-200"
                          >
                            {post.status === "active" ? t("pause", lang) : t("resume", lang)}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowComposer(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-br from-[#D97706] to-[#B45309] text-white rounded-2xl shadow-lg shadow-[#D97706]/40 flex items-center justify-center z-30"
        aria-label={t("post_now", lang)}
      >
        <Plus size={24} strokeWidth={2.5} />
      </motion.button>

      {/* Composer Modal */}
      <AnimatePresence>
        {showComposer && (
          <PostComposer
            lang={lang}
            mode={mode}
            onClose={() => setShowComposer(false)}
            onSubmit={(data) => {
              onCreatePost(data);
              setShowComposer(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PostComposer({
  lang, mode, onClose, onSubmit,
}: {
  lang: Lang;
  mode: PostType;
  onClose: () => void;
  onSubmit: (data: Omit<Post, "id" | "createdAt" | "userId">) => void;
}) {
  const [type, setType] = useState<PostType>(mode);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [cat, setCat] = useState<Category>("agriculture");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [city, setCity] = useState("Lagos");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !budget) return;
    onSubmit({
      type, title, description: desc, category: cat, budget: Number(budget),
      location: location || "Market", city, image: "", status: "active",
    });
  };

  const labelCls = "text-xs font-bold text-zinc-700 mb-1.5 block uppercase tracking-wide";
  const inputCls = "w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132]/30";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl p-6 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-zinc-900">{t("new_post", lang)}</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Reach verified buyers near you</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-100">
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative flex bg-zinc-100 border border-zinc-200/70 rounded-2xl p-1">
            {(["need", "offer"] as PostType[]).map((m) => {
              const active = type === m;
              return (
                <button key={m} type="button" onClick={() => setType(m)}
                  className={`relative flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors z-10 ${active ? "text-white" : "text-zinc-500"}`}>
                  {active && (
                    <motion.span layoutId="composerPill" transition={{ type: "spring", damping: 26, stiffness: 320 }}
                      className={`absolute inset-0 rounded-xl -z-10 ${m === "need" ? "bg-[#0F5132]" : "bg-[#D97706]"}`} />
                  )}
                  <span className="flex items-center justify-center gap-1.5">
                    {m === "need" ? <TrendingUp size={14} /> : <Sparkles size={14} />}
                    {t(m, lang)}
                  </span>
                </button>
              );
            })}
          </div>

          <div>
            <label className={labelCls}>{t("title", lang)}</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="e.g. Fresh Tomatoes 50 Crates" />
          </div>

          <div>
            <label className={labelCls}>{t("description", lang)}</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3}
              className={`${inputCls} resize-none`} placeholder="Describe what you need or offer..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t("category", lang)}</label>
              <div className="relative">
                <select value={cat} onChange={(e) => setCat(e.target.value as Category)} className={`${inputCls} appearance-none pr-9`}>
                  {categories.map((c) => <option key={c.key} value={c.key}>{t(c.key, lang)}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={labelCls}>{t("budget", lang)} (₦)</label>
              <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className={inputCls} placeholder="50000" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>{t("location", lang)}</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} placeholder="Market name" />
            </div>
            <div>
              <label className={labelCls}>{t("city", lang)}</label>
              <div className="relative">
                <select value={city} onChange={(e) => setCity(e.target.value)} className={`${inputCls} appearance-none pr-9`}>
                  {["Lagos", "Kano", "Onitsha", "Abuja", "Ibadan", "Makurdi"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>{t("image", lang)}</label>
            <div className="border-2 border-dashed border-zinc-200 rounded-2xl p-6 flex flex-col items-center gap-2 bg-zinc-50/50">
              <Image size={22} className="text-zinc-400" />
              <span className="text-xs text-zinc-500 font-medium">Tap to add a photo</span>
            </div>
          </div>

          <button type="submit"
            className="w-full py-4 bg-[#0F5132] text-white font-bold rounded-2xl text-base active:scale-[0.98] transition-all shadow-lg shadow-[#0F5132]/25">
            {t("publish", lang)}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}