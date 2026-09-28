export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';

export interface RecoveryQuestion {
  question: string;
  answer_hash: string;
}

export interface User {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  phone?: string;
  avatar: string;
  auth_provider: 'google' | 'email';
  provider_user_id?: string;
  password_hash?: string;
  recovery_questions?: RecoveryQuestion[];
  email_verified: boolean;
  college_verified: boolean;
  admin_verified?: boolean;
  verification_status?: VerificationStatus;
  phone_verified?: boolean;
  role: UserRole;
  country_id?: string;
  state_id?: string;
  city_id?: string;
  area?: string;
  college_id?: string;
  campus_id?: string;
  custom_college_name?: string;
  bio?: string;
  skills: string[];
  rating: number;
  completed_tasks: number;
  completion_rate: number;
  onboarding_completed: boolean;
  onboarding_step?: number;
  earnings_total: number;
  earnings_available: number;
  earnings_pending: number;
  spent_total: number;
  college?: College;
  is_suspended?: boolean;
  suspension_reason?: string;
  block_status?: 'NONE' | 'TEMPORARY' | 'PERMANENT';
  blocked_until?: string;
  warning_count?: number;
  warnings?: { id: string; reason: string; warned_by: string; created_at: string }[];
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  last_login_at: string;
}

export interface Country {
  id: string;
  name: string;
}

export interface State {
  id: string;
  country_id: string;
  name: string;
}

export interface City {
  id: string;
  state_id: string;
  name: string;
}

export interface College {
  id: string;
  city_id: string;
  area?: string;
  category_type?: string; // 'B.Tech / Engineering' | 'Degree & PG' | 'Pharmacy' | 'University & Autonomous'
  name: string;
  short_name?: string;
  address: string;
  email_domain: string;
  verification_required: boolean;
  active: boolean;
  created_at: string;
}

export interface Campus {
  id: string;
  college_id: string;
  name: string;
  location: string;
  active: boolean;
}

export interface CollegeRequest {
  id: string;
  requested_by: string;
  requester_name: string;
  college_name: string;
  city_id: string;
  city_name: string;
  website?: string;
  email_domain?: string;
  message?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  group: 'Academic & Creative' | 'Student Services' | 'Creative' | 'Campus Help';
  description: string;
  icon: string;
  bgColor: string;
}

export type TaskStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Task {
  id: string;
  requester_id: string;
  category_id: string;
  college_id: string;
  campus_id?: string;
  city_id: string;
  title: string;
  description: string;
  budget: number;
  quantity?: string; // e.g. "35 pages"
  deadline: string;
  location: string; // e.g. "SNIST · Block C" or "Electronics Lab"
  distance_approx?: string; // e.g. "0.8 km away"
  handover_method: 'Campus meeting point' | 'Self-arranged delivery' | 'Other';
  status: TaskStatus;
  google_drive_link?: string;
  created_at: string;
  view_count: number;
  college?: College;
  category?: Category;
  requester?: Partial<User>;
  requester_verified?: boolean;
  files?: TaskFile[];
}

export interface TaskFile {
  id: string;
  task_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size?: string;
  file_size_bytes?: number;
}

export interface Application {
  id: string;
  task_id: string;
  worker_id: string;
  proposed_price: number;
  completion_time: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  created_at: string;
}

export type OrderStatus =
  | 'PAYMENT_PENDING'
  | 'PAYMENT_HELD'
  | 'WORK_IN_PROGRESS'
  | 'READY_FOR_HANDOVER'
  | 'DELIVERED'
  | 'DISPUTE_OPEN'
  | 'UNDER_REVIEW'
  | 'PAYMENT_RELEASED'
  | 'REFUNDED';

export interface Order {
  id: string;
  task_id: string;
  requester_id: string;
  worker_id: string;
  amount: number;
  platform_fee: number;
  total_amount: number;
  status: OrderStatus;
  handover_otp?: string;
  created_at: string;
  updated_at: string;
  ready_at?: string;
  delivered_at?: string;
  released_at?: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  platform_fee: number;
  status: 'PENDING' | 'HELD' | 'RELEASED' | 'REFUNDED';
  payment_method: string;
  transaction_ref: string;
  created_at: string;
  released_at?: string;
}

