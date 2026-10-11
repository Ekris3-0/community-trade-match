import {
  AppState, User, Post, Conversation, ChatMessage, DealTerms,
  MeetupProposal, Rating, Notification, AdminReport, Lang, PostType
} from "./types";

const STORAGE_KEY = "kasuwalink_state";

export const seedUsers: User[] = [
  { id: "u1", name: "Amina Yusuf", phone: "+2348012345678", email: "amina@demo.com", avatar: "", bio: "Fresh produce seller from Kano. Quality guaranteed.", location: "Sabon Gari Market", city: "Kano", trustScore: 4.9, dealsCompleted: 28, verified: true, role: "seller", joinedAt: "2024-01-15" },
  { id: "u2", name: "Chidi Okonkwo", phone: "+2348023456789", email: "chidi@demo.com", avatar: "", bio: "Electronics repair and sales. Onitsha Main Market.", location: "Onitsha Main Market", city: "Onitsha", trustScore: 4.7, dealsCompleted: 42, verified: true, role: "seller", joinedAt: "2023-11-20" },
  { id: "u3", name: "Tunde Bakare", phone: "+2348034567890", email: "tunde@demo.com", avatar: "", bio: "Need quality building materials at fair price.", location: "Alaba International", city: "Lagos", trustScore: 4.5, dealsCompleted: 12, verified: false, role: "buyer", joinedAt: "2024-03-01" },
  { id: "u4", name: "Ngozi Eze", phone: "+2348045678901", email: "ngozi@demo.com", avatar: "", bio: "Fashion designer. Custom adire and ankara.", location: "Balogun Market", city: "Lagos", trustScore: 4.8, dealsCompleted: 35, verified: true, role: "seller", joinedAt: "2023-08-10" },
  { id: "u5", name: "Ibrahim Danjuma", phone: "+2348056789012", email: "ibrahim@demo.com", avatar: "", bio: "Livestock trader. Cows, goats, rams.", location: "Makurdi Cattle Market", city: "Makurdi", trustScore: 4.6, dealsCompleted: 19, verified: true, role: "seller", joinedAt: "2024-02-14" },
  { id: "u6", name: "Fatima Bello", phone: "+2348067890123", email: "fatima@demo.com", avatar: "", bio: "Looking for used laptop for school.", location: "Wuse Market", city: "Abuja", trustScore: 4.3, dealsCompleted: 5, verified: false, role: "buyer", joinedAt: "2024-04-20" },
  { id: "u7", name: "Segun Adeyemi", phone: "+2348078901234", email: "segun@demo.com", avatar: "", bio: "Plumber and handyman. 15 years experience.", location: "Bodija", city: "Ibadan", trustScore: 4.4, dealsCompleted: 22, verified: true, role: "seller", joinedAt: "2023-06-30" },
  { id: "u8", name: "Admin", phone: "+2348000000000", email: "admin@kasuwalink.com", avatar: "", bio: "Platform administrator.", location: "HQ", city: "Lagos", trustScore: 5.0, dealsCompleted: 0, verified: true, role: "admin", joinedAt: "2023-01-01" },
];

export const seedPosts: Post[] = [
  { id: "p1", userId: "u1", type: "offer", title: "Fresh Tomatoes - 50 Crates", description: "Farm fresh tomatoes from Kano. Perfect for resellers. Price negotiable for bulk.", category: "agriculture", budget: 85000, location: "Sabon Gari Market", city: "Kano", image: "", status: "active", createdAt: "2024-06-01T08:00:00Z", matchReason: "near_you" },
  { id: "p2", userId: "u2", type: "offer", title: "Refurbished Laptops - HP & Dell", description: "i5 processors, 8GB RAM, 256GB SSD. 6-month warranty included.", category: "electronics", budget: 150000, location: "Onitsha Main Market", city: "Onitsha", image: "", status: "active", createdAt: "2024-06-02T10:30:00Z", matchReason: "matches_budget" },
  { id: "p3", userId: "u3", type: "need", title: "Cement Blocks - 200 units", description: "Need 200 quality cement blocks for a building project. Delivery to Alaba.", category: "trades", budget: 120000, location: "Alaba International", city: "Lagos", image: "", status: "active", createdAt: "2024-06-03T14:00:00Z" },
  { id: "p4", userId: "u4", type: "offer", title: "Custom Ankara Dresses", description: "Made-to-order ankara dresses. Choose your fabric and style. 3-day delivery.", category: "fashion", budget: 25000, location: "Balogun Market", city: "Lagos", image: "", status: "active", createdAt: "2024-06-04T09:00:00Z", matchReason: "verified_seller" },
  { id: "p5", userId: "u5", type: "offer", title: "Healthy Goats for Sale", description: "Well-fed goats, perfect for events and ceremonies. Starting from ₦45,000.", category: "livestock", budget: 45000, location: "Makurdi Cattle Market", city: "Makurdi", image: "", status: "active", createdAt: "2024-06-05T07:00:00Z" },
  { id: "p6", userId: "u6", type: "need", title: "Used Laptop for School", description: "Looking for a working laptop. Budget ₦150,000. Must have at least 8GB RAM.", category: "electronics", budget: 150000, location: "Wuse Market", city: "Abuja", image: "", status: "active", createdAt: "2024-06-05T16:00:00Z" },
  { id: "p7", userId: "u7", type: "offer", title: "Plumbing Services - All Jobs", description: "Leak repair, pipe installation, bathroom fittings. Call for quote.", category: "trades", budget: 15000, location: "Bodija", city: "Ibadan", image: "", status: "active", createdAt: "2024-06-06T11:00:00Z" },
  { id: "p8", userId: "u1", type: "offer", title: "Dry Rice - 50kg Bags", description: "High quality local rice. Perfect for restaurants and events.", category: "food", budget: 65000, location: "Sabon Gari Market", city: "Kano", image: "", status: "active", createdAt: "2024-06-06T13:00:00Z" },
];

