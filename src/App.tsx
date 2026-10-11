import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import { Phone, Mail, ShieldCheck, ArrowRight, X } from "lucide-react";
import { AppState, Lang, PostType, User, Post, Conversation, ChatMessage, DealTerms, MeetupProposal, Rating, Notification } from "./types";
import { t } from "./translations";
import { getInitialState, saveState, seedUsers, seedPosts } from "./mockData";
import HeaderNav from "./components/HeaderNav";
import FeedAndComposer from "./components/FeedAndComposer";
import ChatAndDealRoom from "./components/ChatAndDealRoom";
import TrustCalendarAdmin from "./components/TrustCalendarAdmin";

type AuthTab = "login" | "signup";

export default function App() {
  const [state, setState] = useState<AppState>(getInitialState);
  const [activeTab, setActiveTab] = useState("feed");
  const [showAuth, setShowAuth] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => { saveState(state); }, [state]);

  const unreadCount = state.conversations.reduce((sum, c) => {
    if (state.currentUser && c.participants.includes(state.currentUser.id)) return sum + c.unreadCount;
    return sum;
  }, 0);

  const handleLangChange = (lang: Lang) => setState((s) => ({ ...s, lang }));
  const handleModeChange = (mode: PostType) => setState((s) => ({ ...s, mode }));
  const handleOfflineToggle = () => setState((s) => ({ ...s, offline: !s.offline }));
  const handleLowDataToggle = () => setState((s) => ({ ...s, lowData: !s.lowData }));

  const handleCreatePost = (data: Omit<Post, "id" | "createdAt" | "userId">) => {
    if (!state.currentUser) { setShowAuth(true); return; }
    const newPost: Post = {
      ...data,
      id: "p" + Date.now(),
      userId: state.currentUser.id,
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, posts: [newPost, ...s.posts] }));
    toast.success(t("success_post_created", state.lang));
  };

  const handleEditPost = (postId: string, status: "active" | "paused" | "closed") => {
    setState((s) => ({
      ...s,
      posts: s.posts.map((p) => (p.id === postId ? { ...p, status } : p)),
    }));
  };

  const handleMessage = (userId: string, postId: string) => {
    if (!state.currentUser) { setShowAuth(true); return; }
    const existing = state.conversations.find(
      (c) => c.participants.includes(state.currentUser!.id) && c.participants.includes(userId) && c.postId === postId
    );
    if (existing) {
      setActiveTab("messages");
      return;
    }
    const newConv: Conversation = {
      id: "c" + Date.now(),
      participants: [state.currentUser.id, userId],
      postId,
      messages: [],
      lastMessage: "",
      lastTimestamp: new Date().toISOString(),
      unreadCount: 0,
    };
    setState((s) => ({ ...s, conversations: [newConv, ...s.conversations] }));
    setActiveTab("messages");
  };

  const handleSendMessage = (convId: string, text: string) => {
    if (!state.currentUser) return;
    const msg: ChatMessage = {
      id: "m" + Date.now(),
      conversationId: convId,
      senderId: state.currentUser.id,
      text,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setState((s) => ({
      ...s,
      conversations: s.conversations.map((c) =>
        c.id === convId
          ? { ...c, messages: [...c.messages, msg], lastMessage: text, lastTimestamp: msg.timestamp }
          : c
      ),
    }));
  };

  const handleAcceptTerms = (dealId: string) => {
    if (!state.currentUser) return;
    setState((s) => {
      const deal = s.deals.find((d) => d.id === dealId);
      if (!deal) return s;
      const isBuyer = s.conversations.find((c) => c.id === deal.conversationId)?.participants[0] === s.currentUser?.id;
      const updatedDeals = s.deals.map((d) => {
        if (d.id !== dealId) return d;
        const newBuyer = isBuyer ? true : d.buyerAccepted;
        const newSeller = !isBuyer ? true : d.sellerAccepted;
        const status = newBuyer && newSeller ? "accepted" as const : d.status;
        return { ...d, buyerAccepted: newBuyer, sellerAccepted: newSeller, status };
      });
      return { ...s, deals: updatedDeals };
    });
    toast.success(t("success_deal_locked", state.lang));
  };

  const handleProposeMeetup = (dealId: string, slots: { date: string; time: string; location: string }[]) => {
    const newMeetup: MeetupProposal = {
      id: "mp" + Date.now(),
      dealId,
      slots,
      selectedSlot: null,
      status: "proposed",
      safeZone: slots[0]?.location || "",
    };
    setState((s) => ({ ...s, meetups: [...s.meetups, newMeetup] }));
    toast.success(t("success_meetup_confirmed", state.lang));
  };

  const handleSelectSlot = (meetupId: string, slotIndex: number) => {
    setState((s) => ({
      ...s,
      meetups: s.meetups.map((m) =>
        m.id === meetupId ? { ...m, selectedSlot: slotIndex, status: "confirmed" as const } : m
      ),
    }));
    toast.success(t("success_meetup_confirmed", state.lang));
  };

  const handleShareContact = (dealId: string) => {
    toast.success("Contact shared! Both parties can now see phone numbers.");
  };

  const handleRate = (toUserId: string, stars: number, reliability: string[], review: string) => {
    if (!state.currentUser) return;
    const newRating: Rating = {
      id: "r" + Date.now(),
      dealId: "d" + Date.now(),
      fromUserId: state.currentUser.id,
      toUserId,
      stars,
      reliability,
      review,
      createdAt: new Date().toISOString(),
    };
    setState((s) => ({ ...s, ratings: [...s.ratings, newRating] }));
    toast.success(t("success_rating", state.lang));
  };

  const handleResolveReport = (reportId: string, action: "resolve" | "dismiss" | "ban") => {
    setState((s) => ({
      ...s,
      reports: s.reports.map((r) => (r.id === reportId ? { ...r, status: action === "dismiss" ? "dismissed" as const : "resolved" as const } : r)),
    }));
    toast.success(action === "ban" ? "User banned." : "Report " + action + "d.");
  };

  const handleApproveVerified = (userId: string) => {
    setState((s) => ({
      ...s,
      users: s.users.map((u) => (u.id === userId ? { ...u, verified: true } : u)),
    }));
    toast.success("User verified!");
  };

  const handleSignIn = (userId: string) => {
    const user = state.users.find((u) => u.id === userId);
    if (user) {
      setState((s) => ({ ...s, currentUser: user }));
      setShowAuth(false);
      toast.success("Welcome back, " + user.name + "!");
    }
  };

  const handleSignOut = () => {
    setState((s) => ({ ...s, currentUser: null }));
    setActiveTab("feed");
    toast.success("Signed out.");
  };

  return (
    <div className={`min-h-[100dvh] app-mesh ${state.lowData ? "low-data" : ""}`}>
      <Toaster position="top-center" richColors />

      <HeaderNav
        lang={state.lang}
        mode={state.mode}
        offline={state.offline}
        unreadCount={unreadCount}
        activeTab={activeTab}
        onLangChange={handleLangChange}
        onModeChange={handleModeChange}
        onTabChange={(tab) => {
          if (tab === "profile" && !state.currentUser) { setShowAuth(true); return; }
          setActiveTab(tab);
        }}
        onNotifications={() => setShowNotifs(true)}
      />

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {activeTab === "feed" && (
          <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FeedAndComposer
              lang={state.lang}
              mode={state.mode}
              posts={state.posts}
              users={state.users}
              currentUser={state.currentUser}
              onCreatePost={handleCreatePost}
              onMessage={handleMessage}
              onEditPost={handleEditPost}
            />
          </motion.div>
        )}
        {activeTab === "messages" && (
          <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ChatAndDealRoom
              lang={state.lang}
              conversations={state.conversations}
              deals={state.deals}
              meetups={state.meetups}
              users={state.users}
              currentUser={state.currentUser}
              onBack={() => setActiveTab("feed")}
              onSendMessage={handleSendMessage}
              onAcceptTerms={handleAcceptTerms}
              onProposeMeetup={handleProposeMeetup}
              onSelectSlot={handleSelectSlot}
              onShareContact={handleShareContact}
            />
          </motion.div>
        )}
        {(activeTab === "calendar" || activeTab === "profile" || activeTab === "admin") && (
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TrustCalendarAdmin
              lang={state.lang}
              activeTab={activeTab}
              currentUser={state.currentUser}
              users={state.users}
              posts={state.posts}
              meetups={state.meetups}
              deals={state.deals}
              ratings={state.ratings}
              notifications={state.notifications}
              reports={state.reports}
              lowData={state.lowData}
              offline={state.offline}
              onLangChange={handleLangChange}
              onLowDataToggle={handleLowDataToggle}
              onOfflineToggle={handleOfflineToggle}
              onRate={handleRate}
              onResolveReport={handleResolveReport}
              onApproveVerified={handleApproveVerified}
              onSignOut={handleSignOut}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowNotifs(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="absolute right-0 top-0 bottom-0 w-full sm:w-80 bg-white shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-zinc-900">{t("notifications", state.lang)}</h2>
                  <button onClick={() => setShowNotifs(false)} className="p-2 rounded-lg hover:bg-zinc-100">
                    <X size={18} className="text-zinc-500" />
                  </button>
                </div>
                <TrustCalendarAdmin
                  lang={state.lang}
                  activeTab="notifications"
                  currentUser={state.currentUser}
                  users={state.users}
                  posts={state.posts}
                  meetups={state.meetups}
                  deals={state.deals}
                  ratings={state.ratings}
                  notifications={state.notifications}
                  reports={state.reports}
                  lowData={state.lowData}
                  offline={state.offline}
                  onLangChange={handleLangChange}
                  onLowDataToggle={handleLowDataToggle}
                  onOfflineToggle={handleOfflineToggle}
                  onRate={handleRate}
                  onResolveReport={handleResolveReport}
                  onApproveVerified={handleApproveVerified}
                  onSignOut={handleSignOut}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuth && !state.currentUser && (
          <AuthModal
            lang={state.lang}
            users={state.users}
            onClose={() => setShowAuth(false)}
            onSignIn={handleSignIn}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── AUTH MODAL ─── */
function AuthModal({
  lang, users, onClose, onSignIn,
}: {
  lang: Lang; users: User[]; onClose: () => void; onSignIn: (userId: string) => void;
}) {
  const [tab, setTab] = useState<AuthTab>("login");
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const demoUsers = users.filter((u) => u.role !== "admin");

  const handleDemoLogin = (userId: string) => {
    onSignIn(userId);
  };

  const handleSendOtp = () => {
    setOtpSent(true);
    toast.info("OTP sent! (Demo: use any 4 digits)");
  };

  const handleSubmit = () => {
    if (otpSent && otp.length >= 4) {
      const match = demoUsers.find(
        (u) => (method === "phone" && u.phone === phone) || (method === "email" && u.email === email)
      );
      if (match) { onSignIn(match.id); }
      else { toast.error("No account found. Try demo accounts below."); }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900">
            {tab === "login" ? t("welcome_back", lang) : t("create_account", lang)}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-100">
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Auth Method */}
        <div className="flex bg-zinc-100 rounded-xl p-1 mb-4">
          <button onClick={() => setMethod("phone")} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${method === "phone" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"}`}>
            <Phone size={14} /> {t("phone", lang)}
          </button>
          <button onClick={() => setMethod("email")} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${method === "email" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"}`}>
            <Mail size={14} /> {t("email", lang)}
          </button>
        </div>

        {/* Input */}
        <div className="space-y-3 mb-4">
          {method === "phone" ? (
            <input
              type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="+234..." className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132]/30"
            />
          ) : (
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com" className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132]/30"
            />
          )}
          {otpSent && (
            <input
              type="text" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6}
              placeholder={t("otp_code", lang)} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-center tracking-widest font-mono text-lg focus:outline-none focus:ring-2 focus:ring-[#0F5132]/30"
            />
          )}
        </div>

        <button
          onClick={otpSent ? handleSubmit : handleSendOtp}
          className="w-full py-3.5 bg-gradient-to-br from-[#0F5132] to-[#14734a] text-white font-bold rounded-xl text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-6 shadow-lg shadow-[#0F5132]/25"
        >
          {otpSent ? <><ShieldCheck size={16} /> {t("verify", lang)}</> : t("send_otp", lang)}
        </button>

        {/* Demo Accounts */}
        <div className="border-t border-zinc-200 pt-4">
          <p className="text-xs font-semibold text-zinc-500 mb-3 text-center">{t("demo_accounts", lang)}</p>
          <div className="grid grid-cols-2 gap-2">
            {demoUsers.slice(0, 6).map((u) => (
              <button
                key={u.id}
                onClick={() => handleDemoLogin(u.id)}
                                 className="flex items-center gap-2 p-3 bg-white border border-zinc-200 rounded-xl text-left hover:border-[#0F5132] hover:shadow-sm transition-all active:scale-95"
               >
                 <div className="w-8 h-8 bg-gradient-to-br from-[#0F5132]/15 to-[#0F5132]/5 rounded-full flex items-center justify-center shrink-0 ring-1 ring-[#0F5132]/10">
                   <span className="text-xs font-bold text-[#0F5132]">{u.name.charAt(0)}</span>
                 </div>
                 <div className="min-w-0">
                   <p className="text-xs font-semibold text-zinc-900 truncate">{u.name}</p>
                   <p className="text-[10px] text-zinc-500 capitalize">{u.role} · ★ {u.trustScore}</p>
                 </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}