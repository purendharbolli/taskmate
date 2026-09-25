'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  MapPin,
  SlidersHorizontal,
  X,
  PlusCircle,
  Clock,
  Sparkles,
  Inbox
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

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCollege, setSelectedCollege] = useState('all');
  const [maxBudget, setMaxBudget] = useState(1000);
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
        if (data.tasks) setTasks(data.tasks);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
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

    // Fetch tasks
    fetchTasks();
  }, [selectedCategory, selectedCollege, maxBudget]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTasks();
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedCollege('all');
    setMaxBudget(1000);
  };

  const cardVariants: ('white' | 'yellow' | 'blue' | 'pink')[] = [
    'white',
    'yellow',
    'blue',
    'pink',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BrutalBadge variant="yellow" size="sm">
              CAMPUS MARKETPLACE
            </BrutalBadge>
            <span className="text-xs font-black uppercase text-taskBlack/60">
              Telangana Pilot
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-taskBlack">
            Find work. Get paid.
          </h1>
          <p className="text-sm sm:text-base font-bold text-taskBlack/70 mt-1">
            Browse verified tasks posted by fellow students on your campus.
          </p>
        </div>

        <Link href="/tasks/create">
          <BrutalButton variant="yellow" size="lg" className="w-full md:w-auto">
            <PlusCircle className="w-4 h-4 stroke-[3]" />
            <span>POST A TASK</span>
          </BrutalButton>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white brutal-border brutal-shadow p-4 mb-8">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-stretch gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-black/50" />
            <input
              type="text"
              placeholder="Search tasks (e.g. record writing, charts, PPT, printing, errands)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full brutal-input pl-10 pr-4 py-2.5 text-sm font-bold"
            />
          </div>

          {/* Quick College Filter */}
          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="brutal-input px-3.5 py-2.5 text-xs font-bold bg-taskOffWhite"
          >
            <option value="all">📍 All Campuses</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.short_name || c.name}
              </option>
            ))}
          </select>

          {/* Quick Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="brutal-input px-3.5 py-2.5 text-xs font-bold bg-taskOffWhite"
          >
            <option value="all">✦ All Categories</option>
            <option value="cat-record">Record Writing</option>
            <option value="cat-notes">Notes Copying</option>
            <option value="cat-diagrams">Diagrams &amp; Charts</option>
            <option value="cat-ppt">PPT Creation</option>
            <option value="cat-poster">Poster Design</option>
            <option value="cat-print">Printing &amp; Binding</option>
            <option value="cat-errand">Campus Errands</option>
            <option value="cat-event">Event Assistance</option>
            <option value="cat-video">Video &amp; Media</option>
            <option value="cat-data">Data Entry</option>
          </select>

          {/* Search Button */}
          <BrutalButton type="submit" variant="yellow" size="md">
            <span>SEARCH</span>
          </BrutalButton>
        </form>

        {/* Budget Slider & Clear Button */}
        <div className="mt-4 pt-3 border-t-2 border-black/10 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
          <div className="flex items-center gap-3">
            <span className="uppercase font-black text-taskBlack">Max Budget:</span>
            <input
              type="range"
              min="100"
              max="1500"
              step="50"
              value={maxBudget}
              onChange={(e) => setMaxBudget(Number(e.target.value))}
              className="accent-black cursor-pointer"
            />
            <span className="bg-taskYellow px-2 py-0.5 brutal-border text-xs font-black">
              Up to ₹{maxBudget}
            </span>
          </div>

          {(search || selectedCategory !== 'all' || selectedCollege !== 'all' || maxBudget < 1000) && (
            <button
              onClick={clearAllFilters}
              className="text-xs uppercase font-black underline hover:text-red-600 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Task Grid & Feed */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="brutal-border bg-white p-6 h-64 animate-pulse">
              <div className="h-4 bg-gray-200 w-1/3 mb-4" />
              <div className="h-6 bg-gray-300 w-3/4 mb-3" />
              <div className="h-4 bg-gray-200 w-full mb-2" />
              <div className="h-4 bg-gray-200 w-2/3" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        /* Empty State */
        <div className="brutal-border bg-white brutal-shadow-lg p-10 md:p-16 text-center max-w-xl mx-auto my-8 space-y-4">
          <div className="w-16 h-16 bg-taskYellow brutal-border brutal-shadow-sm flex items-center justify-center mx-auto">
            <Inbox className="w-8 h-8 text-taskBlack stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black uppercase text-taskBlack">
            Nothing nearby yet.
          </h2>
          <p className="text-xs sm:text-sm font-bold text-taskBlack/70 leading-relaxed">
            No tasks match your current filters. Try widening your search, selecting all campuses, or post a task yourself!
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={clearAllFilters}
              className="brutal-btn bg-white hover:bg-taskOffWhite px-4 py-2 text-xs font-black uppercase"
            >
              Clear Filters
            </button>
            <Link href="/tasks/create">
              <BrutalButton variant="yellow" size="md">
                <span>POST THIS TASK</span>
              </BrutalButton>
            </Link>
          </div>
        </div>
      ) : (
        /* Tasks List */
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black uppercase text-taskBlack/70">
              Showing {tasks.length} Open Campus Tasks
            </span>
            <span className="text-xs font-bold text-taskBlack/50">
              Sorted by newest
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task, idx) => {
              const variant = cardVariants[idx % cardVariants.length];
              const col = colleges.find((c) => c.id === task.college_id);

              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  categoryName={(task as any).category?.name || 'General Help'}
                  collegeName={col?.short_name || 'SNIST'}
                  variant={variant}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
