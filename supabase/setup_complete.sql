-- ==============================================================================
-- TASKMATE COMPLETE SUPABASE SCHEMA & SEED DATA
-- Project: TaskMate Hyperlocal Campus Marketplace (zovopdunpcjhlrlnuoma)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. COUNTRIES TABLE
CREATE TABLE IF NOT EXISTS countries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
);

-- 3. STATES TABLE
CREATE TABLE IF NOT EXISTS states (
    id TEXT PRIMARY KEY,
    country_id TEXT REFERENCES countries(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

-- 4. CITIES TABLE
CREATE TABLE IF NOT EXISTS cities (
    id TEXT PRIMARY KEY,
    state_id TEXT REFERENCES states(id) ON DELETE CASCADE,
    name TEXT NOT NULL
);

-- 5. COLLEGES TABLE
CREATE TABLE IF NOT EXISTS colleges (
    id TEXT PRIMARY KEY,
    city_id TEXT REFERENCES cities(id) ON DELETE CASCADE,
    area TEXT,
    category_type TEXT,
    name TEXT NOT NULL,
    short_name TEXT,
    address TEXT,
    email_domain TEXT,
    verification_required BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CAMPUSES TABLE
CREATE TABLE IF NOT EXISTS campuses (
    id TEXT PRIMARY KEY,
    college_id TEXT REFERENCES colleges(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    active BOOLEAN DEFAULT true
);

-- 7. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    nickname TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar TEXT,
    auth_provider TEXT DEFAULT 'email',
    provider_user_id TEXT,
    password_hash TEXT,
    recovery_questions JSONB DEFAULT '[]'::jsonb,
    email_verified BOOLEAN DEFAULT true,
    college_verified BOOLEAN DEFAULT false,
    admin_verified BOOLEAN DEFAULT false,
    role TEXT DEFAULT 'USER',
    country_id TEXT REFERENCES countries(id) ON DELETE SET NULL,
    state_id TEXT REFERENCES states(id) ON DELETE SET NULL,
    city_id TEXT REFERENCES cities(id) ON DELETE SET NULL,
    area TEXT,
    college_id TEXT REFERENCES colleges(id) ON DELETE SET NULL,
    campus_id TEXT REFERENCES campuses(id) ON DELETE SET NULL,
    custom_college_name TEXT,
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

-- 8. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "group" TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    bg_color TEXT
);

-- 9. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    requester_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
    college_id TEXT REFERENCES colleges(id) ON DELETE SET NULL,
    campus_id TEXT REFERENCES campuses(id) ON DELETE SET NULL,
    city_id TEXT REFERENCES cities(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    budget NUMERIC(10, 2) NOT NULL,
    quantity TEXT,
    deadline TEXT NOT NULL,
    location TEXT NOT NULL,
    distance_approx TEXT,
    handover_method TEXT NOT NULL,
    google_drive_link TEXT,
    status TEXT DEFAULT 'OPEN',
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TASK FILES TABLE
CREATE TABLE IF NOT EXISTS task_files (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size TEXT,
    file_size_bytes BIGINT
);

-- 11. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    worker_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    proposed_price NUMERIC(10, 2) NOT NULL,
    completion_time TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
    requester_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    worker_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) DEFAULT 0.0,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'PAYMENT_PENDING',
    handover_otp TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ready_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE
);

-- 13. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    platform_fee NUMERIC(10, 2) DEFAULT 0.0,
    status TEXT DEFAULT 'HELD',
    payment_method TEXT DEFAULT 'UPI / Campus Escrow',
    transaction_ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    released_at TIMESTAMP WITH TIME ZONE
);

-- 14. HANDOVERS TABLE
CREATE TABLE IF NOT EXISTS handovers (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    otp_code TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    verified_at TIMESTAMP WITH TIME ZONE
);

-- 15. DISPUTES TABLE
CREATE TABLE IF NOT EXISTS disputes (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    opened_by TEXT REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'OPEN',
    resolution_notes TEXT,
    resolved_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 16. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    reviewer_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. NOTIFICATIONS TABLE
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

-- 18. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
    sender_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    attachment JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. COLLEGE REQUESTS TABLE
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
    status TEXT DEFAULT 'PENDING',
    reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. VERIFICATION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS verification_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT,
    college_id TEXT REFERENCES colleges(id) ON DELETE CASCADE,
    college_name TEXT,
    college_email TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT
);

-- 21. MODERATION REPORTS TABLE
CREATE TABLE IF NOT EXISTS moderation_reports (
    id TEXT PRIMARY KEY,
    reporter_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    reporter_name TEXT,
    reported_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    reported_user_name TEXT,
    related_task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
    related_order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_url TEXT,
    status TEXT DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT
);

-- 22. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE handovers ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE college_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- PERMISSIVE RLS POLICIES FOR ALL OPERATIONS (SELECT, INSERT, UPDATE)
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "allow_all_select_%s" ON %I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "allow_all_select_%s" ON %I FOR SELECT USING (true);', tbl, tbl);

        EXECUTE format('DROP POLICY IF EXISTS "allow_all_insert_%s" ON %I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "allow_all_insert_%s" ON %I FOR INSERT WITH CHECK (true);', tbl, tbl);

        EXECUTE format('DROP POLICY IF EXISTS "allow_all_update_%s" ON %I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "allow_all_update_%s" ON %I FOR UPDATE USING (true);', tbl, tbl);
    END LOOP;
END
$$;

-- ==============================================================================
-- SEED DATA INSERTIONS
-- ==============================================================================

-- 1. Countries
INSERT INTO countries (id, name) VALUES ('c-in', 'India') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. States
INSERT INTO states (id, country_id, name) VALUES ('st-tg', 'c-in', 'Telangana') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO states (id, country_id, name) VALUES ('st-ap', 'c-in', 'Andhra Pradesh') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO states (id, country_id, name) VALUES ('st-ka', 'c-in', 'Karnataka') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO states (id, country_id, name) VALUES ('st-mh', 'c-in', 'Maharashtra') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO states (id, country_id, name) VALUES ('st-tn', 'c-in', 'Tamil Nadu') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO states (id, country_id, name) VALUES ('st-dl', 'c-in', 'Delhi NCR') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. Cities
INSERT INTO cities (id, state_id, name) VALUES ('city-hyd', 'st-tg', 'Hyderabad') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO cities (id, state_id, name) VALUES ('city-wgl', 'st-tg', 'Warangal') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO cities (id, state_id, name) VALUES ('city-knr', 'st-tg', 'Karimnagar') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO cities (id, state_id, name) VALUES ('city-nzb', 'st-tg', 'Nizamabad') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO cities (id, state_id, name) VALUES ('city-vja', 'st-ap', 'Vijayawada') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO cities (id, state_id, name) VALUES ('city-vzg', 'st-ap', 'Visakhapatnam') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO cities (id, state_id, name) VALUES ('city-blr', 'st-ka', 'Bengaluru') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO cities (id, state_id, name) VALUES ('city-pun', 'st-mh', 'Pune') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO cities (id, state_id, name) VALUES ('city-chn', 'st-tn', 'Chennai') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
INSERT INTO cities (id, state_id, name) VALUES ('city-del', 'st-dl', 'Delhi') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 4. Colleges
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-snist', 'city-hyd', 'Ghatkesar / Pocharam', 'B.Tech / Engineering', 'SNIST - Sreenidhi Institute of Science and Technology', 'SNIST', 'Yamnampet, Ghatkesar, Hyderabad, Telangana 501301', 'sreenidhi.edu.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-anurag-u', 'city-hyd', 'Ghatkesar / Pocharam', 'University & Autonomous', 'Anurag University (Formerly CVSR)', 'Anurag Univ', 'Venkatapur, Ghatkesar, Hyderabad, Telangana 500088', 'anurag.edu.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-anurag-pharm', 'city-hyd', 'Ghatkesar / Pocharam', 'Pharmacy', 'Anurag College of Pharmacy', 'Anurag Pharmacy', 'Venkatapur, Ghatkesar, Hyderabad, Telangana 500088', 'anurag.edu.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-geethanjali', 'city-hyd', 'Ghatkesar / Pocharam', 'B.Tech / Engineering', 'Geethanjali College of Engineering and Technology', 'GCET', 'Cheeryal, Keesara, Ghatkesar Road, Hyderabad 501301', 'geethanjaliinstitutions.com', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-geethanjali-pharm', 'city-hyd', 'Ghatkesar / Pocharam', 'Pharmacy', 'Geethanjali College of Pharmacy', 'GCOP', 'Cheeryal, Keesara, Ghatkesar Road, Hyderabad 501301', 'geethanjaliinstitutions.com', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-samskruti-eng', 'city-hyd', 'Ghatkesar / Pocharam', 'B.Tech / Engineering', 'Samskruti College of Engineering and Technology', 'Samskruti Eng', 'Kondapur, Ghatkesar, Hyderabad 501301', 'samskruti.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-samskruti-pharm', 'city-hyd', 'Ghatkesar / Pocharam', 'Pharmacy', 'Samskruti Institute of Pharmacy', 'Samskruti Pharmacy', 'Kondapur, Ghatkesar, Hyderabad 501301', 'samskruti.ac.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-gdc-ghatkesar', 'city-hyd', 'Ghatkesar / Pocharam', 'Degree & PG', 'Government Degree College, Ghatkesar', 'GDC Ghatkesar', 'Near Railway Station, Ghatkesar, Telangana 501301', 'telangana.gov.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-vignan-eng', 'city-hyd', 'Ghatkesar / Pocharam', 'B.Tech / Engineering', 'Vignan Institute of Technology and Science (VITS)', 'VITS Deshmukhi', 'Deshmukhi Village, Pochampally / Ghatkesar Zone 508284', 'vignanits.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-princeton-pharm', 'city-hyd', 'Ghatkesar / Pocharam', 'Pharmacy', 'Princeton College of Pharmacy & Degree', 'Princeton', 'Korremula, Ghatkesar, Hyderabad 500088', 'princeton.edu.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-holymary-eng', 'city-hyd', 'Ghatkesar / Pocharam', 'B.Tech / Engineering', 'Holy Mary Institute of Technology and Science', 'HITS Bogaram', 'Bogaram, Keesara / Ghatkesar Road, Hyderabad 501301', 'hits.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-ouce', 'city-hyd', 'Uppal / Ramanthapur / Tarnaka', 'University & Autonomous', 'Osmania University - University College of Engineering', 'OUCE', 'Osmania University, Amberpet / Tarnaka, Hyderabad 500007', 'uceou.edu', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-ou-arts', 'city-hyd', 'Uppal / Ramanthapur / Tarnaka', 'Degree & PG', 'Osmania University - Arts & Science College', 'OU Arts', 'OU Campus, Tarnaka, Hyderabad 500007', 'osmania.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-aurora-deg', 'city-hyd', 'Uppal / Ramanthapur / Tarnaka', 'Degree & PG', 'Aurora''s Degree and PG College', 'Aurora Degree', 'Ramanthapur / Chikkadpally, Hyderabad 500013', 'aurora.edu.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-littleflower-deg', 'city-hyd', 'Uppal / Ramanthapur / Tarnaka', 'Degree & PG', 'Little Flower Degree College, Uppal', 'LFDC Uppal', 'Uppal X Roads, Hyderabad 500039', 'lfdc.edu.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-stmarys-centenary', 'city-hyd', 'Uppal / Ramanthapur / Tarnaka', 'Degree & PG', 'St. Mary''s Centenary Degree College', 'St. Mary''s', 'St. Francis Road, Secunderabad / Tarnaka 500025', 'smcdc.ac.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-ramanthapur-poly', 'city-hyd', 'Uppal / Ramanthapur / Tarnaka', 'Degree & PG', 'Government Polytechnic / Degree College, Ramanthapur', 'Govt Ramanthapur', 'Ramanthapur, Hyderabad 500013', 'telangana.gov.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-jntuh', 'city-hyd', 'Kukatpally / Nizampet / JNTU', 'University & Autonomous', 'JNTUH University College of Engineering Hyderabad', 'JNTUH CEH', 'Kukatpally, Hyderabad, Telangana 500085', 'jntuh.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-vnr', 'city-hyd', 'Kukatpally / Nizampet / JNTU', 'B.Tech / Engineering', 'VNR VJIET - Vallurupalli Nageswara Rao Vignana Jyothi Institute', 'VNR VJIET', 'Pragathi Nagar, Nizampet, Hyderabad 500090', 'vnrvjiet.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-siddhartha-kphb', 'city-hyd', 'Kukatpally / Nizampet / JNTU', 'Degree & PG', 'Siddhartha Degree & PG College, Kukatpally', 'Siddhartha KPHB', 'KPHB Colony, Kukatpally, Hyderabad 500072', 'siddharthadegree.edu.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-mnr-kphb', 'city-hyd', 'Kukatpally / Nizampet / JNTU', 'Degree & PG', 'MNR Degree & PG College, Kukatpally', 'MNR KPHB', 'Phase 3, KPHB Colony, Hyderabad 500072', 'mnrindia.org', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-griet', 'city-hyd', 'Bachupally / Miyapur / Dundigal', 'B.Tech / Engineering', 'GRIET - Gokaraju Rangaraju Institute of Engineering & Technology', 'GRIET', 'Bachupally, Kukatpally, Hyderabad, Telangana 500090', 'griet.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-grcp-pharm', 'city-hyd', 'Bachupally / Miyapur / Dundigal', 'Pharmacy', 'Gokaraju Rangaraju College of Pharmacy (GRCP)', 'GRCP', 'Bachupally, Hyderabad 500090', 'grcp.ac.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-bvrit-women', 'city-hyd', 'Bachupally / Miyapur / Dundigal', 'B.Tech / Engineering', 'BVRIT Hyderabad College of Engineering for Women', 'BVRIT Hyderabad', 'Bachupally, Nizampet Road, Hyderabad 500090', 'bvrithyderabad.edu.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-mlrit-eng', 'city-hyd', 'Bachupally / Miyapur / Dundigal', 'B.Tech / Engineering', 'MLR Institute of Technology (MLRIT)', 'MLRIT', 'Dundigal Police Station Road, Hyderabad 500043', 'mlrit.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-mlrip-pharm', 'city-hyd', 'Bachupally / Miyapur / Dundigal', 'Pharmacy', 'Marri Laxman Reddy Institute of Pharmacy (MLRIP)', 'MLR Pharmacy', 'Dundigal, Hyderabad 500043', 'mlrip.ac.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-iare-eng', 'city-hyd', 'Bachupally / Miyapur / Dundigal', 'B.Tech / Engineering', 'Institute of Aeronautical Engineering (IARE)', 'IARE', 'Dundigal, Hyderabad 500043', 'iare.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-mallareddy-u', 'city-hyd', 'Maisammaguda / Kompally / Medchal', 'University & Autonomous', 'Malla Reddy University', 'MRU', 'Maisammaguda, Dhulapally, Medchal, Hyderabad 500100', 'mallareddyuniversity.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-mrec-eng', 'city-hyd', 'Maisammaguda / Kompally / Medchal', 'B.Tech / Engineering', 'Malla Reddy Engineering College (MREC Autonomous)', 'MREC', 'Maisammaguda, Secunderabad / Medchal 500100', 'mrec.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-mrcet-eng', 'city-hyd', 'Maisammaguda / Kompally / Medchal', 'B.Tech / Engineering', 'Malla Reddy College of Engineering & Technology (MRCET)', 'MRCET', 'Maisammaguda, Dhulapally, Hyderabad 500100', 'mrcet.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-mrips-pharm', 'city-hyd', 'Maisammaguda / Kompally / Medchal', 'Pharmacy', 'Malla Reddy Institute of Pharmaceutical Sciences', 'MRIPS Pharmacy', 'Maisammaguda, Dhulapally, Hyderabad 500100', 'mrips.ac.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-cmr-eng', 'city-hyd', 'Maisammaguda / Kompally / Medchal', 'B.Tech / Engineering', 'CMR College of Engineering & Technology (CMRCET)', 'CMRCET', 'Kandlakoya, Medchal Road, Hyderabad 501401', 'cmrcet.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-cmr-tech', 'city-hyd', 'Maisammaguda / Kompally / Medchal', 'B.Tech / Engineering', 'CMR Technical Campus (CMRTC)', 'CMRTC', 'Kandlakoya, Medchal Road, Hyderabad 501401', 'cmrtc.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-cmr-pharm', 'city-hyd', 'Maisammaguda / Kompally / Medchal', 'Pharmacy', 'CMR College of Pharmacy', 'CMR Pharmacy', 'Kandlakoya, Medchal Road, Hyderabad 501401', 'cmrcp.ac.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-stmartins-eng', 'city-hyd', 'Maisammaguda / Kompally / Medchal', 'B.Tech / Engineering', 'St. Martin''s Engineering College', 'St. Martin''s', 'Dhulapally, Near Kompally, Secunderabad 500100', 'smec.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-sivasivani-deg', 'city-hyd', 'Maisammaguda / Kompally / Medchal', 'Degree & PG', 'Siva Sivani Degree & PG College, Kompally', 'Siva Sivani', 'NH 44, Kompally, Secunderabad 500100', 'sivasivani.org', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-cbit', 'city-hyd', 'Gandipet / Shankarpally / Ibrahimbagh', 'B.Tech / Engineering', 'CBIT - Chaitanya Bharathi Institute of Technology', 'CBIT', 'Gandipet, Hyderabad, Telangana 500075', 'cbit.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-mgit', 'city-hyd', 'Gandipet / Shankarpally / Ibrahimbagh', 'B.Tech / Engineering', 'MGIT - Mahatma Gandhi Institute of Technology', 'MGIT', 'Kokapet, Gandipet, Hyderabad 500075', 'mgit.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-vasavi', 'city-hyd', 'Gandipet / Shankarpally / Ibrahimbagh', 'B.Tech / Engineering', 'Vasavi College of Engineering', 'Vasavi', '9-5-81, Ibrahimbagh, Hyderabad, Telangana 500031', 'vce.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-lords-eng', 'city-hyd', 'Gandipet / Shankarpally / Ibrahimbagh', 'B.Tech / Engineering', 'Lords Institute of Engineering and Technology', 'Lords', 'Himayathsagar, Near Appa Junction, Hyderabad 500091', 'lords.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-icfai-univ', 'city-hyd', 'Gandipet / Shankarpally / Ibrahimbagh', 'University & Autonomous', 'ICFAI Foundation for Higher Education (IFHE / IBS)', 'ICFAI', 'Donthanapally, Shankarpally Road, Hyderabad 501203', 'ifheindia.org', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-iiit-hyd', 'city-hyd', 'Gachibowli / Madhapur / Hitec City', 'University & Autonomous', 'IIIT Hyderabad (International Institute of Info Tech)', 'IIIT Hyderabad', 'Gachibowli, Hyderabad, Telangana 500032', 'iiit.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-hcu-univ', 'city-hyd', 'Gachibowli / Madhapur / Hitec City', 'University & Autonomous', 'University of Hyderabad (HCU Central University)', 'HCU', 'Prof. C.R. Rao Road, Gachibowli, Hyderabad 500046', 'uohyd.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-nift-hyd', 'city-hyd', 'Gachibowli / Madhapur / Hitec City', 'Degree & PG', 'National Institute of Fashion Technology (NIFT)', 'NIFT Hyderabad', 'Madhapur, Near Hitec City, Hyderabad 500081', 'nift.ac.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-villamarie-deg', 'city-hyd', 'Gachibowli / Madhapur / Hitec City', 'Degree & PG', 'Villa Marie Degree College for Women', 'Villa Marie', 'Somajiguda / Jubilee Hills, Hyderabad 500082', 'villamariecollege.ac.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-cvr-eng', 'city-hyd', 'Ibrahimpatnam / Sagar Road', 'B.Tech / Engineering', 'CVR College of Engineering', 'CVR', 'Vastunagar, Mangalpalli, Ibrahimpatnam, RR Dist 501510', 'cvr.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-gnitc-eng', 'city-hyd', 'Ibrahimpatnam / Sagar Road', 'B.Tech / Engineering', 'Guru Nanak Institutions Technical Campus (GNITC)', 'GNITC', 'Khanapur, Ibrahimpatnam, Hyderabad 501506', 'gniindia.org', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-gnit-pharm', 'city-hyd', 'Ibrahimpatnam / Sagar Road', 'Pharmacy', 'Guru Nanak Institute of Pharmacy', 'GNI Pharmacy', 'Khanapur, Ibrahimpatnam, Hyderabad 501506', 'gniindia.org', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-biet-eng', 'city-hyd', 'Ibrahimpatnam / Sagar Road', 'B.Tech / Engineering', 'Bharat Institute of Engineering and Technology (BIET)', 'BIET', 'Mangalpalli, Ibrahimpatnam, Hyderabad 501510', 'biet.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-avn-eng', 'city-hyd', 'Ibrahimpatnam / Sagar Road', 'B.Tech / Engineering', 'AVN Institute of Engineering and Technology', 'AVN Eng', 'Patelguda, Ibrahimpatnam, Hyderabad 501510', 'avniet.ac.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-bhavans-newscience', 'city-hyd', 'LB Nagar / Dilsukhnagar / Hayathnagar', 'Degree & PG', 'Bhavans New Science Degree College', 'Bhavans New Science', 'Narayanguda / Dilsukhnagar, Hyderabad 500029', 'bhavans.ac.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-siddhartha-dilsukh', 'city-hyd', 'LB Nagar / Dilsukhnagar / Hayathnagar', 'Degree & PG', 'Siddhartha Degree College, Dilsukhnagar', 'Siddhartha Dilsukhnagar', 'Near Metro Station, Dilsukhnagar, Hyderabad 500036', 'siddharthadegree.edu.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-gdc-hayathnagar', 'city-hyd', 'LB Nagar / Dilsukhnagar / Hayathnagar', 'Degree & PG', 'Government Degree College, Hayathnagar', 'GDC Hayathnagar', 'Hayathnagar, Hyderabad, Telangana 501505', 'telangana.gov.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-vijaya-pharm', 'city-hyd', 'LB Nagar / Dilsukhnagar / Hayathnagar', 'Pharmacy', 'Vijaya College of Pharmacy, Hayathnagar', 'Vijaya Pharmacy', 'Hayathnagar, Hyderabad 501505', 'vijayapharmacy.edu.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-nizam-deg', 'city-hyd', 'Ameerpet / Begumpet / Somajiguda', 'University & Autonomous', 'Nizam College (Autonomous - Osmania University)', 'Nizam College', 'Basheerbagh, Hyderabad 500001', 'nizamcollege.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-stfrancis-deg', 'city-hyd', 'Ameerpet / Begumpet / Somajiguda', 'Degree & PG', 'St. Francis College for Women, Begumpet', 'St. Francis', 'Uma Nagar, Begumpet, Hyderabad 500016', 'sfc.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-gdc-begumpet', 'city-hyd', 'Ameerpet / Begumpet / Somajiguda', 'Degree & PG', 'Government Degree College for Women, Begumpet', 'GDCW Begumpet', 'Begumpet, Hyderabad 500016', 'telangana.gov.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-bhavans-vivekananda', 'city-hyd', 'Secunderabad / Alwal / ECIL', 'Degree & PG', 'Bhavan''s Vivekananda College of Science, Humanities & Commerce', 'BVC Sainikpuri', 'Sainikpuri, Secunderabad, Telangana 500094', 'bhavansvc.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-loyola-alwal', 'city-hyd', 'Secunderabad / Alwal / ECIL', 'University & Autonomous', 'Loyola Academy Degree & PG College, Alwal', 'Loyola Academy', 'Old Alwal, Secunderabad 500010', 'loyolaacademyugpg.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-stanns-sec', 'city-hyd', 'Secunderabad / Alwal / ECIL', 'Degree & PG', 'St. Ann''s College, Secunderabad', 'St. Ann''s Sec', 'Clock Tower, Secunderabad 500003', 'stannscollege.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-stanns-mehdi', 'city-hyd', 'Mehdipatnam / Masab Tank / Tolichowki', 'Degree & PG', 'St. Ann''s College for Women, Mehdipatnam', 'St. Ann''s Mehdi', 'Santoshnagar Colony, Mehdipatnam, Hyderabad 500028', 'stannscollegehyd.com', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-mjcet-eng', 'city-hyd', 'Mehdipatnam / Masab Tank / Tolichowki', 'B.Tech / Engineering', 'Muffakham Jah College of Engineering & Technology (MJCET)', 'MJCET', 'Mount Pleasant, 8-2-249, Road No. 3, Banjara Hills 500034', 'mjcollege.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-sultan-pharm', 'city-hyd', 'Mehdipatnam / Masab Tank / Tolichowki', 'Pharmacy', 'Sultan-Ul-Uloom College of Pharmacy', 'Sultan Pharmacy', 'Mount Pleasant, Road No 3, Banjara Hills, Hyderabad 500034', 'supharmacy.ac.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-shadan-eng', 'city-hyd', 'Mehdipatnam / Masab Tank / Tolichowki', 'B.Tech / Engineering', 'Shadan College of Engineering & Technology', 'Shadan Eng', 'Peerancheru, Himayatsagar Road, Hyderabad 500008', 'scet.in', false, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-pjtsau-univ', 'city-hyd', 'Shamshabad / Rajendranagar', 'University & Autonomous', 'PJTSAU - Agricultural University', 'PJTSAU', 'Rajendranagar, Hyderabad, Telangana 500030', 'pjtsau.edu.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-vardhaman-eng', 'city-hyd', 'Shamshabad / Rajendranagar', 'B.Tech / Engineering', 'Vardhaman College of Engineering', 'Vardhaman', 'Kacharam, Shamshabad, Hyderabad 501218', 'vardhaman.org', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-nitw', 'city-wgl', 'Kazipet / Hanamkonda', 'University & Autonomous', 'NIT Warangal - National Institute of Technology', 'NITW', 'Kazipet, Hanamkonda, Warangal, Telangana 506004', 'nitw.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-kits', 'city-wgl', 'Hasanparthy', 'B.Tech / Engineering', 'KITS - Kakatiya Institute of Technology & Science', 'KITSW', 'Yerragattu Gutta, Hasanparthy, Warangal, Telangana 506015', 'kitsw.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-rvce', 'city-blr', 'Mysore Road', 'B.Tech / Engineering', 'RV College of Engineering', 'RVCE', 'Mysore Road, Bengaluru, Karnataka 560059', 'rvce.edu.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;
INSERT INTO colleges (id, city_id, area, category_type, name, short_name, address, email_domain, verification_required, active) VALUES ('col-bmsce', 'city-blr', 'Basavanagudi', 'B.Tech / Engineering', 'BMS College of Engineering', 'BMSCE', 'Bull Temple Rd, Basavanagudi, Bengaluru, Karnataka 560019', 'bmsce.ac.in', true, true) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, area = EXCLUDED.area, category_type = EXCLUDED.category_type;

-- 5. Categories
INSERT INTO categories (id, name, "group", description, icon, bg_color) VALUES ('cat-record', 'Record Writing', 'Academic & Creative', 'Handwritten lab record notebooks copying where permitted', 'BookOpen', '#FFD84D') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO categories (id, name, "group", description, icon, bg_color) VALUES ('cat-notes', 'Notes Copying', 'Academic & Creative', 'Neat handwriting copies of classroom & lecture notes', 'FileText', '#8DD8FF') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO categories (id, name, "group", description, icon, bg_color) VALUES ('cat-diagrams', 'Diagrams & Charts', 'Academic & Creative', 'Engineering, circuit, and biology diagrams on chart sheets', 'PieChart', '#FF8FB8') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO categories (id, name, "group", description, icon, bg_color) VALUES ('cat-ppt', 'PPT Creation', 'Academic & Creative', 'Seminar, project, and tech-talk PowerPoint slide decks', 'Presentation', '#FFD84D') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO categories (id, name, "group", description, icon, bg_color) VALUES ('cat-poster', 'Poster Design', 'Creative', 'College club banners, project posters, and Canva graphics', 'Palette', '#8DD8FF') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO categories (id, name, "group", description, icon, bg_color) VALUES ('cat-print', 'Printing & Binding', 'Student Services', 'High-speed xerox, color prints, and spiral binding pickup', 'Printer', '#FF8FB8') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO categories (id, name, "group", description, icon, bg_color) VALUES ('cat-scan', 'Scanning & Digitizing', 'Student Services', 'CamScanner / OCR scanning of physical notes into PDF', 'Scan', '#FFD84D') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO categories (id, name, "group", description, icon, bg_color) VALUES ('cat-format', 'Formatting & LaTeX', 'Academic & Creative', 'IEEE report styling, margins, bibliography formatting', 'FileCode', '#8DD8FF') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO categories (id, name, "group", description, icon, bg_color) VALUES ('cat-data', 'Data Entry', 'Student Services', 'Excel spreadsheets, Google Forms data compiling', 'Database', '#FF8FB8') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO categories (id, name, "group", description, icon, bg_color) VALUES ('cat-thumb', 'Thumbnail Design', 'Creative', 'YouTube thumbnails for student creators & college channels', 'Image', '#FFD84D') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO categories (id, name, "group", description, icon, bg_color) VALUES ('cat-errand', 'Campus Errands', 'Campus Help', 'Pickup stationary, cafeteria queue, library book drops', 'ShoppingBag', '#FF8FB8') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO categories (id, name, "group", description, icon, bg_color) VALUES ('cat-event', 'Event Assistance', 'Campus Help', 'Fest setup, registration desk, sound check support', 'Users', '#8DD8FF') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO categories (id, name, "group", description, icon, bg_color) VALUES ('cat-other', 'Other Assistance', 'Campus Help', 'Other legitimate student-to-student peer assistance', 'HelpCircle', '#FF8FB8') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;
INSERT INTO categories (id, name, "group", description, icon, bg_color) VALUES ('cat-resume', 'Resume/CV preparation', 'Student Services', 'Internship resumes, LaTeX formatting, ATS optimization', 'FileText', '#8DD8FF') ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 6. Storage Buckets & Policies for Task Attachments (50 MB limit)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('task-attachments', 'task-attachments', true, 52428800)
ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 52428800;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public Access for task-attachments'
  ) THEN
    CREATE POLICY "Public Access for task-attachments" ON storage.objects
      FOR SELECT USING (bucket_id = 'task-attachments');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public Uploads for task-attachments'
  ) THEN
    CREATE POLICY "Public Uploads for task-attachments" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'task-attachments');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public Updates for task-attachments'
  ) THEN
    CREATE POLICY "Public Updates for task-attachments" ON storage.objects
      FOR UPDATE USING (bucket_id = 'task-attachments');
  END IF;
END $$;