export interface Handover {
  id: string;
  order_id: string;
  otp_code: string;
  otp_hash: string;
  verified_at?: string;
  status: 'PENDING' | 'VERIFIED' | 'EXPIRED';
}

export interface Dispute {
  id: string;
  order_id: string;
  opened_by: string;
  reason: 'Work not received' | 'Missing pages' | 'Incorrect work' | 'Poor quality' | 'Other';
  description: string;
  evidence_urls: string[];
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_REQUESTER' | 'RESOLVED_WORKER' | 'DISMISSED';
  resolution_notes?: string;
  resolved_by?: string;
  created_at: string;
  resolved_at?: string;
}

export interface Review {
  id: string;
  order_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type:
    | 'APPLICATION_RECEIVED'
    | 'APPLICATION_ACCEPTED'
    | 'PAYMENT_SECURED'
    | 'WORKER_STARTED'
    | 'TASK_READY'
    | 'HANDOVER_OTP'
    | 'DELIVERY_CONFIRMED'
    | 'DISPUTE_OPENED'
    | 'PAYMENT_RELEASED'
    | 'NEW_REVIEW'
    | 'VERIFICATION_UPDATE'
    | 'COLLEGE_APPROVED'
    | 'MESSAGE_RECEIVED'
    | 'WARNING_ISSUED'
    | 'ACCOUNT_MODERATED'
    | 'TASK_MODERATED';
  title: string;
  message: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  message: string;
  attachment?: {
    file_name: string;
    file_url: string;
    file_type: string;
    file_size?: string;
    file_size_bytes?: number;
  };
  created_at: string;
}

export type VerificationStatus =
  | 'NOT_REQUESTED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ADDITIONAL_INFO_REQUIRED'
  | 'ADDITIONAL_INFO_NEEDED';

export interface VerificationRequest {
  id: string;
  user_id: string;
  user_name: string;
  user_email?: string;
  phone?: string;
  phone_verified?: boolean;
  college_id: string;
  college_name: string;
  college_email?: string;
  student_id_number?: string;
  document_url?: string;
  document_filename?: string;
  document_type?: string;
  user_notes?: string;
  status: VerificationStatus;
  submission_date: string;
  reviewed_by?: string;
  reviewed_by_id?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type ModerationReportStatus = 'PENDING' | 'UNDER_REVIEW' | 'RESOLVED' | 'DISMISSED' | 'OPEN';

export interface ModerationReport {
  id: string;
  reporter_id: string;
  reporter_name: string;
  reporter_email?: string;
  reported_user_id?: string;
  reported_user_name?: string;
  related_task_id?: string;
  related_task_title?: string;
  related_order_id?: string;
  reason:
    | 'Suspected scam/fraud'
    | 'Fake identity'
    | 'Fake proof/work'
    | 'Payment-related issue'
    | 'Harassment/abuse'
    | 'Spam'
    | 'Fraud'
    | 'Inappropriate content'
    | 'Fake task'
    | 'Payment issue'
    | 'Academic-integrity concern'
    | 'Other';
  description: string;
  evidence_url?: string;
  evidence_link?: string;
  status: ModerationReportStatus;
  created_at: string;
  resolved_at?: string;
  admin_notes?: string;
  reviewed_by?: string;
  action_taken?: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  admin_name?: string;
  action: string;
  target_type: string;
  target_id: string;
  target_name?: string;
  details: string;
  created_at: string;
}

export interface DatabaseSchema {
  countries: Country[];
  states: State[];
  cities: City[];
  colleges: College[];
  campuses: Campus[];
  college_requests: CollegeRequest[];
  categories: Category[];
  users: User[];
  tasks: Task[];
  task_files: TaskFile[];
  applications: Application[];
  orders: Order[];
  payments: Payment[];
  handovers: Handover[];
  disputes: Dispute[];
  reviews: Review[];
  notifications: Notification[];
  messages: Message[];
  verification_requests: VerificationRequest[];
  moderation_reports: ModerationReport[];
  audit_logs: AuditLog[];
}
