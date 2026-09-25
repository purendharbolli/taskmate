-- ==============================================================================
-- TASKMATE SUPABASE RELATIONAL SCHEMA
-- Hyperlocal Campus Student-to-Student Marketplace
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COUNTRIES
CREATE TABLE IF NOT EXISTS countries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- 2. STATES
CREATE TABLE IF NOT EXISTS states (
    id TEXT PRIMARY KEY,
    country_id TEXT REFERENCES countries(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

-- 3. CITIES
CREATE TABLE IF NOT EXISTS cities (
    id TEXT PRIMARY KEY,
    state_id TEXT REFERENCES states(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

-- 4. COLLEGES
CREATE TABLE IF NOT EXISTS colleges (
    id TEXT PRIMARY KEY,
    city_id TEXT REFERENCES cities(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    short_name TEXT,
    address TEXT,
    email_domain TEXT,
    verification_required BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CAMPUSES
CREATE TABLE IF NOT EXISTS campuses (
    id TEXT PRIMARY KEY,
    college_id TEXT REFERENCES colleges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    active BOOLEAN DEFAULT true
);

-- 6. USERS
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar TEXT,
    auth_provider TEXT DEFAULT 'google',
    provider_user_id TEXT,
    email_verified BOOLEAN DEFAULT false,
    college_verified BOOLEAN DEFAULT false,
    role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN')),
    country_id TEXT REFERENCES countries(id) ON DELETE SET NULL,
    state_id TEXT REFERENCES states(id) ON DELETE SET NULL,
    city_id TEXT REFERENCES cities(id) ON DELETE SET NULL,
    college_id TEXT REFERENCES colleges(id) ON DELETE SET NULL,
    campus_id TEXT REFERENCES campuses(id) ON DELETE SET NULL,
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    rating NUMERIC(3, 2) DEFAULT 5.0,
    completed_tasks INTEGER DEFAULT 0,
    completion_rate INTEGER DEFAULT 100,
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step INTEGER DEFAULT 1,
    earnings_total NUMERIC(10, 2) DEFAULT 0.0,
    earnings_available NUMERIC(10, 2) DEFAULT 0.0,
    earnings_pending NUMERIC(10, 2) DEFAULT 0.0,
    spent_total NUMERIC(10, 2) DEFAULT 0.0,
    is_suspended BOOLEAN DEFAULT false,
    suspension_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "group" TEXT NOT NULL CHECK ("group" IN ('Academic & Creative', 'Student Services', 'Creative', 'Campus Help')),
    description TEXT,
    icon TEXT,
    bg_color TEXT
);

-- 8. TASKS
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    requester_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    college_id TEXT REFERENCES colleges(id) ON DELETE CASCADE,
    campus_id TEXT REFERENCES campuses(id) ON DELETE SET NULL,
    city_id TEXT REFERENCES cities(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    budget NUMERIC(10, 2) NOT NULL,
    quantity TEXT,
    deadline TEXT NOT NULL,
    location TEXT NOT NULL,
    distance_approx TEXT,
    handover_method TEXT DEFAULT 'Campus meeting point',
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    view_count INTEGER DEFAULT 0
);

-- 9. TASK FILES
CREATE TABLE IF NOT EXISTS task_files (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size TEXT
);

-- 10. APPLICATIONS
CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    worker_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    proposed_price NUMERIC(10, 2) NOT NULL,
    completion_time TEXT,
    message TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. ORDERS
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    requester_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    worker_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) DEFAULT 20.0,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'PAYMENT_PENDING' CHECK (status IN (
        'PAYMENT_PENDING', 'PAYMENT_HELD', 'WORK_IN_PROGRESS', 
        'READY_FOR_HANDOVER', 'DELIVERED', 'DISPUTE_OPEN', 
        'UNDER_REVIEW', 'PAYMENT_RELEASED', 'REFUNDED'
    )),
    handover_otp TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ready_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE
);

-- 12. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'HELD', 'RELEASED', 'REFUNDED')),
    payment_method TEXT,
    transaction_ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    released_at TIMESTAMP WITH TIME ZONE
);

-- 13. HANDOVERS
CREATE TABLE IF NOT EXISTS handovers (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    otp_code TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'EXPIRED'))
);

-- 14. DISPUTES
CREATE TABLE IF NOT EXISTS disputes (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    opened_by TEXT REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('Work not received', 'Missing pages', 'Incorrect work', 'Poor quality', 'Other')),
    description TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED_REQUESTER', 'RESOLVED_WORKER', 'DISMISSED')),
    resolution_notes TEXT,
    resolved_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 15. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    reviewer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. MESSAGES (Task-Specific Chat)
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    sender_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. COLLEGE REQUESTS
CREATE TABLE IF NOT EXISTS college_requests (
    id TEXT PRIMARY KEY,
    requested_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    requester_name TEXT,
    college_name TEXT NOT NULL,
    city_id TEXT REFERENCES cities(id) ON DELETE CASCADE,
    city_name TEXT,
    website TEXT,
    email_domain TEXT,
    message TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. VERIFICATION REQUESTS
CREATE TABLE IF NOT EXISTS verification_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT,
    college_id TEXT REFERENCES colleges(id) ON DELETE CASCADE,
    college_name TEXT,
    college_email TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT
);

-- 20. MODERATION REPORTS
CREATE TABLE IF NOT EXISTS moderation_reports (
    id TEXT PRIMARY KEY,
    reporter_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    reporter_name TEXT,
    reported_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    reported_user_name TEXT,
    related_task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    related_order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
    reason TEXT NOT NULL CHECK (reason IN ('Fraud', 'Spam', 'Harassment', 'Inappropriate content', 'Fake task', 'Payment issue', 'Academic-integrity concern', 'Other')),
    description TEXT NOT NULL,
    evidence_url TEXT,
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT
);

-- 21. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active tasks and colleges for campus marketplace
CREATE POLICY "Public tasks viewable" ON tasks FOR SELECT USING (true);
CREATE POLICY "Public colleges viewable" ON colleges FOR SELECT USING (true);
CREATE POLICY "Public cities viewable" ON cities FOR SELECT USING (true);
CREATE POLICY "Public states viewable" ON states FOR SELECT USING (true);
CREATE POLICY "Public categories viewable" ON categories FOR SELECT USING (true);
CREATE POLICY "Public reviews viewable" ON reviews FOR SELECT USING (true);
