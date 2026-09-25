'use client';

import React, { useState, useEffect } from 'react';
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
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { TaskCard } from '@/components/TaskCard';
import { BrutalButton } from '@/components/ui/BrutalButton';
import { BrutalBadge } from '@/components/ui/BrutalBadge';
import { Task, Category, College } from '@/lib/types';
import clsx from 'clsx';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'deadline' | 'budget'>('newest');
  const [maxBudget, setMaxBudget] = useState(1500);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const fetchTasks = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search.trim()) query.set('search', search.trim());
    if (selectedCategory !== 'all') query.set('categoryId', selectedCategory);
    if (selectedCollege !== 'all') query.set('collegeId', selectedCollege);
    if (maxBudget) query.set('budgetMax', maxBudget.toString());

    fetch(`/api/tasks?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        let taskList: Task[] = data.tasks || [];

        // Client-side Sort
        if (sortBy === 'newest') {
          taskList = taskList.sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        } else if (sortBy === 'budget') {
          taskList = taskList.sort((a, b) => b.budget - a.budget);
        }

        setTasks(taskList);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    // Initial load: fetch locations & categories
    fetch('/api/locations')
      .then((res) => res.json())
      .then((data) => {
        if (data.colleges) setColleges(data.colleges);
      });

    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      });

    fetchTasks();
  }, [selectedCategory, selectedCollege, maxBudget, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTasks();
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedCollege('all');
    setSortBy('newest');
    setMaxBudget(1500);
  };

  const cardVariants: ('white' | 'yellow' | 'blue' | 'pink')[] = [
    'white',
    'yellow',
    'white',
    'blue',
    'white',
    'pink',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-black/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <BrutalBadge variant="yellow" size="sm">
              CAMPUS MARKETPLACE
            </BrutalBadge>
            <span className="text-xs font-bold text-black/60">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} found
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-taskBlack">
            Tasks near you
          </h1>
          <p className="text-xs sm:text-sm font-bold text-taskBlack/70 mt-1">
            Browse legitimate student requests on campus. Filter by category, college, or deadline.
          </p>
        </div>

        <Link href="/tasks/create">
          <BrutalButton variant="yellow" size="lg">
            <PlusCircle className="w-4 h-4 stroke-[3]" />
            <span>POST A TASK</span>
          </BrutalButton>
        </Link>
      </div>

      {/* Search Bar & Mobile Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-black/50 stroke-[2.5]" />
            <input
              type="text"
              placeholder="Search tasks (e.g. lab record, PPT, poster, diagrams)..."
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
          className="sm:hidden brutal-btn bg-white py-2.5 px-4 text-xs font-black uppercase flex items-center justify-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div
        className={clsx(
          'bg-white brutal-border p-4 brutal-shadow-sm space-y-4',
          showFiltersMobile ? 'block' : 'hidden sm:block'
        )}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Campus Filter */}
          <div>
            <label className="block text-[11px] font-black uppercase text-taskBlack mb-1">
              Campus / College
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

          {/* Sort Filter */}
          <div>
            <label className="block text-[11px] font-black uppercase text-taskBlack mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full brutal-input py-2 px-2.5 text-xs font-bold"
            >
              <option value="newest">Newest First</option>
              <option value="budget">Highest Budget</option>
              <option value="deadline">Upcoming Deadline</option>
            </select>
          </div>

          {/* Max Budget Slider */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-black uppercase text-taskBlack mb-1">
              <span>Max Budget</span>
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

        <div className="flex items-center justify-between pt-2 border-t border-black/10">
          <span className="text-[11px] font-bold text-black/60">
            Showing verified legitimate peer assistance tasks only
          </span>
          <button
            onClick={clearAllFilters}
            className="text-[11px] font-black uppercase underline hover:text-red-600"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Task List Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 brutal-border bg-taskYellow animate-spin mx-auto mb-3" />
          <p className="font-black text-xs uppercase text-taskBlack">Loading campus tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="brutal-border bg-white p-12 text-center space-y-4 max-w-xl mx-auto my-8">
          <Inbox className="w-12 h-12 text-black/30 mx-auto stroke-[2]" />
          <div className="space-y-1">
            <h3 className="text-xl font-black uppercase text-taskBlack">No tasks nearby yet</h3>
            <p className="text-xs sm:text-sm font-bold text-black/60">
              Be the first to post a task on your campus.
            </p>
          </div>
          <Link href="/tasks/create">
            <BrutalButton variant="yellow" size="lg">
              <span>POST A TASK →</span>
            </BrutalButton>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task, idx) => {
            const cat = categories.find((c) => c.id === task.category_id);
            const col = colleges.find((c) => c.id === task.college_id);
            return (
              <TaskCard
                key={task.id}
                task={task}
                categoryName={cat?.name}
                collegeName={col?.short_name || 'SNIST'}
                variant={cardVariants[idx % cardVariants.length]}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
