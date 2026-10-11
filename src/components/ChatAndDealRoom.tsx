import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Send, ShieldCheck, Phone, MapPin, Calendar, Check, X, Lock, Wallet, Handshake, FileCheck } from "lucide-react";
import { Lang, PostType, Conversation, DealTerms, MeetupProposal, User, ChatMessage } from "../types";
import { t } from "../translations";
import { formatNaira, formatTime, safeZones } from "../mockData";

interface ChatProps {
  lang: Lang;
  conversations: Conversation[];
  deals: DealTerms[];
  meetups: MeetupProposal[];
  users: User[];
  currentUser: User | null;
  onBack: () => void;
  onSendMessage: (convId: string, text: string) => void;
  onAcceptTerms: (dealId: string) => void;
  onProposeMeetup: (dealId: string, slots: { date: string; time: string; location: string }[]) => void;
  onSelectSlot: (meetupId: string, slotIndex: number) => void;
  onShareContact: (dealId: string) => void;
}

export default function ChatAndDealRoom({
  lang, conversations, deals, meetups, users, currentUser,
  onBack, onSendMessage, onAcceptTerms, onProposeMeetup, onSelectSlot, onShareContact,
}: ChatProps) {
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [message, setMessage] = useState("");
  const [showDealPanel, setShowDealPanel] = useState(false);
  const [showMeetupForm, setShowMeetupForm] = useState(false);
  const [meetupSlots, setMeetupSlots] = useState([{ date: "", time: "", location: safeZones[0] }]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [selectedConv?.messages.length]);

  const getOtherUser = (conv: Conversation) => {
    const otherId = conv.participants.find((p) => p !== currentUser?.id);
    return users.find((u) => u.id === otherId);
  };

  const getDealForConv = (convId: string) => deals.find((d) => d.conversationId === convId);
  const getMeetupForDeal = (dealId: string) => meetups.find((m) => m.dealId === dealId);

  const handleSend = () => {
    if (!message.trim() || !selectedConv) return;
    onSendMessage(selectedConv.id, message.trim());
    setMessage("");
  };

  // Conversation List View
  if (!selectedConv) {
    return (
      <div className="pb-24 pt-[136px] app-mesh min-h-[100dvh]">
        <div className="mx-auto max-w-2xl px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-zinc-100">
            <ChevronLeft size={20} className="text-zinc-700" />
          </button>
          <h1 className="text-lg font-bold text-zinc-900">{t("messages", lang)}</h1>
        </div>
        <div className="mx-auto max-w-2xl px-4 space-y-3">
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-500 font-medium">{t("no_messages", lang)}</p>
              <p className="text-zinc-400 text-sm mt-1">{t("no_messages_hint", lang)}</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const other = getOtherUser(conv);
              return (
                <motion.button
                  key={conv.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedConv(conv)}
                  className="w-full flex items-center gap-3 p-4 bg-white border border-zinc-200 rounded-2xl text-left shadow-sm"
                >
                  <div className="w-11 h-11 bg-[#0F5132]/10 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-[#0F5132]">{other?.name?.charAt(0) || "?"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-zinc-900">{other?.name || "Unknown"}</span>
                      <span className="text-xs text-zinc-400">{formatTime(conv.lastTimestamp, lang)}</span>
                    </div>
                    <p className="text-sm text-zinc-500 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 bg-[#D97706] text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </motion.button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // Chat Thread View
  const other = getOtherUser(selectedConv);
  const deal = getDealForConv(selectedConv.id);
  const meetup = deal ? getMeetupForDeal(deal.id) : null;

  return (
    <div className="h-[100dvh] flex flex-col bg-zinc-50">
      {/* Chat Header */}
      <div className="bg-white border-b border-zinc-200 px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => { setSelectedConv(null); setShowDealPanel(false); }} className="p-2 rounded-lg hover:bg-zinc-100">
          <ChevronLeft size={20} className="text-zinc-700" />
        </button>
        <div className="w-9 h-9 bg-[#0F5132]/10 rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-[#0F5132]">{other?.name?.charAt(0) || "?"}</span>
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-sm text-zinc-900">{other?.name}</span>
          {other?.verified && <ShieldCheck size={14} className="inline ml-1 text-[#0F5132]" />}
        </div>
        {deal && (
          <button
            onClick={() => setShowDealPanel(!showDealPanel)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              showDealPanel ? "bg-[#0F5132] text-white" : "bg-zinc-100 text-zinc-700"
            }`}
          >
            {t("deal_room", lang)}
          </button>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Messages */}
        <div className="flex-1 flex flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {selectedConv.messages.map((msg) => {
              const isMine = msg.senderId === currentUser?.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                    isMine
                      ? "bg-[#0F5132] text-white rounded-br-md"
                      : "bg-white text-zinc-900 border border-zinc-200 rounded-bl-md"
                  }`}>
                    <p>{msg.text}</p>
                    <span className={`text-[10px] mt-1 block ${isMine ? "text-emerald-200" : "text-zinc-400"}`}>
                      {formatTime(msg.timestamp, lang)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Input */}
          <div className="bg-white border-t border-zinc-200 px-4 py-3 flex gap-2 shrink-0">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={t("type_message", lang)}
              className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F5132]/30"
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              className="w-11 h-11 bg-[#0F5132] text-white rounded-xl flex items-center justify-center shrink-0"
            >
              <Send size={18} />
            </motion.button>
          </div>
        </div>

        {/* Deal Panel */}
        <AnimatePresence>
          {showDealPanel && deal && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="absolute right-0 top-[56px] bottom-[68px] w-full sm:w-80 bg-white border-l border-zinc-200 overflow-y-auto z-10"
            >
              <div className="p-4 space-y-4">
                <h3 className="font-bold text-zinc-900 text-base">{t("deal_room", lang)}</h3>

                {/* Settlement Milestones */}
                {(() => {
                  const steps = [
                    { label: "Terms", done: true, icon: FileCheck },
                    { label: "Agreed", done: deal.buyerAccepted && deal.sellerAccepted, icon: Handshake },
                    { label: "Meetup", done: !!meetup && meetup.status === "confirmed", icon: Calendar },
                    { label: "Settle", done: deal.status === "accepted", icon: Wallet },
                  ];
                  const doneCount = steps.filter((s) => s.done).length;
                  return (
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-sm text-zinc-900">Settlement Progress</h4>
                        <span className="text-[10px] font-bold text-[#0F5132] bg-[#0F5132]/10 px-2 py-0.5 rounded-full">{doneCount}/4</span>
                      </div>
                      <div className="flex items-center">
                        {steps.map((s, i) => {
                          const Icon = s.icon;
                          return (
                            <div key={s.label} className="flex items-center flex-1 last:flex-none">
                              <div className="flex flex-col items-center gap-1">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${s.done ? "bg-[#0F5132] text-white" : "bg-white border border-zinc-200 text-zinc-400"}`}>
                                  {s.done ? <Check size={14} /> : <Icon size={14} />}
                                </div>
                                <span className={`text-[9px] font-bold ${s.done ? "text-[#0F5132]" : "text-zinc-400"}`}>{s.label}</span>
                              </div>
                              {i < steps.length - 1 && (
                                <div className={`h-0.5 flex-1 mx-1 -mt-4 rounded ${steps[i + 1].done ? "bg-[#0F5132]" : "bg-zinc-200"}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Terms Card */}
                <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">{t("item", lang)}</span>
                    <span className="font-semibold text-zinc-900">{deal.item}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">{t("quantity", lang)}</span>
                    <span className="font-semibold text-zinc-900">{deal.quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">{t("price", lang)}</span>
                    <span className="font-bold text-[#0F5132]">{formatNaira(deal.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">{t("condition", lang)}</span>
                    <span className="font-semibold text-zinc-900">{deal.condition}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">{t("meetup_terms", lang)}</span>
                    <span className="font-semibold text-zinc-900 text-right max-w-[140px]">{deal.meetupTerms}</span>
                  </div>
                </div>

                {/* Accept Status */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${deal.buyerAccepted ? "bg-[#0F5132]" : "bg-zinc-200"}`}>
                      {deal.buyerAccepted && <Check size={12} className="text-white" />}
                    </div>
                    <span className="text-sm text-zinc-600">{t("buyer_mode", lang)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${deal.sellerAccepted ? "bg-[#0F5132]" : "bg-zinc-200"}`}>
                      {deal.sellerAccepted && <Check size={12} className="text-white" />}
                    </div>
                    <span className="text-sm text-zinc-600">{t("seller_mode", lang)}</span>
                  </div>
                </div>

                {/* Accept Button */}
                {!deal.buyerAccepted && !deal.sellerAccepted ? (
                  <button
                    onClick={() => onAcceptTerms(deal.id)}
                    className="w-full py-3 bg-[#0F5132] text-white font-bold rounded-xl text-sm active:scale-[0.98] transition-all"
                  >
                    {t("agree_terms", lang)}
                  </button>
                ) : deal.status === "pending" ? (
                  <p className="text-sm text-amber-600 font-medium text-center">{t("terms_pending", lang)}</p>
                ) : (
                  <p className="text-sm text-[#0F5132] font-medium text-center">{t("terms_accepted", lang)}</p>
                )}

                {/* Contact Exchange */}
                {deal.status === "accepted" && (
                  <div className="border-t border-zinc-200 pt-4">
                    <h4 className="font-semibold text-sm text-zinc-900 mb-2 flex items-center gap-2">
                      <Phone size={14} /> {t("contact_exchange", lang)}
                    </h4>
                    {other && (
                      <button
                        onClick={() => onShareContact(deal.id)}
                        className="w-full py-3 bg-[#D97706] text-white font-bold rounded-xl text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <Lock size={14} /> {t("share_contact", lang)}
                      </button>
                    )}
                  </div>
                )}

                {/* Meetup Proposal */}
                {deal.status === "accepted" && !meetup && (
                  <div className="border-t border-zinc-200 pt-4">
                    <button
                      onClick={() => setShowMeetupForm(true)}
                      className="w-full py-3 bg-zinc-900 text-white font-bold rounded-xl text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                      <Calendar size={14} /> {t("propose_meetup", lang)}
                    </button>
                  </div>
                )}

                {/* Meetup Slots */}
                {meetup && (
                  <div className="border-t border-zinc-200 pt-4">
                    <h4 className="font-semibold text-sm text-zinc-900 mb-3">{t("select_slot", lang)}</h4>
                    <div className="space-y-2">
                      {meetup.slots.map((slot, i) => (
                        <button
                          key={i}
                          onClick={() => onSelectSlot(meetup.id, i)}
                          className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${
                            meetup.selectedSlot === i
                              ? "bg-[#0F5132] text-white border-[#0F5132]"
                              : "bg-white border-zinc-200 text-zinc-700 hover:border-[#0F5132]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            <span className="font-medium">{slot.date} • {slot.time}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-xs opacity-70">
                            <MapPin size={10} /> {slot.location}
                          </div>
                        </button>
                      ))}
                    </div>
                    {meetup.status === "confirmed" && (
                      <p className="text-sm text-[#0F5132] font-medium mt-2 text-center">✓ {t("confirm_meetup", lang)}</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Meetup Form Modal */}
      <AnimatePresence>
        {showMeetupForm && deal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end"
            onClick={() => setShowMeetupForm(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-zinc-900">{t("propose_meetup", lang)}</h3>
                <button onClick={() => setShowMeetupForm(false)} className="p-2 rounded-full hover:bg-zinc-100">
                  <X size={18} className="text-zinc-500" />
                </button>
              </div>
              <div className="space-y-3">
                {meetupSlots.map((slot, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2">
                    <input
                      type="date"
                      value={slot.date}
                      onChange={(e) => { const s = [...meetupSlots]; s[i] = { ...s[i], date: e.target.value }; setMeetupSlots(s); }}
                      className="px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                    />
                    <input
                      type="time"
                      value={slot.time}
                      onChange={(e) => { const s = [...meetupSlots]; s[i] = { ...s[i], time: e.target.value }; setMeetupSlots(s); }}
                      className="px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                    />
                    <select
                      value={slot.location}
                      onChange={(e) => { const s = [...meetupSlots]; s[i] = { ...s[i], location: e.target.value }; setMeetupSlots(s); }}
                      className="px-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm"
                    >
                      {safeZones.map((z) => <option key={z} value={z}>{z}</option>)}
                    </select>
                  </div>
                ))}
                {meetupSlots.length < 3 && (
                  <button
                    onClick={() => setMeetupSlots([...meetupSlots, { date: "", time: "", location: safeZones[0] }])}
                    className="text-sm text-[#0F5132] font-semibold"
                  >
                    + Add another slot
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  const valid = meetupSlots.filter((s) => s.date && s.time);
                  if (valid.length > 0) {
                    onProposeMeetup(deal.id, valid);
                    setShowMeetupForm(false);
                  }
                }}
                className="w-full mt-4 py-3.5 bg-[#0F5132] text-white font-bold rounded-xl text-sm active:scale-[0.98] transition-all"
              >
                {t("confirm_meetup", lang)}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}