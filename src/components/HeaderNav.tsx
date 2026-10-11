import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, WifiOff, Bell, Home, MessageCircle, Calendar, User, ShieldCheck, Store, Sparkles, TrendingUp } from "lucide-react";
import { Lang, PostType } from "../types";
import { t } from "../translations";

interface HeaderNavProps {
  lang: Lang;
  mode: PostType;
  offline: boolean;
  unreadCount: number;
  activeTab: string;
  onLangChange: (l: Lang) => void;
  onModeChange: (m: PostType) => void;
  onTabChange: (tab: string) => void;
  onNotifications: () => void;
}

const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ha", label: "HA" },
  { code: "ig", label: "IG" },
  { code: "yo", label: "YO" },
  { code: "tiv", label: "TIV" },
];

const TABS = [
  { id: "feed", icon: Home, labelKey: "feed" },
  { id: "messages", icon: MessageCircle, labelKey: "messages" },
  { id: "calendar", icon: Calendar, labelKey: "calendar" },
  { id: "profile", icon: User, labelKey: "profile" },
  { id: "admin", icon: ShieldCheck, labelKey: "admin" },
];

export default function HeaderNav({
  lang, mode, offline, unreadCount, activeTab,
  onLangChange, onModeChange, onTabChange, onNotifications,
}: HeaderNavProps) {
  const [showLangPicker, setShowLangPicker] = React.useState(false);

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-xl border-b border-zinc-200/70">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0F5132] to-[#14734a] flex items-center justify-center shadow-sm shadow-[#0F5132]/40 shrink-0">
                <Store size={18} className="text-white" strokeWidth={2.2} />
              </div>
              <div className="leading-tight min-w-0">
                <span className="text-[17px] font-extrabold tracking-tight text-zinc-900 block truncate">{t("app_name", lang)}</span>
                <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1">
                  <Sparkles size={9} className="text-[#D97706]" /> Verified Local Trade
                </span>
              </div>
              {offline && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full shrink-0"
                >
                  <WifiOff size={11} /> Offline
                </motion.span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {/* Language Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowLangPicker(!showLangPicker)}
                  className="flex items-center gap-1 p-2 rounded-xl hover:bg-zinc-100 active:scale-95 transition-all"
                  aria-label="Change language"
                >
                  <Globe size={18} className="text-zinc-700" />
                  <span className="text-xs font-bold text-zinc-700">{lang.toUpperCase()}</span>
                </button>
                <AnimatePresence>
                  {showLangPicker && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      className="absolute right-0 top-full mt-1 bg-white border border-zinc-200 rounded-2xl shadow-xl p-2 flex gap-1 z-50"
                    >
                      {LANGS.map((l) => (
                        <button
                          key={l.code}
                          onClick={() => { onLangChange(l.code); setShowLangPicker(false); }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            lang === l.code
                              ? "bg-[#0F5132] text-white shadow-sm shadow-[#0F5132]/40"
                              : "text-zinc-600 hover:bg-zinc-100"
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Notifications */}
              <button
                onClick={onNotifications}
                className="relative p-2 rounded-xl hover:bg-zinc-100 active:scale-95 transition-all"
                aria-label="Notifications"
              >
                <Bell size={18} className="text-zinc-700" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#D97706] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          {/* Mode Toggle */}
          <div className="px-4 pb-3">
            <div className="relative flex bg-zinc-100 border border-zinc-200/70 rounded-2xl p-1">
              {(["need", "offer"] as PostType[]).map((m) => {
                const active = mode === m;
                return (
                  <button
                    key={m}
                    onClick={() => onModeChange(m)}
                    className={`relative flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors z-10 ${
                      active ? "text-white" : "text-zinc-500 hover:text-zinc-700"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="modePill"
                        transition={{ type: "spring", damping: 26, stiffness: 320 }}
                        className={`absolute inset-0 rounded-xl -z-10 shadow-sm ${
                          m === "need" ? "bg-[#0F5132] shadow-[#0F5132]/40" : "bg-[#D97706] shadow-[#D97706]/40"
                        }`}
                      />
                    )}
                    <span className="flex items-center justify-center gap-1.5">
                      {m === "need" ? <TrendingUp size={14} /> : <Sparkles size={14} />}
                      {t(m === "need" ? "looking_for" : "offering", lang)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Offline Banner */}
      <AnimatePresence>
        {offline && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-[132px] left-0 right-0 z-40 px-4"
          >
            <div className="mx-auto max-w-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-2xl text-center flex items-center justify-center gap-2">
              <WifiOff size={15} /> {t("offline_banner", lang)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-zinc-200/70 safe-area-bottom">
        <div className="mx-auto max-w-2xl flex items-center justify-around px-2 h-16">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all active:scale-90 ${
                  isActive ? "text-[#0F5132]" : "text-zinc-400 hover:text-zinc-500"
                }`}
                aria-label={t(tab.labelKey, lang)}
              >
                <div className={`relative flex items-center justify-center w-9 h-7 rounded-xl transition-colors ${isActive ? "bg-[#0F5132]/10" : ""}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  {tab.id === "messages" && unreadCount > 0 && (
                    <span className="absolute -top-0.5 right-1.5 w-2.5 h-2.5 bg-[#D97706] rounded-full ring-2 ring-white" />
                  )}
                </div>
                <span className="text-[10px] font-semibold">{t(tab.labelKey, lang)}</span>
                {isActive && (
                  <motion.div
                    layoutId="tabIndicator"
                    transition={{ type: "spring", damping: 30, stiffness: 340 }}
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-[#0F5132] rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}