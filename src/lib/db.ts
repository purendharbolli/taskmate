import fs from 'fs';
import path from 'path';
import { initialSeedData } from './seedData';
import {
  DatabaseSchema,
  User,
  Task,
  TaskFile,
  Application,
  Order,
  Payment,
  Handover,
  Dispute,
  Review,
  Notification,
  Message,
  College,
  CollegeRequest,
  VerificationRequest,
  ModerationReport,
  AuditLog,
  City,
  State,
  Campus
} from './types';
import { syncRecordToSupabase } from './supabase';

const isVercel = process.env.VERCEL === '1' || process.env.NOW_REGION !== undefined;
const DB_DIR = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'taskmate_db.json');

// Global in-memory cache to guarantee fast responses and Vercel serverless compatibility
declare global {
  var __taskmate_memory_db: DatabaseSchema | undefined;
}

function loadDb(): DatabaseSchema {
  if (globalThis.__taskmate_memory_db) {
    return globalThis.__taskmate_memory_db;
  }

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      if (raw.trim()) {
        const parsed = JSON.parse(raw);
        globalThis.__taskmate_memory_db = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read db file from disk, using seed data:', err);
  }

  const initial = JSON.parse(JSON.stringify(initialSeedData));
  globalThis.__taskmate_memory_db = initial;
  saveDb(initial);
  return initial;
}

function saveDb(data: DatabaseSchema): void {
  globalThis.__taskmate_memory_db = data;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    // On Vercel lambda or restricted filesystem, disk write failure is non-fatal since memory cache is active
    console.warn('Notice: Disk write skipped or deferred in serverless environment:', (err as any)?.message);
  }
}