const seedMessages: ChatMessage[] = [
  { id: "m1", conversationId: "c1", senderId: "u6", text: "Hi! Is the laptop still available?", timestamp: "2024-06-05T17:00:00Z", read: true },
  { id: "m2", conversationId: "c1", senderId: "u2", text: "Yes! I have an HP i5, 8GB RAM, 256GB SSD. ₦145,000.", timestamp: "2024-06-05T17:05:00Z", read: true },
  { id: "m3", conversationId: "c1", senderId: "u6", text: "Can you do ₦130,000? That's my budget.", timestamp: "2024-06-05T17:10:00Z", read: true },
  { id: "m4", conversationId: "c1", senderId: "u2", text: "₦138,000 and I include a charger bag. Deal?", timestamp: "2024-06-05T17:15:00Z", read: false },
];

const seedConversations: Conversation[] = [
  { id: "c1", participants: ["u6", "u2"], postId: "p2", messages: seedMessages, lastMessage: "₦138,000 and I include a charger bag. Deal?", lastTimestamp: "2024-06-05T17:15:00Z", unreadCount: 1 },
  { id: "c2", participants: ["u3", "u7"], postId: "p7", messages: [
    { id: "m5", conversationId: "c2", senderId: "u3", text: "Do you handle large plumbing jobs?", timestamp: "2024-06-06T12:00:00Z", read: true },
    { id: "m6", conversationId: "c2", senderId: "u7", text: "Yes, I do. What do you need?", timestamp: "2024-06-06T12:30:00Z", read: true },
  ], lastMessage: "Yes, I do. What do you need?", lastTimestamp: "2024-06-06T12:30:00Z", unreadCount: 0 },
];

const seedDeals: DealTerms[] = [
  { id: "d1", conversationId: "c1", postId: "p2", item: "HP Refurbished Laptop", quantity: "1", price: 138000, condition: "Refurbished - Good", meetupTerms: "Meet at Wuse Market Security Post", buyerAccepted: true, sellerAccepted: false, status: "pending", createdAt: "2024-06-05T18:00:00Z" },
];

const seedMeetups: MeetupProposal[] = [
  { id: "mp1", dealId: "d1", slots: [
    { date: "2024-06-10", time: "10:00", location: "Wuse Market Security Post" },
    { date: "2024-06-11", time: "14:00", location: "Central Area Police Station" },
    { date: "2024-06-12", time: "09:00", location: "Banex Plaza Security Gate" },
  ], selectedSlot: null, status: "proposed", safeZone: "Wuse Market Security Post" },
];

const seedRatings: Rating[] = [
  { id: "r1", dealId: "d_old1", fromUserId: "u3", toUserId: "u7", stars: 5, reliability: ["on_time", "fair_price"], review: "Excellent work! Fixed the leak same day.", createdAt: "2024-05-20T10:00:00Z" },
  { id: "r2", dealId: "d_old2", fromUserId: "u1", toUserId: "u5", stars: 4, reliability: ["good_quality", "friendly"], review: "Healthy goats, good price. Slightly late.", createdAt: "2024-05-25T14:00:00Z" },
];

const seedNotifications: Notification[] = [
  { id: "n1", userId: "u6", type: "message", title: "New Message", body: "Chidi sent you a message about the laptop", read: false, createdAt: "2024-06-05T17:15:00Z" },
  { id: "n2", userId: "u6", type: "deal", title: "Deal Proposed", body: "A deal has been proposed for your laptop request", read: false, createdAt: "2024-06-05T18:00:00Z" },
];

const seedReports: AdminReport[] = [
  { id: "ar1", postId: "p3", userId: "u3", reportedBy: "u8", reason: "Suspicious bulk order request", status: "pending", createdAt: "2024-06-04T10:00:00Z" },
];

export function getInitialState(): AppState {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored) as AppState; } catch { /* fall through */ }
  }
  return {
    currentUser: null,
    users: seedUsers,
    posts: seedPosts,
    conversations: seedConversations,
    deals: seedDeals,
    meetups: seedMeetups,
    ratings: seedRatings,
    notifications: seedNotifications,
    reports: seedReports,
    lang: "en",
    mode: "need",
    offline: false,
    lowData: false,
  };
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

export function formatTime(dateStr: string, lang: Lang): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" });
  if (diff < 172800000) return lang === "en" ? "Yesterday" : lang === "ha" ? "Jiya" : lang === "ig" ? "Ụnyaahụ" : lang === "yo" ? "Àna" : "Mbee";
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}

export const categories: { key: string; label: string }[] = [
  { key: "agriculture", label: "Agriculture" },
  { key: "electronics", label: "Electronics" },
  { key: "trades", label: "Trades" },
  { key: "fashion", label: "Fashion" },
  { key: "food", label: "Food" },
  { key: "transport", label: "Transport" },
  { key: "livestock", label: "Livestock" },
];

export const safeZones = [
  "Police Station Safe Zone",
  "Central Market Security Post",
  "Bank Premises Lobby",
  "Mall Security Desk",
  "Bus Terminal Security Office",
];
