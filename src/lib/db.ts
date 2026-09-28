import fs from 'fs';
import path from 'path';
import { initialSeedData } from './seedData';
import {
  DatabaseSchema,
  User,
  UserRole,
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

  upsertUser(user: User): User {
    const data = loadDb();
    const idx = data.users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx !== -1) {
      data.users[idx] = { ...data.users[idx], ...user };
    } else {
      data.users.push(user);
    }
    saveDb(data);
    return idx !== -1 ? data.users[idx] : user;
  },


  toggleUserSuspension(id: string, reason?: string): User | null {
    const data = loadDb();
    const user = data.users.find((u) => u.id === id);
    if (!user) return null;
    user.is_suspended = !user.is_suspended;
    user.block_status = user.is_suspended ? 'PERMANENT' : 'NONE';
    user.suspension_reason = user.is_suspended ? reason || 'Policy violation' : undefined;
    if (!user.is_suspended) user.blocked_until = undefined;
    saveDb(data);
    return user;
  },

  warnUser(userId: string, reason: string, adminId: string, adminName: string): User | null {
    const data = loadDb();
    const user = data.users.find((u) => u.id === userId);
    if (!user) return null;

    if (!user.warnings) user.warnings = [];
    user.warning_count = (user.warning_count || 0) + 1;
    user.warnings.push({
      id: `warn-${Date.now().toString(36)}`,
      reason,
      warned_by: adminName,
      created_at: new Date().toISOString(),
    });

    data.notifications.unshift({
      id: `notif-${Date.now().toString(36)}`,
      user_id: user.id,
      type: 'WARNING_ISSUED',
      title: 'Official Moderator Warning ⚠️',
      message: `You have received an official moderation warning: "${reason}". Please adhere to TaskMate campus community guidelines.`,
      link: '/profile',
      read: false,
      created_at: new Date().toISOString(),
    });

    data.audit_logs.unshift({
      id: `aud-${Date.now().toString(36)}`,
      user_id: adminId,
      admin_name: adminName,
      action: 'WARN_USER',
      target_type: 'user',
      target_id: user.id,
      target_name: user.name,
      details: `Warning issued: "${reason}" (Total warnings: ${user.warning_count})`,
      created_at: new Date().toISOString(),
    });

    saveDb(data);
    return user;
  },

  blockUser(
    userId: string,
    type: 'TEMPORARY' | 'PERMANENT',
    reason: string,
    adminId: string,
    adminName: string,
    durationDays: number = 7
  ): User | null {
    const data = loadDb();
    const user = data.users.find((u) => u.id === userId);
    if (!user) return null;

    user.is_suspended = true;
    user.block_status = type;
    user.suspension_reason = reason;

    if (type === 'TEMPORARY') {
      const until = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
      user.blocked_until = until.toISOString();
    } else {
      user.blocked_until = undefined;
    }

    data.notifications.unshift({
      id: `notif-${Date.now().toString(36)}`,
      user_id: user.id,
      type: 'ACCOUNT_MODERATED',
      title: type === 'PERMANENT' ? 'Account Suspended Permanently ⛔' : `Account Suspended (${durationDays} Days) ⚠️`,
      message: type === 'PERMANENT'
        ? `Your TaskMate account has been permanently suspended due to: "${reason}".`
        : `Your account is temporarily suspended until ${new Date(user.blocked_until!).toLocaleDateString()} due to: "${reason}".`,
      link: '/profile',
      read: false,
      created_at: new Date().toISOString(),
    });

    data.audit_logs.unshift({
      id: `aud-${Date.now().toString(36)}`,
      user_id: adminId,
      admin_name: adminName,
      action: type === 'PERMANENT' ? 'BLOCK_USER_PERM' : 'BLOCK_USER_TEMP',
      target_type: 'user',
      target_id: user.id,
      target_name: user.name,
      details: `${type} suspension: "${reason}"${type === 'TEMPORARY' ? ` until ${user.blocked_until}` : ''}`,
      created_at: new Date().toISOString(),
    });

    saveDb(data);
    return user;
  },

  unblockUser(userId: string, adminId: string, adminName: string): User | null {
    const data = loadDb();
    const user = data.users.find((u) => u.id === userId);
    if (!user) return null;

    user.is_suspended = false;
    user.block_status = 'NONE';
    user.suspension_reason = undefined;
    user.blocked_until = undefined;

    data.notifications.unshift({
      id: `notif-${Date.now().toString(36)}`,
      user_id: user.id,
      type: 'ACCOUNT_MODERATED',
      title: 'Account Restored ✅',
      message: 'Your TaskMate account suspension has been lifted. Welcome back to the campus marketplace.',
      link: '/profile',
      read: false,
      created_at: new Date().toISOString(),
    });

    data.audit_logs.unshift({
      id: `aud-${Date.now().toString(36)}`,
      user_id: adminId,
      admin_name: adminName,
      action: 'UNBLOCK_USER',
      target_type: 'user',
      target_id: user.id,
      target_name: user.name,
      details: 'Account unblocked and restored to good standing',
      created_at: new Date().toISOString(),
    });

    saveDb(data);
    return user;
  },

  updateUserRole(userId: string, newRole: UserRole, adminId: string, adminName: string): User | null {
    const data = loadDb();
    const user = data.users.find((u) => u.id === userId);
    if (!user) return null;

    const oldRole = user.role;
    user.role = newRole;

    data.audit_logs.unshift({
      id: `aud-${Date.now().toString(36)}`,
      user_id: adminId,
      admin_name: adminName,
      action: 'UPDATE_USER_ROLE',
      target_type: 'user',
      target_id: user.id,
      target_name: user.name,
      details: `Role updated from ${oldRole} to ${newRole}`,
      created_at: new Date().toISOString(),
    });

    saveDb(data);
    return user;
  },

  removeTaskByAdmin(taskId: string, reason: string, adminId: string, adminName: string): Task | null {
    const data = loadDb();
    const task = data.tasks.find((t) => t.id === taskId);
    if (!task) return null;

    task.status = 'CANCELLED';

    data.notifications.unshift({
      id: `notif-${Date.now().toString(36)}`,
      user_id: task.requester_id,
      type: 'TASK_MODERATED',
      title: 'Task Removed by Moderator ⚠️',
      message: `Your task "${task.title}" was removed by moderation. Reason: ${reason}`,
      link: '/tasks',
      read: false,
      created_at: new Date().toISOString(),
    });

    data.audit_logs.unshift({
      id: `aud-${Date.now().toString(36)}`,
      user_id: adminId,
      admin_name: adminName,
      action: 'REMOVE_TASK',
      target_type: 'task',
      target_id: task.id,
      target_name: task.title,
      details: `Task cancelled/removed. Reason: "${reason}"`,
      created_at: new Date().toISOString(),
    });

    saveDb(data);
    return task;
  },

  getUserModerationContext(userId: string) {
    const data = loadDb();
    const user = data.users.find((u) => u.id === userId);
    if (!user) return null;

    const postedTasks = data.tasks.filter((t) => t.requester_id === userId);
    const assignedOrders = data.orders.filter((o) => o.worker_id === userId);
    const reportsAgainst = data.moderation_reports.filter((r) => r.reported_user_id === userId);
    const reportsFiled = data.moderation_reports.filter((r) => r.reporter_id === userId);
    const verification = data.verification_requests.find((v) => v.user_id === userId);
    const college = data.colleges.find((c) => c.id === user.college_id);

    return {
      user,
      college,
      postedTasks,
      assignedOrders,
      reportsAgainst,
      reportsFiled,
      verification,
    };
  },

  // Categories
  getCategories() {
    const data = loadDb();
    if (!data.categories.some((c) => c.id === 'cat-resume')) {
      data.categories.push({
        id: 'cat-resume',
        name: 'Resume/CV preparation',
        group: 'Student Services',
        description: 'Internship resumes, LaTeX formatting, ATS optimization',
        icon: 'FileText',
        bgColor: '#8DD8FF'
      });
      saveDb(data);
    }
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

  getTaskFiles(taskId: string): TaskFile[] {
    const data = loadDb();
    return data.task_files.filter((f) => f.task_id === taskId);
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
  getApplications(): Application[] {
    const data = loadDb();
    return data.applications;
  },

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
    syncRecordToSupabase('applications', newApp);
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

    // Automatically create/open private conversation between task giver and acceptor
    const initialMsg: Message = {
      id: `msg-${Date.now().toString(36)}`,
      order_id: orderId,
      sender_id: task.requester_id,
      message: `🎉 Task accepted! Private conversation opened between task giver and taskmate. Coordinate delivery time, location, and requirements here.`,
      created_at: new Date().toISOString()
    };
    data.messages.push(initialMsg);
    saveDb(data);
    syncRecordToSupabase('messages', initialMsg);

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

  getOrderByTaskId(taskId: string): (Order & { task?: Task; requester?: User; worker?: User }) | null {
    const data = loadDb();
    const order = data.orders.find((o) => o.task_id === taskId);
    if (!order) return null;
    return {
      ...order,
      task: data.tasks.find((t) => t.id === order.task_id),
      requester: data.users.find((u) => u.id === order.requester_id),
      worker: data.users.find((u) => u.id === order.worker_id)
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

  createMessage(orderId: string, senderId: string, message: string, attachment?: any): Message {
    const data = loadDb();
    const newMsg: Message = {
      id: `msg-${Date.now().toString(36)}`,
      order_id: orderId,
      sender_id: senderId,
      message,
      attachment: attachment || undefined,
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
  createVerificationRequest(req: {
    userId: string;
    collegeId?: string;
    collegeName?: string;
    collegeEmail?: string;
    studentIdNumber?: string;
    phone?: string;
    phoneVerified?: boolean;
    documentUrl?: string;
    documentFilename?: string;
    documentType?: string;
    userNotes?: string;
  }): VerificationRequest {
    const data = loadDb();
    const user = data.users.find((u) => u.id === req.userId);
    const college = req.collegeId ? data.colleges.find((c) => c.id === req.collegeId) : undefined;
    const now = new Date().toISOString();

    let existing = data.verification_requests.find((v) => v.user_id === req.userId);

    if (existing) {
      if (req.collegeId) existing.college_id = req.collegeId;
      if (req.collegeName || college?.name) existing.college_name = req.collegeName || college?.name || existing.college_name;
      if (req.collegeEmail) existing.college_email = req.collegeEmail;
      if (req.studentIdNumber) existing.student_id_number = req.studentIdNumber;
      if (req.phone) existing.phone = req.phone;
      if (req.phoneVerified !== undefined) existing.phone_verified = req.phoneVerified;
      if (req.documentUrl) existing.document_url = req.documentUrl;
      if (req.documentFilename) existing.document_filename = req.documentFilename;
      if (req.documentType) existing.document_type = req.documentType;
      if (req.userNotes) existing.user_notes = req.userNotes;
      existing.status = 'PENDING';
      existing.submission_date = now;
      existing.updated_at = now;
    } else {
      existing = {
        id: `vr-${Date.now().toString(36)}`,
        user_id: req.userId,
        user_name: user?.name || 'Student',
        user_email: user?.email || '',
        college_id: req.collegeId || user?.college_id || '',
        college_name: req.collegeName || college?.name || user?.custom_college_name || 'Campus College',
        college_email: req.collegeEmail || '',
        student_id_number: req.studentIdNumber || '',
        phone: req.phone || user?.phone || '',
        phone_verified: req.phoneVerified || false,
        document_url: req.documentUrl,
        document_filename: req.documentFilename,
        document_type: req.documentType,
        user_notes: req.userNotes,
        status: 'PENDING',
        submission_date: now,
        created_at: now,
        updated_at: now,
      };
      data.verification_requests.unshift(existing);
    }

    if (user) {
      user.verification_status = 'PENDING';
      // Crucial: Users must never be able to manually add, modify, or fake the badge.
      user.admin_verified = false;
      if (req.phone) user.phone = req.phone;
      if (req.phoneVerified) user.phone_verified = true;
    }

    saveDb(data);
    return existing;
  },

  getVerificationRequests(): VerificationRequest[] {
    const data = loadDb();
    return data.verification_requests;
  },

  reviewVerification(
    id: string,
    status: 'APPROVED' | 'REJECTED' | 'ADDITIONAL_INFO_REQUIRED' | 'ADDITIONAL_INFO_NEEDED',
    notes: string,
    reviewerId: string,
    reviewerName?: string
  ): VerificationRequest | null {
    const data = loadDb();
    const req = data.verification_requests.find((v) => v.id === id);
    if (!req) return null;

    const normalizedStatus = status === 'ADDITIONAL_INFO_NEEDED' ? 'ADDITIONAL_INFO_REQUIRED' : status;
    const now = new Date().toISOString();
    req.status = normalizedStatus;
    req.review_notes = notes;
    req.reviewed_by = reviewerName || reviewerId;
    req.reviewed_by_id = reviewerId;
    req.reviewed_at = now;
    req.updated_at = now;

    // Update user state: Verified Profile badge appears ONLY after admin approval
    const user = data.users.find((u) => u.id === req.user_id);
    if (user) {
      user.verification_status = normalizedStatus;
      if (normalizedStatus === 'APPROVED') {
        user.admin_verified = true;
        user.college_verified = true;
        if (req.college_id) user.college_id = req.college_id;
      } else {
        user.admin_verified = false;
      }
    }

    // User Notification using precise "Verified Profile" terminology
    let title = 'Verified Profile Update';
    let message = `Your verification status: ${notes}`;
    if (normalizedStatus === 'APPROVED') {
      title = 'Verified Profile Approved! ✓';
      message = `Your verification request has been approved by TaskMate administrators. Your Verified Profile badge is now active. Note: This badge indicates admin review and does not guarantee future transactions or behavior.`;
    } else if (normalizedStatus === 'REJECTED') {
      title = 'Verification Request Update';
      message = `Your verification request could not be approved. Reason: ${notes || 'Information provided did not meet criteria'}.`;
    } else if (normalizedStatus === 'ADDITIONAL_INFO_REQUIRED') {
      title = 'Action Required: Additional Information Needed';
      message = `TaskMate administrators reviewed your request and require additional information: "${notes}". Please submit the requested details in your profile.`;
    }

    data.notifications.unshift({
      id: `notif-${Date.now().toString(36)}`,
      user_id: req.user_id,
      type: 'VERIFICATION_UPDATE',
      title,
      message,
      link: '/profile',
      read: false,
      created_at: now,
    });

    data.audit_logs.unshift({
      id: `aud-${Date.now().toString(36)}`,
      user_id: reviewerId,
      admin_name: reviewerName || 'Administrator',
      action: 'REVIEW_VERIFICATION',
      target_type: 'verification',
      target_id: id,
      target_name: req.user_name,
      details: `${normalizedStatus}: ${notes}`,
      created_at: now,
    });

    saveDb(data);
    return req;
  },

  // Moderation Reports
  createModerationReport(report: {
    reporter_id: string;
    reporter_name: string;
    reporter_email?: string;
    reported_user_id?: string;
    reported_user_name?: string;
    related_task_id?: string;
    related_task_title?: string;
    reason: any;
    description: string;
    evidence_url?: string;
    evidence_link?: string;
  }): { success: boolean; report?: ModerationReport; error?: string } {
    const data = loadDb();

    // Prevent duplicate active reports from same reporter against same user
    if (report.reported_user_id) {
      const existing = data.moderation_reports.find(
        (r) =>
          r.reporter_id === report.reporter_id &&
          r.reported_user_id === report.reported_user_id &&
          (r.status === 'PENDING' || r.status === 'UNDER_REVIEW' || r.status === 'OPEN')
      );
      if (existing) {
        return {
          success: false,
          error: 'You have already submitted an active report for this user that is currently under review by our moderation team.',
        };
      }
    }

    const newRep: ModerationReport = {
      ...report,
      id: `rep-${Date.now().toString(36)}`,
      status: 'PENDING',
      created_at: new Date().toISOString()
    };
    data.moderation_reports.unshift(newRep);

    data.audit_logs.unshift({
      id: `aud-${Date.now().toString(36)}`,
      user_id: report.reporter_id,
      action: 'SUBMIT_REPORT',
      target_type: 'report',
      target_id: newRep.id,
      target_name: report.reported_user_name || 'User Report',
      details: `Report reason: "${report.reason}". Reported user: ${report.reported_user_name || report.reported_user_id}`,
      created_at: new Date().toISOString()
    });

    saveDb(data);
    return { success: true, report: newRep };
  },

  getModerationReports(): ModerationReport[] {
    const data = loadDb();
    return data.moderation_reports;
  },

  updateModerationReport(
    id: string,
    status: ModerationReport['status'],
    notes?: string,
    adminId?: string,
    adminName?: string,
    actionTaken?: string
  ): ModerationReport | null {
    const data = loadDb();
    const rep = data.moderation_reports.find((r) => r.id === id);
    if (!rep) return null;
    rep.status = status;
    if (notes !== undefined) rep.admin_notes = notes;
    if (actionTaken !== undefined) rep.action_taken = actionTaken;
    if (adminName) rep.reviewed_by = adminName;
    if (status === 'RESOLVED' || status === 'DISMISSED') {
      rep.resolved_at = new Date().toISOString();
    }

    if (adminId) {
      data.audit_logs.unshift({
        id: `aud-${Date.now().toString(36)}`,
        user_id: adminId,
        admin_name: adminName || 'Admin',
        action: 'REVIEW_REPORT',
        target_type: 'report',
        target_id: rep.id,
        target_name: rep.reported_user_name || 'Report',
        details: `Status set to ${status}. Notes: "${notes || 'None'}". Action taken: ${actionTaken || 'None'}`,
        created_at: new Date().toISOString(),
      });
    }

    saveDb(data);
    return rep;
  },

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    const data = loadDb();
    return data.audit_logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  createAuditLog(entry: {
    user_id: string;
    admin_name?: string;
    action: string;
    target_type: string;
    target_id: string;
    target_name?: string;
    details: string;
  }): AuditLog {
    const data = loadDb();
    const newLog: AuditLog = {
      id: `aud-${Date.now().toString(36)}`,
      ...entry,
      created_at: new Date().toISOString(),
    };
    data.audit_logs.unshift(newLog);
    saveDb(data);
    return newLog;
  }
};
