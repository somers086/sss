/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Briefcase, Coffee, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Work schedule reference: 2026-03-10 is "Rest Day 2"
// Cycle: Work(0), Work(1), Rest(2), Rest(3)
// 2026-03-07 is Day 0 (Work Day 1)
const REFERENCE_DATE = new Date('2026-03-07T00:00:00');

interface AppointmentDate {
  date: Date;
  isRestDay: boolean;
  dayType: string;
}

export default function App() {
  const [startDateStr, setStartDateStr] = useState<string>(new Date().toISOString().split('T')[0]);

  const appointments = useMemo(() => {
    if (!startDateStr) return [];

    const results: AppointmentDate[] = [];
    const [year, month, day] = startDateStr.split('-').map(Number);
    let currentDate = new Date(year, month - 1, day);
    
    // Generate for 1 year (approx 7 appointments since 365 / 56 = 6.5)
    for (let i = 0; i < 7; i++) {
      // Calculate work/rest status
      // Use midnight local time for both to avoid DST/time-of-day issues
      const d1 = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const d2 = new Date(REFERENCE_DATE.getFullYear(), REFERENCE_DATE.getMonth(), REFERENCE_DATE.getDate());
      
      const diffTime = d1.getTime() - d2.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      const cycleIndex = ((diffDays % 4) + 4) % 4;
      
      let dayType = '';
      let isRestDay = false;
      
      if (cycleIndex === 0) {
        dayType = '上班 (第1天)';
        isRestDay = false;
      } else if (cycleIndex === 1) {
        dayType = '上班 (第2天)';
        isRestDay = false;
      } else if (cycleIndex === 2) {
        dayType = '休假 (第1天)';
        isRestDay = true;
      } else if (cycleIndex === 3) {
        dayType = '休假 (第2天)';
        isRestDay = true;
      }

      results.push({
        date: new Date(currentDate),
        isRestDay,
        dayType
      });

      // Next appointment is 56 days later
      currentDate.setDate(currentDate.getDate() + 56);
    }
    return results;
  }, [startDateStr]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529] font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Calendar size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">回診與休假計算器</h1>
          </div>
          <div className="text-xs font-medium text-gray-400 uppercase tracking-widest">
            做2休2 排班制
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Input Section */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-10">
          <div className="flex items-center gap-2 mb-6 text-indigo-600">
            <Clock size={18} />
            <h2 className="font-semibold">設定起始回診日</h2>
          </div>
          
          <div className="space-y-4">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-500">
              請輸入您最近一次的回診日期：
            </label>
            <input
              id="startDate"
              type="date"
              value={startDateStr}
              onChange={(e) => setStartDateStr(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-lg font-medium"
            />
            <div className="flex items-start gap-2 p-4 bg-indigo-50 rounded-xl text-indigo-700 text-sm">
              <Info size={16} className="mt-0.5 shrink-0" />
              <p>系統將自動以 56 天為間隔，為您推算未來一年份的回診日期，並核對您的「做2休2」休假表。</p>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">
            未來一年回診時程表
          </h3>
          
          <AnimatePresence mode="popLayout">
            {appointments.map((apt, index) => (
              <motion.div
                key={apt.date.getTime()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group relative bg-white rounded-2xl p-6 border transition-all hover:shadow-md ${
                  apt.isRestDay ? 'border-emerald-100' : 'border-gray-100'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <span>第 {index + 1} 次回診</span>
                      {index === 0 && (
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px]">起始日</span>
                      )}
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {formatDate(apt.date)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                      apt.isRestDay 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-orange-50 text-orange-700'
                    }`}>
                      {apt.isRestDay ? <Coffee size={16} /> : <Briefcase size={16} />}
                      {apt.dayType}
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-gray-400 transition-colors" size={20} />
                  </div>
                </div>

                {/* Status Indicator Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${
                  apt.isRestDay ? 'bg-emerald-500' : 'bg-orange-400'
                }`} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <footer className="mt-16 pt-8 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-400">
            排班參考：2026年3月10日 為休假第二天
          </p>
          <p className="text-xs text-gray-300 mt-2">
            © {new Date().getFullYear()} 回診與休假計算器
          </p>
        </footer>
      </main>
    </div>
  );
}
