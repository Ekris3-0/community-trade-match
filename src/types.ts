export type Lang = "en" | "ha" | "ig" | "yo" | "tiv";

export type PostType = "need" | "offer";
export type PostStatus = "active" | "paused" | "closed";
export type Category =
  | "agriculture"
  | "electronics"
  | "trades"
  | "fashion"
  | "food"
  | "transport"
  | "livestock";

export type DealStatus = "pending" | "accepted" | "completed" | "cancelled";
export type MeetupStatus = "proposed" | "confirmed" | "completed" | "cancelled";
export type AuthMode = "phone" | "email";
export type UserRole = "buyer" | "seller" | "admin";

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  city: string;
  trustScore: number;
  dealsCompleted: number;
  verified: boolean;
  role: UserRole;
  joinedAt: string;
}

export interface Post {
  id: string;
  userId: string;
  type: PostType;
  title: string;
  description: string;
  category: Category;
  budget: number;
  location: string;
  city: string;
  image: string;
  status: PostStatus;
  createdAt: string;
  matchReason?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  image?: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  postId: string;
  messages: ChatMessage[];
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
}

export interface DealTerms {
  id: string;
  conversationId: string;
  postId: string;
  item: string;
  quantity: string;
  price: number;
  condition: string;
  meetupTerms: string;
  buyerAccepted: boolean;
  sellerAccepted: boolean;
  status: DealStatus;
  createdAt: string;
}

export interface ContactExchange {
  dealId: string;
  buyerShared: boolean;
  sellerShared: boolean;
  phone: string;
  whatsapp: string;
  address: string;
}

export interface MeetupProposal {
  id: string;
  dealId: string;
  slots: { date: string; time: string; location: string }[];
  selectedSlot: number | null;
  status: MeetupStatus;
  safeZone: string;
}

export interface Rating {
  id: string;
  dealId: string;
  fromUserId: string;
  toUserId: string;
  stars: number;
  reliability: string[];
  review: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "message" | "deal" | "meetup" | "rating" | "system";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface AdminReport {
  id: string;
  postId?: string;
  userId: string;
  reportedBy: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  posts: Post[];
  conversations: Conversation[];
  deals: DealTerms[];
  meetups: MeetupProposal[];
  ratings: Rating[];
  notifications: Notification[];
  reports: AdminReport[];
  lang: Lang;
  mode: PostType;
  offline: boolean;
  lowData: boolean;
}
