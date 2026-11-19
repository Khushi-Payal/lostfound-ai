'use client';

import { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { formatDate } from '../../utils/format';

export default function DashboardCharts({ items = [] }) {
  const weekly = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      return { key, day: date.toLocaleDateString('en-IN', { weekday: 'short' }), lost: 0, found: 0 };
    });
    const lookup = new Map(days.map((day) => [day.key, day]));
    for (const item of items) {
      const recordDay = String(item.date || item.createdAt || '').slice(0, 10);
      if (lookup.has(recordDay)) lookup.get(recordDay)[item.type === 'found' ? 'found' : 'lost'] += 1;
    }
    return days;
  }, [items]);

  const categories = useMemo(() => {
    const counts = new Map();
    for (const item of items) counts.set(item.category, (counts.get(item.category) || 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name: name.length > 15 ? `${name.slice(0, 13)}…` : name, count }));
  }, [items]);

  const tooltipStyle = { borderRadius: 12, border: '1px solid rgb(var(--line))', background: 'rgb(var(--panel))', color: 'rgb(var(--copy))', fontSize: 11 };
  return <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
    <div className="surface rounded-3xl border border-line p-5"><div className="mb-4"><h3 className="font-bold text-copy">Report activity</h3><p className="mt-1 text-xs text-muted">Your lost and found reports · last 7 days</p></div><div className="h-56"><ResponsiveContainer width="100%" height="100%"><AreaChart data={weekly} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}><defs><linearGradient id="lostFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#315fe8" stopOpacity={0.22} /><stop offset="95%" stopColor="#315fe8" stopOpacity={0} /></linearGradient><linearGradient id="foundFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#13a895" stopOpacity={0.2} /><stop offset="95%" stopColor="#13a895" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" vertical={false} /><XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} /><Tooltip contentStyle={tooltipStyle} /><Area type="monotone" dataKey="lost" name="Lost" stroke="#315fe8" strokeWidth={2.5} fill="url(#lostFill)" /><Area type="monotone" dataKey="found" name="Found" stroke="#13a895" strokeWidth={2.5} fill="url(#foundFill)" /></AreaChart></ResponsiveContainer></div><div className="mt-3 flex gap-4 text-[10px] font-semibold text-muted"><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-royal" />Lost</span><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-teal" />Found</span></div></div>
    <div className="surface rounded-3xl border border-line p-5"><div className="mb-4"><h3 className="font-bold text-copy">Your report categories</h3><p className="mt-1 text-xs text-muted">Most common item types</p></div>{categories.length ? <div className="h-56"><ResponsiveContainer width="100%" height="100%"><BarChart data={categories} layout="vertical" margin={{ top: 0, right: 12, left: 5, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,.18)" horizontal={false} /><XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} /><YAxis type="category" dataKey="name" width={92} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8', fontSize: 9 }} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="count" name="Reports" fill="#315fe8" radius={[0, 8, 8, 0]} barSize={16} /></BarChart></ResponsiveContainer></div> : <div className="flex h-56 items-center justify-center text-xs text-muted">Report an item to start your chart.</div>}</div>
  </div>;
}
