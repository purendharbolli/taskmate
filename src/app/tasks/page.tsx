'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  X,
  PlusCircle,
  Clock,
  MapPin,
  Inbox,
  ArrowRight,
  Sparkles,
  GraduationCap,
  Building2,
  Filter,
  RotateCcw,
  Check,
  ArrowUpDown,
  Tag,
  DollarSign,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { TaskCard } from '@/components/TaskCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { Task, Category, College, City, User } from '@/lib/types';
import clsx from 'clsx';

export default function TasksPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  // College Prioritization State
  const [activeCollegeId, setActiveCollegeId] = useState<string>('col-snist');
  const [showCampusPicker, setShowCampusPicker] = useState(false);

  // Scope Tab: 'all' | 'college' | 'nearby' | 'other'
  const [scopeTab, setScopeTab] = useState<'all' | 'college' | 'nearby' | 'other'>('all');

  // Filter & Search States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('OPEN');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [maxBudget, setMaxBudget] = useState(2000);
  const [selectedDeadline, setSelectedDeadline] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'recommended' | 'newest' | 'deadline' | 'budget_high' | 'budget_low'
  >('recommended');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // 1. Fetch current logged-in user profile to automatically set primary college
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
          if (data.user.college_id) {
            setActiveCollegeId(data.user.college_id);
          }
        }
      })
      .catch(() => {});
  }, []);

  // 2. Fetch tasks and metadata
  const fetchTasks = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search.trim()) query.set('search', search.trim());
    if (selectedCategory !== 'all') query.set('categoryId', selectedCategory);
    if (selectedCollege !== 'all') query.set('collegeId', selectedCollege);
    if (selectedCity !== 'all') query.set('cityId', selectedCity);
    if (selectedStatus !== 'all') query.set('status', selectedStatus);
    if (maxBudget) query.set('budgetMax', maxBudget.toString());

    fetch(`/api/tasks?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setTasks(data.tasks || []);
        if (data.categories) setCategories(data.categories);
        if (data.colleges) setColleges(data.colleges);
        if (data.cities) setCities(data.cities);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // Initial fetch of locations
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        if (data.colleges) setColleges(data.colleges);
        if (data.cities) setCities(data.cities);
      })
      .catch(() => {});

    fetchTasks();
  }, [selectedCategory, selectedCollege, selectedCity, selectedStatus, maxBudget]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTasks();
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedCollege('all');
    setSelectedCity('all');
    setSelectedStatus('OPEN');
    setSelectedPriceRange('all');
    setMaxBudget(2000);
    setSelectedDeadline('all');
    setSortBy('recommended');
    setScopeTab('all');
  };

  // Active college and city information
  const activeCollege = useMemo(() => {
    return colleges.find((c) => c.id === activeCollegeId) || colleges.find((c) => c.id === 'col-snist');
  }, [colleges, activeCollegeId]);

  const activeCityId = activeCollege?.city_id || currentUser?.city_id || 'city-hyd';
  const activeCity = useMemo(() => {
    return cities.find((c) => c.id === activeCityId);
  }, [cities, activeCityId]);

  // Client-side filtration for price range & deadline
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Price range filter
      if (selectedPriceRange === 'under_200' && task.budget > 200) return false;
      if (selectedPriceRange === '200_500' && (task.budget < 200 || task.budget > 500)) return false;
      if (selectedPriceRange === '500_1000' && (task.budget < 500 || task.budget > 1000)) return false;
      if (selectedPriceRange === 'above_1000' && task.budget < 1000) return false;

      // Deadline filter
      if (selectedDeadline !== 'all') {
        const d = (task.deadline || '').toLowerCase();
        if (selectedDeadline === 'urgent') {
          const isUrgent =
            d.includes('today') ||
            d.includes('tomorrow') ||
            d.includes('tonight') ||
            d.includes('in 1 day') ||
            d.includes('in 24');
          if (!isUrgent) return false;
        } else if (selectedDeadline === '2-3days') {
          const is23Days =
            d.includes('2 day') ||
            d.includes('3 day') ||
            d.includes('in 2') ||
            d.includes('in 3') ||
            d.includes('tomorrow');
          if (!is23Days) return false;
        } else if (selectedDeadline === 'week') {
          const isWeek =
            d.includes('week') ||
            d.includes('sat') ||
            d.includes('sun') ||
            d.includes('thurs') ||
            d.includes('fri') ||
            d.includes('in 4') ||
            d.includes('in 5');
          if (!isWeek) return false;
        }
      }

      return true;
    });
  }, [tasks, selectedPriceRange, selectedDeadline]);

  // Determine Proximity Tier for any task
  const getProximityTier = (task: Task): 'own_college' | 'nearby' | 'other' => {
    if (task.college_id === activeCollegeId || task.college?.id === activeCollegeId) {
      return 'own_college';
    }
    const taskCityId = task.city_id || task.college?.city_id;
    if (taskCityId && taskCityId === activeCityId) {
      return 'nearby';
    }
    return 'other';
  };

  // Split tasks into 3 distinct hierarchical tiers
  const { ownCollegeTasks, nearbyTasks, otherTasks } = useMemo(() => {
    const own: Task[] = [];
    const nearby: Task[] = [];
    const other: Task[] = [];

    filteredTasks.forEach((t) => {
      const tier = getProximityTier(t);
      if (tier === 'own_college') own.push(t);
      else if (tier === 'nearby') nearby.push(t);
      else other.push(t);
    });

    return {
      ownCollegeTasks: own,
      nearbyTasks: nearby,
      otherTasks: other,
    };
  }, [filteredTasks, activeCollegeId, activeCityId]);

  // Sorter helper inside tiers
  const sortGroup = (group: Task[]): Task[] => {
    return [...group].sort((a, b) => {
      // Availability/Status factor: OPEN tasks always rank first
      if (a.status === 'OPEN' && b.status !== 'OPEN') return -1;
      if (a.status !== 'OPEN' && b.status === 'OPEN') return 1;

      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'budget_high') {
        return b.budget - a.budget;
      }
      if (sortBy === 'budget_low') {
        return a.budget - b.budget;
      }
      if (sortBy === 'deadline') {
        return a.deadline.localeCompare(b.deadline);
      }
      // 'recommended': Recency + deadline urgency
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  const sortedOwnCollegeTasks = useMemo(() => sortGroup(ownCollegeTasks), [ownCollegeTasks, sortBy]);
  const sortedNearbyTasks = useMemo(() => sortGroup(nearbyTasks), [nearbyTasks, sortBy]);
  const sortedOtherTasks = useMemo(() => sortGroup(otherTasks), [otherTasks, sortBy]);

  // Tasks to display based on active Scope Tab
  const displayedTasks = useMemo(() => {
    if (scopeTab === 'college') return sortedOwnCollegeTasks;
    if (scopeTab === 'nearby') return sortedNearbyTasks;
    if (scopeTab === 'other') return sortedOtherTasks;

    // 'all' scope: Ranked order 1. Own College -> 2. Nearby -> 3. Other Colleges
    return [...sortedOwnCollegeTasks, ...sortedNearbyTasks, ...sortedOtherTasks];
  }, [scopeTab, sortedOwnCollegeTasks, sortedNearbyTasks, sortedOtherTasks]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedCollege !== 'all') count++;
    if (selectedCity !== 'all') count++;
    if (selectedStatus !== 'OPEN') count++;
    if (selectedPriceRange !== 'all') count++;
    if (maxBudget < 2000) count++;
    if (selectedDeadline !== 'all') count++;
    if (search.trim()) count++;
    return count;
  }, [
    selectedCategory,
    selectedCollege,
    selectedCity,
    selectedStatus,
    selectedPriceRange,
    maxBudget,
    selectedDeadline,
    search,
  ]);

  const cardVariants: ('white' | 'yellow' | 'blue' | 'pink')[] = [
    'white',
    'yellow',
    'white',
    'blue',
    'white',
    'pink',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6">
      {/* 1. Header & Post Task CTA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-black/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <BrutalBadge variant="yellow" size="sm">
              CAMPUS DISCOVERY
            </BrutalBadge>
            <span className="text-xs font-black text-black/70">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-taskBlack">
            Find Campus Tasks
          </h1>
          <p className="text-xs sm:text-sm font-bold text-taskBlack/70 mt-1">
            Student peer assistance on campus. Tasks from your college appear first.
          </p>
        </div>

        <Link href="/tasks/create">
          <BrutalButton variant="yellow" size="lg" className="w-full sm:w-auto">
            <PlusCircle className="w-4 h-4 stroke-[3]" />
            <span>POST A TASK</span>
          </BrutalButton>
        </Link>
      </div>

      {/* 2. College Priority Banner (Automatic from Profile or Switchable) */}
      <div className="bg-[#FFFEEA] brutal-border p-4 brutal-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-taskYellow brutal-border flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider bg-taskYellow px-1.5 py-0.5 border border-black">
                {currentUser?.college_id ? 'YOUR PROFILE CAMPUS' : 'ACTIVE CAMPUS PRIORITY'}
              </span>
              <span className="text-xs font-bold text-black/60">
                {activeCity?.name || 'Hyderabad'}
              </span>
            </div>
            <div className="font-black text-base text-taskBlack mt-0.5 flex items-center gap-1.5">
              <span>{activeCollege?.name || 'SNIST - Sreenidhi Institute of Science and Technology'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <div className="relative">
            <button
              onClick={() => setShowCampusPicker(!showCampusPicker)}
              className="brutal-btn bg-white px-3 py-1.5 text-xs font-black uppercase flex items-center gap-1.5 hover:bg-zinc-50"
            >
              <span>{showCampusPicker ? 'Close' : 'Change Campus'}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Campus Selector Dropdown */}
            {showCampusPicker && (
              <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white brutal-border brutal-shadow p-3 z-30 space-y-2">
                <div className="text-[11px] font-black uppercase text-taskBlack/70 pb-1 border-b border-black/10">
                  Select your campus to prioritize:
                </div>
                <div className="max-h-56 overflow-y-auto space-y-1">
                  {colleges.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveCollegeId(c.id);
                        setShowCampusPicker(false);
                      }}
                      className={clsx(
                        'w-full text-left px-2.5 py-2 text-xs font-bold transition-all flex items-center justify-between border',
                        activeCollegeId === c.id
                          ? 'bg-taskYellow border-black font-black'
                          : 'hover:bg-zinc-100 border-transparent'
                      )}
                    >
                      <span className="truncate pr-2">{c.short_name || c.name}</span>
                      {activeCollegeId === c.id && (
                        <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Search Bar & Controls Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-black/50 stroke-[2.5]" />
            <input
              type="text"
              placeholder="Search tasks (e.g. lab record, PPT, resume, diagrams)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full brutal-input pl-10 pr-4 py-2.5 text-xs sm:text-sm font-bold"
            />
          </div>
          <BrutalButton type="submit" variant="yellow" size="md">
            <span>SEARCH</span>
          </BrutalButton>
        </form>

        <button
          onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          className={clsx(
            'brutal-btn py-2.5 px-4 text-xs font-black uppercase flex items-center justify-center gap-2',
            activeFiltersCount > 0 ? 'bg-taskYellow' : 'bg-white'
          )}
        >
          <SlidersHorizontal className="w-4 h-4 stroke-[2.5]" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-black text-white rounded-full w-5 h-5 text-[10px] flex items-center justify-center font-black">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* 4. Filter Drawer / Bar */}
      <div
        className={clsx(
          'bg-white brutal-border p-4 brutal-shadow space-y-4 transition-all',
          showFiltersMobile ? 'block' : 'hidden md:block'
        )}
      >
        <div className="flex items-center justify-between border-b border-black/10 pb-2">
          <span className="text-xs font-black uppercase flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 stroke-[2.5]" /> Filter Marketplace Tasks
          </span>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-[11px] font-black uppercase text-red-600 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset All Filters ({activeFiltersCount})
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-black uppercase text-taskBlack mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full brutal-input py-2 px-2.5 text-xs font-bold"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Specific College Filter */}
          <div>
            <label className="block text-[11px] font-black uppercase text-taskBlack mb-1">
              Filter By Specific College
            </label>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-full brutal-input py-2 px-2.5 text-xs font-bold"
            >
              <option value="all">All Campuses</option>
              {colleges.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.short_name || c.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-[11px] font-black uppercase text-taskBlack mb-1">
              City / Metro
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full brutal-input py-2 px-2.5 text-xs font-bold"
            >
              <option value="all">All Cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-black uppercase text-taskBlack mb-1">
              Task Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full brutal-input py-2 px-2.5 text-xs font-bold"
            >
              <option value="OPEN">Open Tasks Only (Active)</option>
              <option value="all">All Statuses</option>
              <option value="ASSIGNED">Assigned / In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Price Range Pills */}
          <div>
            <label className="block text-[11px] font-black uppercase text-taskBlack mb-1">
              Price Range
            </label>
            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="w-full brutal-input py-2 px-2.5 text-xs font-bold"
            >
              <option value="all">All Prices</option>
              <option value="under_200">Under ₹200</option>
              <option value="200_500">₹200 - ₹500</option>
              <option value="500_1000">₹500 - ₹1,000</option>
              <option value="above_1000">₹1,000 & Above</option>
            </select>
          </div>

          {/* Deadline Filter */}
          <div>
            <label className="block text-[11px] font-black uppercase text-taskBlack mb-1">
              Deadline Urgency
            </label>
            <select
              value={selectedDeadline}
              onChange={(e) => setSelectedDeadline(e.target.value)}
              className="w-full brutal-input py-2 px-2.5 text-xs font-bold"
            >
              <option value="all">Any Deadline</option>
              <option value="urgent">Urgent (&lt; 24h / Tomorrow)</option>
              <option value="2-3days">Next 2 - 3 Days</option>
              <option value="week">This Week</option>
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div>
            <label className="block text-[11px] font-black uppercase text-taskBlack mb-1 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" /> Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full brutal-input py-2 px-2.5 text-xs font-bold"
            >
              <option value="recommended">Recommended (College Priority)</option>
              <option value="newest">Newest First</option>
              <option value="deadline">Soonest Deadline</option>
              <option value="budget_high">Highest Price Offered</option>
              <option value="budget_low">Lowest Price Offered</option>
            </select>
          </div>

          {/* Max Budget Slider */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-black uppercase text-taskBlack mb-1">
              <span>Max Budget Cap</span>
              <span className="font-mono text-taskGreen">₹{maxBudget}</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 5. Scope Tabs (Hierarchy Navigator) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setScopeTab('all')}
          className={clsx(
            'brutal-btn px-4 py-2 text-xs font-black uppercase whitespace-nowrap transition-all flex items-center gap-1.5',
            scopeTab === 'all'
              ? 'bg-black text-white shadow-[2px_2px_0px_0px_#FFD84D]'
              : 'bg-white text-black hover:bg-zinc-100'
          )}
        >
          <span>All Tasks</span>
          <span
            className={clsx(
              'px-1.5 py-0.2 text-[10px] font-bold rounded',
              scopeTab === 'all' ? 'bg-taskYellow text-black' : 'bg-black/10 text-black'
            )}
          >
            {filteredTasks.length}
          </span>
        </button>

        <button
          onClick={() => setScopeTab('college')}
          className={clsx(
            'brutal-btn px-4 py-2 text-xs font-black uppercase whitespace-nowrap transition-all flex items-center gap-1.5',
            scopeTab === 'college'
              ? 'bg-taskYellow text-black shadow-[2px_2px_0px_0px_#000]'
              : 'bg-white text-black hover:bg-zinc-100'
          )}
        >
          <Sparkles className="w-3.5 h-3.5 fill-black" />
          <span>From Your College</span>
          <span className="bg-black text-white px-1.5 py-0.2 text-[10px] font-bold rounded">
            {ownCollegeTasks.length}
          </span>
        </button>

        <button
          onClick={() => setScopeTab('nearby')}
          className={clsx(
            'brutal-btn px-4 py-2 text-xs font-black uppercase whitespace-nowrap transition-all flex items-center gap-1.5',
            scopeTab === 'nearby'
              ? 'bg-taskBlue text-black shadow-[2px_2px_0px_0px_#000]'
              : 'bg-white text-black hover:bg-zinc-100'
          )}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Nearby ({activeCity?.name || 'City'})</span>
          <span className="bg-black text-white px-1.5 py-0.2 text-[10px] font-bold rounded">
            {nearbyTasks.length}
          </span>
        </button>

        <button
          onClick={() => setScopeTab('other')}
          className={clsx(
            'brutal-btn px-4 py-2 text-xs font-black uppercase whitespace-nowrap transition-all flex items-center gap-1.5',
            scopeTab === 'other'
              ? 'bg-zinc-800 text-white shadow-[2px_2px_0px_0px_#000]'
              : 'bg-white text-black hover:bg-zinc-100'
          )}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Other Colleges</span>
          <span className="bg-black/10 text-black px-1.5 py-0.2 text-[10px] font-bold rounded">
            {otherTasks.length}
          </span>
        </button>
      </div>

      {/* 6. Tasks Presentation */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 brutal-border bg-taskYellow animate-spin mx-auto mb-3" />
          <p className="font-black text-xs uppercase text-taskBlack">
            Prioritizing tasks for your college...
          </p>
        </div>
      ) : displayedTasks.length === 0 ? (
        <div className="brutal-border bg-white p-12 text-center space-y-4 max-w-xl mx-auto my-8">
          <Inbox className="w-12 h-12 text-black/30 mx-auto stroke-[2]" />
          <div className="space-y-1">
            <h3 className="text-xl font-black uppercase text-taskBlack">
              {scopeTab === 'college'
                ? `No tasks from ${activeCollege?.short_name || 'your college'} right now`
                : 'No tasks matching these filters'}
            </h3>
            <p className="text-xs sm:text-sm font-bold text-black/60">
              {scopeTab === 'college'
                ? 'Check "Nearby" or "All Tasks" to see opportunities from nearby campuses.'
                : 'Try adjusting or clearing your filters to discover more tasks.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {scopeTab === 'college' ? (
              <BrutalButton onClick={() => setScopeTab('all')} variant="blue" size="md">
                <span>VIEW NEARBY TASKS</span>
              </BrutalButton>
            ) : (
              <BrutalButton onClick={clearAllFilters} variant="yellow" size="md">
                <span>RESET FILTERS</span>
              </BrutalButton>
            )}
            <Link href="/tasks/create">
              <BrutalButton variant="yellow" size="md">
                <span>POST A TASK →</span>
              </BrutalButton>
            </Link>
          </div>
        </div>
      ) : scopeTab === 'all' && sortBy === 'recommended' && selectedCollege === 'all' ? (
        /* Hierarchical Grouped Layout when Viewing "All" with Recommended Sort */
        <div className="space-y-10">
          {/* TIER 1: Tasks from User's College */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <div className="flex items-center gap-2">
                <span className="bg-taskYellow border-2 border-black px-2 py-0.5 text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-[2px_2px_0px_0px_#000]">
                  <Sparkles className="w-3.5 h-3.5 fill-black" /> TIER 1 · FROM YOUR COLLEGE
                </span>
                <span className="text-sm font-black text-taskBlack hidden sm:inline">
                  {activeCollege?.name}
                </span>
              </div>
              <span className="text-xs font-black text-taskBlack bg-taskYellow/30 px-2 py-0.5 border border-black">
                {sortedOwnCollegeTasks.length} {sortedOwnCollegeTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            {sortedOwnCollegeTasks.length === 0 ? (
              <div className="bg-[#FFFEEA] border-2 border-dashed border-black/30 p-6 text-center">
                <p className="text-xs font-bold text-black/70">
                  No open tasks posted from {activeCollege?.short_name || 'your college'} yet.{' '}
                  <Link href="/tasks/create" className="font-black text-black underline">
                    Be the first to post a task
                  </Link>{' '}
                  or browse nearby campus tasks below.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedOwnCollegeTasks.map((task, idx) => {
                  const cat = categories.find((c) => c.id === task.category_id);
                  const col = colleges.find((c) => c.id === task.college_id);
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      categoryName={cat?.name}
                      collegeName={col?.short_name || col?.name}
                      cityName={activeCity?.name}
                      proximity="own_college"
                      variant="yellow"
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* TIER 2: Tasks from Nearby Campuses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <div className="flex items-center gap-2">
                <span className="bg-taskBlue border-2 border-black px-2 py-0.5 text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-[2px_2px_0px_0px_#000]">
                  <MapPin className="w-3.5 h-3.5 stroke-[2.5]" /> TIER 2 · NEARBY CAMPUSES (
                  {activeCity?.name || 'Hyderabad'})
                </span>
              </div>
              <span className="text-xs font-black text-taskBlack bg-taskBlue/30 px-2 py-0.5 border border-black">
                {sortedNearbyTasks.length} {sortedNearbyTasks.length === 1 ? 'task' : 'tasks'}
              </span>
            </div>

            {sortedNearbyTasks.length === 0 ? (
              <div className="bg-sky-50 border-2 border-dashed border-black/30 p-6 text-center">
                <p className="text-xs font-bold text-black/70">
                  No other tasks in {activeCity?.name || 'this city'} matching your filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedNearbyTasks.map((task, idx) => {
                  const cat = categories.find((c) => c.id === task.category_id);
                  const col = colleges.find((c) => c.id === task.college_id);
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      categoryName={cat?.name}
                      collegeName={col?.short_name || col?.name}
                      cityName={activeCity?.name}
                      proximity="nearby"
                      variant="blue"
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* TIER 3: Tasks from Other Colleges */}
          {sortedOtherTasks.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <div className="flex items-center gap-2">
                  <span className="bg-white border-2 border-black px-2 py-0.5 text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-[2px_2px_0px_0px_#000]">
                    <Building2 className="w-3.5 h-3.5 stroke-[2]" /> TIER 3 · OTHER COLLEGES
                  </span>
                </div>
                <span className="text-xs font-black text-taskBlack bg-zinc-100 px-2 py-0.5 border border-black">
                  {sortedOtherTasks.length} {sortedOtherTasks.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedOtherTasks.map((task, idx) => {
                  const cat = categories.find((c) => c.id === task.category_id);
                  const col = colleges.find((c) => c.id === task.college_id);
                  return (
                    <TaskCard
                      key={task.id}
                      task={task}
                      categoryName={cat?.name}
                      collegeName={col?.short_name || col?.name}
                      cityName="Other City"
                      proximity="other"
                      variant="white"
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Unified Ranked Grid when Specific Scope or Specific Sort is Chosen */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTasks.map((task, idx) => {
            const cat = categories.find((c) => c.id === task.category_id);
            const col = colleges.find((c) => c.id === task.college_id);
            const proximity = getProximityTier(task);

            return (
              <TaskCard
                key={task.id}
                task={task}
                categoryName={cat?.name}
                collegeName={col?.short_name || col?.name}
                cityName={activeCity?.name}
                proximity={proximity}
                variant={
                  proximity === 'own_college'
                    ? 'yellow'
                    : proximity === 'nearby'
                    ? 'blue'
                    : cardVariants[idx % cardVariants.length]
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