export const db = {
  // Reset db to clean seed data
  resetToSeed(): void {
    saveDb(initialSeedData);
  },

  getRaw(): DatabaseSchema {
    return loadDb();
  },

  // Location Hierarchy Queries (Cascading selectors)
  getCountries() {
    const data = loadDb();
    return data.countries;
  },

  getStates(countryId?: string): State[] {
    const data = loadDb();
    if (!countryId) return data.states;
    return data.states.filter((s) => s.country_id === countryId);
  },

  getCities(stateId?: string): City[] {
    const data = loadDb();
    if (!stateId) return data.cities;
    return data.cities.filter((c) => c.state_id === stateId);
  },

  getColleges(cityId?: string, activeOnly: boolean = false, area?: string): College[] {
    const data = loadDb();
    return data.colleges.filter((c) => {
      const matchCity = !cityId || c.city_id === cityId;
      const matchActive = !activeOnly || c.active;
      const matchArea = !area || area === 'all' || c.area === area;
      return matchCity && matchActive && matchArea;
    });
  },

  getAreas(cityId?: string): string[] {
    const data = loadDb();
    const cityColleges = data.colleges.filter((c) => !cityId || c.city_id === cityId);
    const set = new Set<string>();
    cityColleges.forEach((c) => {
      if (c.area) set.add(c.area);
    });
    return Array.from(set);
  },

  getCollegeById(id: string): College | undefined {
    const data = loadDb();
    return data.colleges.find((c) => c.id === id);
  },

  getCampuses(collegeId?: string): Campus[] {
    const data = loadDb();
    if (!collegeId) return data.campuses;
    return data.campuses.filter((c) => c.college_id === collegeId && c.active);
  },

  // Admin Location Management
  addCollege(college: Omit<College, 'id' | 'created_at'>): College {
    const data = loadDb();
    const newCollege: College = {
      ...college,
      id: `col-${Date.now().toString(36)}`,
      created_at: new Date().toISOString()
    };
    data.colleges.push(newCollege);
    saveDb(data);
    return newCollege;
  },

  updateCollege(id: string, updates: Partial<College>): College | null {
    const data = loadDb();
    const idx = data.colleges.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    data.colleges[idx] = { ...data.colleges[idx], ...updates };
    saveDb(data);
    return data.colleges[idx];
  },

  toggleCollegeActive(id: string): College | null {
    const data = loadDb();
    const college = data.colleges.find((c) => c.id === id);
    if (!college) return null;
    college.active = !college.active;
    saveDb(data);
    return college;
  },

  addCity(city: Omit<City, 'id'>): City {
    const data = loadDb();
    const newCity: City = {
      ...city,
      id: `city-${Date.now().toString(36)}`
    };
    data.cities.push(newCity);
    saveDb(data);
    return newCity;
  },

  addCampus(campus: Omit<Campus, 'id'>): Campus {
    const data = loadDb();
    const newCampus: Campus = {
      ...campus,
      id: `cam-${Date.now().toString(36)}`
    };
    data.campuses.push(newCampus);
    saveDb(data);
    return newCampus;
  },

  // College Addition Requests (Students request colleges)
  createCollegeRequest(req: Omit<CollegeRequest, 'id' | 'status' | 'created_at'>): CollegeRequest {
    const data = loadDb();
    const newReq: CollegeRequest = {
      ...req,
      id: `req-col-${Date.now().toString(36)}`,
      status: 'PENDING',
      created_at: new Date().toISOString()
    };
    data.college_requests.unshift(newReq);
    saveDb(data);
    return newReq;
  },

  getCollegeRequests(): CollegeRequest[] {
    const data = loadDb();
    return data.college_requests;
  },

  reviewCollegeRequest(id: string, status: 'APPROVED' | 'REJECTED', reviewerId: string): CollegeRequest | null {
    const data = loadDb();
    const req = data.college_requests.find((r) => r.id === id);
    if (!req) return null;

    req.status = status;
    req.reviewed_by = reviewerId;
    req.reviewed_at = new Date().toISOString();

    // If approved, automatically create the college in the colleges table
    if (status === 'APPROVED') {
      const newCollege: College = {
        id: `col-${Date.now().toString(36)}`,
        city_id: req.city_id,
        name: req.college_name,
        short_name: req.college_name.split(' ')[0] || req.college_name,
        address: `${req.city_name}, Telangana`,
        email_domain: req.email_domain || `${req.college_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu.in`,
        verification_required: true,
        active: true,
        created_at: new Date().toISOString()
      };
      data.colleges.push(newCollege);
    }

    saveDb(data);
    return req;
  },

  // Users
  getUsers(): User[] {
    const data = loadDb();
    return data.users;
  },

  getUserById(id: string): User | undefined {
    const data = loadDb();
    return data.users.find((u) => u.id === id);
  },

  getUserByEmail(email: string): User | undefined {
    const data = loadDb();
    return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at' | 'last_login_at'> & { id?: string }): User {
    const data = loadDb();
    const now = new Date().toISOString();
    const newUser: User = {
      ...user,
      id: user.id || `usr-${Date.now().toString(36)}`,
      created_at: now,
      updated_at: now,
      last_login_at: now
    };
    data.users.push(newUser);
    saveDb(data);
    syncRecordToSupabase('users', newUser);
    return newUser;
  },

  updateUser(id: string, updates: Partial<User>): User | null {
    const data = loadDb();
    const idx = data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    data.users[idx] = {
      ...data.users[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    saveDb(data);
    syncRecordToSupabase('users', data.users[idx]);
    return data.users[idx];
  },

  toggleUserSuspension(id: string, reason?: string): User | null {
    const data = loadDb();
    const user = data.users.find((u) => u.id === id);
    if (!user) return null;
    user.is_suspended = !user.is_suspended;
    user.suspension_reason = user.is_suspended ? reason || 'Policy violation' : undefined;
    saveDb(data);
    return user;
  },

  // Categories
  getCategories() {
    const data = loadDb();
    return data.categories;
  },

  // Tasks
  getTasks(filter?: {
    collegeId?: string;
    cityId?: string;
    categoryId?: string;
    search?: string;
    budgetMax?: number;
    status?: string;
    requesterId?: string;
  }): Task[] {
    const data = loadDb();
    let tasks = [...data.tasks];

    if (filter) {
      if (filter.status) {
        tasks = tasks.filter((t) => t.status === filter.status);
      }
      if (filter.requesterId) {
        tasks = tasks.filter((t) => t.requester_id === filter.requesterId);
      }
      if (filter.collegeId) {
        tasks = tasks.filter((t) => t.college_id === filter.collegeId);
      }
      if (filter.cityId) {
        tasks = tasks.filter((t) => t.city_id === filter.cityId);
      }
      if (filter.categoryId && filter.categoryId !== 'all') {
        tasks = tasks.filter((t) => t.category_id === filter.categoryId);
      }
      if (filter.budgetMax) {
        tasks = tasks.filter((t) => t.budget <= filter.budgetMax!);
      }
      if (filter.search && filter.search.trim()) {
        const q = filter.search.toLowerCase().trim();
        tasks = tasks.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.location.toLowerCase().includes(q)
        );
      }
    }

    return tasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getTaskById(id: string): { task: Task; files: TaskFile[]; requester?: User; category?: any; applications: Application[] } | null {
    const data = loadDb();
    const task = data.tasks.find((t) => t.id === id);
    if (!task) return null;

    const files = data.task_files.filter((f) => f.task_id === id);
    const requester = data.users.find((u) => u.id === task.requester_id);
    const category = data.categories.find((c) => c.id === task.category_id);
    const applications = data.applications.filter((a) => a.task_id === id);

    return {
      task,
      files,
      requester,
      category,
      applications
    };
  },

  createTask(task: Omit<Task, 'id' | 'created_at' | 'view_count' | 'status'>, files: Omit<TaskFile, 'id' | 'task_id'>[]): Task {
    const data = loadDb();
    const taskId = `tsk-${Date.now().toString(36)}`;
    const newTask: Task = {
      ...task,
      id: taskId,
      status: 'OPEN',
      created_at: new Date().toISOString(),
      view_count: 0
    };

    data.tasks.unshift(newTask);

    files.forEach((file, index) => {
      data.task_files.push({
        id: `tf-${taskId}-${index + 1}`,
        task_id: taskId,
        file_name: file.file_name,
        file_url: file.file_url,
        file_type: file.file_type,
        file_size: file.file_size || '1.2 MB'
      });
    });

    saveDb(data);
    syncRecordToSupabase('tasks', newTask);
    return newTask;
  },

  // Applications
  getApplicationsForTask(taskId: string): (Application & { worker?: User })[] {
    const data = loadDb();
    const apps = data.applications.filter((a) => a.task_id === taskId);
    return apps.map((app) => ({
      ...app,
      worker: data.users.find((u) => u.id === app.worker_id)
    }));
  },

  createApplication(app: Omit<Application, 'id' | 'status' | 'created_at'>): Application {
    const data = loadDb();
    // Check if worker already applied
    const existing = data.applications.find((a) => a.task_id === app.task_id && a.worker_id === app.worker_id);
    if (existing) {
      throw new Error('You have already applied for this task.');
    }

    const newApp: Application = {
      ...app,
      id: `app-${Date.now().toString(36)}`,
      status: 'PENDING',
      created_at: new Date().toISOString()
    };
    data.applications.push(newApp);

    // Create notification for requester
    const task = data.tasks.find((t) => t.id === app.task_id);
    const worker = data.users.find((u) => u.id === app.worker_id);
    if (task && worker) {
      data.notifications.unshift({
        id: `notif-${Date.now().toString(36)}`,
        user_id: task.requester_id,
        type: 'APPLICATION_RECEIVED',
        title: `New Applicant for ${task.title.slice(0, 30)}... ✍️`,
        message: `${worker.name} applied for ₹${app.proposed_price}: "${app.message.slice(0, 60)}..."`,
        link: `/tasks/${task.id}`,
        read: false,
        created_at: new Date().toISOString()
      });
    }

    saveDb(data);
    return newApp;
  },

  acceptApplication(applicationId: string): { order: Order; task: Task } {
    const data = loadDb();
    const app = data.applications.find((a) => a.id === applicationId);
    if (!app) throw new Error('Application not found');

    const task = data.tasks.find((t) => t.id === app.task_id);
    if (!task) throw new Error('Task not found');

    app.status = 'ACCEPTED';
    task.status = 'ASSIGNED';

    // Other applications rejected
    data.applications
      .filter((a) => a.task_id === app.task_id && a.id !== applicationId)
      .forEach((a) => {
        a.status = 'REJECTED';
      });

    // Create Order with status PAYMENT_PENDING
    const orderId = `ord-${Date.now().toString(36)}`;
    const platformFee = 20;
    const newOrder: Order = {
      id: orderId,
      task_id: task.id,
      requester_id: task.requester_id,
      worker_id: app.worker_id,
      amount: app.proposed_price,
      platform_fee: platformFee,
      total_amount: app.proposed_price + platformFee,
      status: 'PAYMENT_PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    data.orders.unshift(newOrder);

    // Notify worker
    data.notifications.unshift({
      id: `notif-${Date.now().toString(36)}`,
      user_id: app.worker_id,
      type: 'APPLICATION_ACCEPTED',
      title: 'Application Accepted! 🎉',
      message: `Your application for "${task.title.slice(0, 35)}..." was accepted. Awaiting payment lock.`,
      link: `/orders/${orderId}`,
      read: false,
      created_at: new Date().toISOString()
    });

    saveDb(data);
    syncRecordToSupabase('orders', newOrder);
    syncRecordToSupabase('tasks', task);
    return { order: newOrder, task };
  },

  // Orders & Payment Flow
  getOrders(userId?: string): (Order & { task?: Task; requester?: User; worker?: User })[] {
    const data = loadDb();
    let orders = [...data.orders];

    if (userId) {
      orders = orders.filter((o) => o.requester_id === userId || o.worker_id === userId);
    }

    return orders
      .map((o) => ({
        ...o,
        task: data.tasks.find((t) => t.id === o.task_id),
        requester: data.users.find((u) => u.id === o.requester_id),
        worker: data.users.find((u) => u.id === o.worker_id)
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getOrderById(id: string): (Order & { task?: Task; requester?: User; worker?: User; payment?: Payment; handover?: Handover; dispute?: Dispute; review?: Review }) | null {
    const data = loadDb();
    const order = data.orders.find((o) => o.id === id);
    if (!order) return null;

    return {
      ...order,
      task: data.tasks.find((t) => t.id === order.task_id),
      requester: data.users.find((u) => u.id === order.requester_id),
      worker: data.users.find((u) => u.id === order.worker_id),
      payment: data.payments.find((p) => p.order_id === order.id),
      handover: data.handovers.find((h) => h.order_id === order.id),
      dispute: data.disputes.find((d) => d.order_id === order.id),
      review: data.reviews.find((r) => r.order_id === order.id)
    };
  },

  // Simulate Payment Lock
  payAndStartTask(orderId: string, paymentMethod: string = 'TaskMate Mock Escrow'): Order {
    const data = loadDb();
    const order = data.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    order.status = 'PAYMENT_HELD';
    order.updated_at = new Date().toISOString();

    const payment: Payment = {
      id: `pay-${Date.now().toString(36)}`,
      order_id: order.id,
      amount: order.amount,
      platform_fee: order.platform_fee,
      status: 'HELD',
      payment_method: paymentMethod,
      transaction_ref: `TM-UPI-${Math.floor(1000000 + Math.random() * 9000000)}`,
      created_at: new Date().toISOString()
    };
    data.payments.push(payment);

    // Update worker and requester stats
    const worker = data.users.find((u) => u.id === order.worker_id);
    if (worker) {
      worker.earnings_pending += order.amount;
    }
    const requester = data.users.find((u) => u.id === order.requester_id);
    if (requester) {
      requester.spent_total += order.total_amount;
    }

    // Move to WORK_IN_PROGRESS automatically or via worker button
    order.status = 'WORK_IN_PROGRESS';

    // Notify worker
    data.notifications.unshift({
      id: `notif-${Date.now().toString(36)}`,
      user_id: order.worker_id,
      type: 'PAYMENT_SECURED',
      title: 'Payment Secured! ₹' + order.amount + ' Held 🔒',
      message: 'Requester has locked payment into TaskMate vault. You may now start work safely!',
      link: `/orders/${order.id}`,
      read: false,
      created_at: new Date().toISOString()
    });

    saveDb(data);
    syncRecordToSupabase('orders', order);
    return order;
  },

  // Worker marks task ready -> Generates 4-digit handover OTP visible ONLY to requester!
  markOrderReady(orderId: string): { order: Order; otp: string } {
    const data = loadDb();
    const order = data.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    order.status = 'READY_FOR_HANDOVER';
    order.handover_otp = otp;
    order.ready_at = new Date().toISOString();
    order.updated_at = new Date().toISOString();

    // Create or update handover record
    const existingHandover = data.handovers.find((h) => h.order_id === order.id);
    if (existingHandover) {
      existingHandover.otp_code = otp;
      existingHandover.otp_hash = otp;
      existingHandover.status = 'PENDING';
    } else {
      data.handovers.push({
        id: `hnd-${Date.now().toString(36)}`,
        order_id: order.id,
        otp_code: otp,
        otp_hash: otp,
        status: 'PENDING'
      });
    }

    // Notify requester with prompt instruction
    data.notifications.unshift({
      id: `notif-${Date.now().toString(36)}`,
      user_id: order.requester_id,
      type: 'HANDOVER_OTP',
      title: 'Your Task is Ready for Handover! 📦',
      message: `Worker has completed your task. Your handover OTP is ${otp}. Share this with the worker only after inspecting the work on campus!`,
      link: `/orders/${order.id}`,
      read: false,
      created_at: new Date().toISOString()
    });

    saveDb(data);
    syncRecordToSupabase('orders', order);
    return { order, otp };
  },

  // Worker enters OTP -> Verified -> Status moves to DELIVERED
  verifyHandoverOtp(orderId: string, enteredOtp: string): { success: boolean; message: string; order?: Order } {
    const data = loadDb();
    const order = data.orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };

    if (!order.handover_otp) {
      return { success: false, message: 'Handover OTP has not been generated for this order yet.' };
    }

    if (order.handover_otp.trim() !== enteredOtp.trim()) {
      return { success: false, message: 'Incorrect OTP. Please ask the requester to verify the 4-digit code.' };
    }

    // Correct OTP verified!
    const now = new Date().toISOString();
    order.status = 'DELIVERED';
    order.delivered_at = now;
    order.updated_at = now;

    const handover = data.handovers.find((h) => h.order_id === order.id);
    if (handover) {
      handover.status = 'VERIFIED';
      handover.verified_at = now;
    }

    // Update task
    const task = data.tasks.find((t) => t.id === order.task_id);
    if (task) {
      task.status = 'COMPLETED';
    }

    // Notifications to both parties
    data.notifications.unshift({
      id: `notif-${Date.now().toString(36)}`,
      user_id: order.requester_id,
      type: 'DELIVERY_CONFIRMED',
      title: 'Handover Confirmed! 🎉',
      message: 'Campus handover was verified. Please inspect your work and complete the order, or report any problems.',
      link: `/orders/${order.id}`,
      read: false,
      created_at: now
    });

    data.notifications.unshift({
      id: `notif-${Date.now().toString(36)}`,
      user_id: order.worker_id,
      type: 'DELIVERY_CONFIRMED',
      title: 'Handover Verified! ✅',
      message: 'OTP verified successfully. Order delivered. Payment will be released after confirmation.',
      link: `/orders/${order.id}`,
      read: false,
      created_at: now
    });

    saveDb(data);
    syncRecordToSupabase('orders', order);
    return { success: true, message: 'Delivery confirmed!', order };
  },

  // Requester completes order -> Status: PAYMENT_RELEASED
  completeOrder(orderId: string): Order {
    const data = loadDb();
    const order = data.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    const now = new Date().toISOString();
    order.status = 'PAYMENT_RELEASED';
    order.released_at = now;
    order.updated_at = now;

    // Update payment
    const payment = data.payments.find((p) => p.order_id === order.id);
    if (payment) {
      payment.status = 'RELEASED';
      payment.released_at = now;
    }

    // Release worker earnings
    const worker = data.users.find((u) => u.id === order.worker_id);
    if (worker) {
      worker.earnings_pending = Math.max(0, worker.earnings_pending - order.amount);
      worker.earnings_available += order.amount;
      worker.earnings_total += order.amount;
      worker.completed_tasks += 1;
    }

    const requester = data.users.find((u) => u.id === order.requester_id);
    if (requester) {
      requester.completed_tasks += 1;
    }

    // Notify worker
    data.notifications.unshift({
      id: `notif-${Date.now().toString(36)}`,
      user_id: order.worker_id,
      type: 'PAYMENT_RELEASED',
      title: 'Payment Released! ₹' + order.amount + ' Credited 💸',
      message: 'Requester has approved the work. Your earnings are now in your available balance!',
      link: `/dashboard`,
      read: false,
      created_at: now
    });

    saveDb(data);
    syncRecordToSupabase('orders', order);
    return order;
  },

  // Disputes
  openDispute(
    orderId: string,
    openedBy: string,
    reason: Dispute['reason'],
    description: string,
    evidenceUrls: string[] = []
  ): Dispute {
    const data = loadDb();
    const order = data.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('Order not found');

    order.status = 'DISPUTE_OPEN';
    order.updated_at = new Date().toISOString();

    const newDispute: Dispute = {
      id: `dsp-${Date.now().toString(36)}`,
      order_id: orderId,
      opened_by: openedBy,
      reason,
      description,
      evidence_urls: evidenceUrls,
      status: 'OPEN',
      created_at: new Date().toISOString()
    };
    data.disputes.unshift(newDispute);

    // Notify other party & admin
    const otherUserId = order.requester_id === openedBy ? order.worker_id : order.requester_id;
    data.notifications.unshift({
      id: `notif-${Date.now().toString(36)}`,
      user_id: otherUserId,
      type: 'DISPUTE_OPENED',
      title: 'Dispute Opened on Order #' + order.id.slice(-4),
      message: `A dispute has been raised (${reason}). Campus admin will review evidence.`,
      link: `/orders/${order.id}`,
      read: false,
      created_at: new Date().toISOString()
    });

    saveDb(data);
    return newDispute;
  },

  getDisputes(): (Dispute & { order?: Order; requester?: User; worker?: User })[] {
    const data = loadDb();
    return data.disputes.map((d) => {
      const order = data.orders.find((o) => o.id === d.order_id);
      return {
        ...d,
        order,
        requester: order ? data.users.find((u) => u.id === order.requester_id) : undefined,
        worker: order ? data.users.find((u) => u.id === order.worker_id) : undefined
      };
    });
  },

  resolveDispute(
    disputeId: string,
    resolution: 'RESOLVED_REQUESTER' | 'RESOLVED_WORKER' | 'DISMISSED',
    notes: string,
    resolvedBy: string
  ): Dispute {
    const data = loadDb();
    const dispute = data.disputes.find((d) => d.id === disputeId);
    if (!dispute) throw new Error('Dispute not found');

    const now = new Date().toISOString();
    dispute.status = resolution;
    dispute.resolution_notes = notes;
    dispute.resolved_by = resolvedBy;
    dispute.resolved_at = now;

    const order = data.orders.find((o) => o.id === dispute.order_id);
    if (order) {
      if (resolution === 'RESOLVED_REQUESTER') {
        order.status = 'REFUNDED';
        const payment = data.payments.find((p) => p.order_id === order.id);
        if (payment) payment.status = 'REFUNDED';
      } else if (resolution === 'RESOLVED_WORKER') {
        order.status = 'PAYMENT_RELEASED';
        const payment = data.payments.find((p) => p.order_id === order.id);
        if (payment) {
          payment.status = 'RELEASED';
          payment.released_at = now;
        }
        const worker = data.users.find((u) => u.id === order.worker_id);
        if (worker) {
          worker.earnings_available += order.amount;
        }
      }
      order.updated_at = now;
    }

    // Audit log
    data.audit_logs.unshift({
      id: `aud-${Date.now().toString(36)}`,
      user_id: resolvedBy,
      action: 'RESOLVE_DISPUTE',
      target_type: 'dispute',
      target_id: disputeId,
      details: `Resolved dispute with ${resolution}: ${notes}`,
      created_at: now
    });

    saveDb(data);
    return dispute;
  },

  // Reviews
  createReview(rev: Omit<Review, 'id' | 'created_at'>): Review {
    const data = loadDb();
    const newRev: Review = {
      ...rev,
      id: `rev-${Date.now().toString(36)}`,
      created_at: new Date().toISOString()
    };
    data.reviews.unshift(newRev);

    // Update reviewee rating
    const userReviews = data.reviews.filter((r) => r.reviewee_id === rev.reviewee_id);
    const avg = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    const targetUser = data.users.find((u) => u.id === rev.reviewee_id);
    if (targetUser) {
      targetUser.rating = Math.round(avg * 10) / 10;
    }

    // Notification
    data.notifications.unshift({
      id: `notif-${Date.now().toString(36)}`,
      user_id: rev.reviewee_id,
      type: 'NEW_REVIEW',
      title: 'New Star Review Received! ⭐',
      message: `You received a ${rev.rating}-star review: "${rev.comment.slice(0, 50)}..."`,
      link: `/profile/${rev.reviewee_id}`,
      read: false,
      created_at: new Date().toISOString()
    });

    saveDb(data);
    syncRecordToSupabase('reviews', newRev);
    return newRev;
  },

  getReviewsForUser(userId: string): (Review & { reviewer?: User })[] {
    const data = loadDb();
    return data.reviews
      .filter((r) => r.reviewee_id === userId)
      .map((r) => ({
        ...r,
        reviewer: data.users.find((u) => u.id === r.reviewer_id)
      }));
  },

  // Notifications
  getNotifications(userId: string): Notification[] {
    const data = loadDb();
    return data.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  markNotificationRead(id: string): void {
    const data = loadDb();
    const notif = data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      saveDb(data);
    }
  },

  markAllNotificationsRead(userId: string): void {
    const data = loadDb();
    data.notifications
      .filter((n) => n.user_id === userId)
      .forEach((n) => {
        n.read = true;
      });
    saveDb(data);
  },

  // Messages (Task-specific chat)
  getMessages(orderId: string): (Message & { sender?: User })[] {
    const data = loadDb();
    return data.messages
      .filter((m) => m.order_id === orderId)
      .map((m) => ({
        ...m,
        sender: data.users.find((u) => u.id === m.sender_id)
      }))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  },

  createMessage(orderId: string, senderId: string, message: string): Message {
    const data = loadDb();
    const newMsg: Message = {
      id: `msg-${Date.now().toString(36)}`,
      order_id: orderId,
      sender_id: senderId,
      message,
      created_at: new Date().toISOString()
    };
    data.messages.push(newMsg);

    // Notify the other party in this order
    const order = data.orders.find((o) => o.id === orderId);
    if (order) {
      const recipientId = order.requester_id === senderId ? order.worker_id : order.requester_id;
      const sender = data.users.find((u) => u.id === senderId);
      data.notifications.unshift({
        id: `notif-${Date.now().toString(36)}`,
        user_id: recipientId,
        type: 'MESSAGE_RECEIVED',
        title: `Message from ${sender ? sender.name : 'Peer'} 💬`,
        message: message.slice(0, 60),
        link: `/messages/${orderId}`,
        read: false,
        created_at: new Date().toISOString()
      });
    }

    saveDb(data);
    syncRecordToSupabase('messages', newMsg);
    return newMsg;
  },

  // Student Verification Requests
  createVerificationRequest(req: { userId: string; collegeId: string; collegeEmail: string }): VerificationRequest {
    const data = loadDb();
    const user = data.users.find((u) => u.id === req.userId);
    const college = data.colleges.find((c) => c.id === req.collegeId);

    const newReq: VerificationRequest = {
      id: `vr-${Date.now().toString(36)}`,
      user_id: req.userId,
      user_name: user?.name || 'Student',
      college_id: req.collegeId,
      college_name: college?.name || 'College',
      college_email: req.collegeEmail,
      status: 'PENDING',
      submission_date: new Date().toISOString()
    };
    data.verification_requests.unshift(newReq);
    saveDb(data);
    return newReq;
  },

  getVerificationRequests(): VerificationRequest[] {
    const data = loadDb();
    return data.verification_requests;
  },

  reviewVerification(id: string, status: 'APPROVED' | 'REJECTED', notes: string, reviewerId: string): VerificationRequest | null {
    const data = loadDb();
    const req = data.verification_requests.find((v) => v.id === id);
    if (!req) return null;

    const now = new Date().toISOString();
    req.status = status;
    req.review_notes = notes;
    req.reviewed_by = reviewerId;
    req.reviewed_at = now;

    // Update user college_verified flag
    const user = data.users.find((u) => u.id === req.user_id);
    if (user && status === 'APPROVED') {
      user.college_verified = true;
      user.college_id = req.college_id;
    }

    // Notify user
    data.notifications.unshift({
      id: `notif-${Date.now().toString(36)}`,
      user_id: req.user_id,
      type: 'VERIFICATION_UPDATE',
      title: status === 'APPROVED' ? 'Student Status Verified! 🎓' : 'Verification Update ⚠️',
      message: status === 'APPROVED'
        ? `You are now a Verified Student at ${req.college_name}! Verified badge added to your profile.`
        : `Your verification could not be approved. Reason: ${notes}`,
      link: `/profile`,
      read: false,
      created_at: now
    });

    data.audit_logs.unshift({
      id: `aud-${Date.now().toString(36)}`,
      user_id: reviewerId,
      action: 'REVIEW_VERIFICATION',
      target_type: 'verification',
      target_id: id,
      details: `${status}: ${notes}`,
      created_at: now
    });

    saveDb(data);
    return req;
  },

  // Moderation Reports
  createModerationReport(report: Omit<ModerationReport, 'id' | 'status' | 'created_at'>): ModerationReport {
    const data = loadDb();
    const newRep: ModerationReport = {
      ...report,
      id: `rep-${Date.now().toString(36)}`,
      status: 'OPEN',
      created_at: new Date().toISOString()
    };
    data.moderation_reports.unshift(newRep);
    saveDb(data);
    return newRep;
  },

  getModerationReports(): ModerationReport[] {
    const data = loadDb();
    return data.moderation_reports;
  },

  updateModerationReport(id: string, status: ModerationReport['status'], notes?: string): ModerationReport | null {
    const data = loadDb();
    const rep = data.moderation_reports.find((r) => r.id === id);
    if (!rep) return null;
    rep.status = status;
    rep.admin_notes = notes;
    rep.resolved_at = new Date().toISOString();
    saveDb(data);
    return rep;
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    const data = loadDb();
    return data.audit_logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
};
