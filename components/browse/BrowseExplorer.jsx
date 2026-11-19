'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CalendarDays, ChevronDown, Filter, ListFilter, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES, INDIAN_STATES } from '../../lib/constants';
import { findMatches } from '../../lib/matching';
import { apiFetch } from '../../utils/api';
import ItemCard from '../ui/ItemCard';
import PageHeading from '../ui/PageHeading';
import EmptyState from '../ui/EmptyState';
import { CardSkeleton } from '../ui/Loading';

const PAGE_SIZE = 9;

export default function BrowseExplorer() {
  const params = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: params.get('search') || '', type: 'all', category: params.get('category') || 'all', state: params.get('state') || 'all',
    city: '', brand: '', from: '', to: '', status: 'active', sort: 'recent',
  });
  const searchRef = useRef(null);
  const update = (key, value) => { setFilters((current) => ({ ...current, [key]: value })); setPage(1); };

  const loadItems = useCallback(async () => {
    setLoading(true); setError('');
    try { const data = await apiFetch('/api/items'); setItems(data.items || []); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { loadItems(); }, [loadItems]);
  useEffect(() => {
    setFilters((current) => ({ ...current, search: params.get('search') || current.search, state: params.get('state') || current.state, category: params.get('category') || current.category }));
  }, [params]);

  const suggestions = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    if (query.length < 2) return [];
    const unique = new Map();
    for (const item of items) {
      const match = `${item.name} ${item.category} ${item.city} ${item.brand}`.toLowerCase();
      if (match.includes(query)) unique.set(item.name, item.name);
      if (unique.size >= 5) break;
    }
    return [...unique.values()];
  }, [items, filters.search]);

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const selected = items.filter((item) => {
      if (filters.type !== 'all' && item.type !== filters.type) return false;
      if (filters.category !== 'all' && item.category !== filters.category) return false;
      if (filters.state !== 'all' && item.state !== filters.state) return false;
      if (filters.city && !String(item.city).toLowerCase().includes(filters.city.toLowerCase())) return false;
      if (filters.brand && !String(item.brand || '').toLowerCase().includes(filters.brand.toLowerCase())) return false;
      if (filters.from && item.date < filters.from) return false;
      if (filters.to && item.date > filters.to) return false;
      if (filters.status !== 'all' && item.status !== filters.status) return false;
      if (query && !`${item.name} ${item.description} ${item.category} ${item.brand} ${item.color} ${item.city} ${item.state} ${item.marks}`.toLowerCase().includes(query)) return false;
      return true;
    });
    if (filters.sort === 'oldest') return selected.sort((a, b) => new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date));
    if (filters.sort === 'relevance') return selected.map((item) => ({ item, relevance: findMatches(item, items, { limit: 1 })[0]?.score || 0 })).sort((a, b) => b.relevance - a.relevance || new Date(b.item.createdAt) - new Date(a.item.createdAt)).map((entry) => entry.item);
    return selected.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
  }, [items, filters]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const clearFilters = () => { setFilters({ search: '', type: 'all', category: 'all', state: 'all', city: '', brand: '', from: '', to: '', status: 'active', sort: 'recent' }); setPage(1); };

  return <div className="page-container py-12 sm:py-16">
    <PageHeading eyebrow="Community item directory" title="Browse reports across India" description="Search lost and found reports, narrow your search by location and compare the details that matter." />
    <div className="surface mb-7 rounded-3xl border border-line p-4 shadow-card sm:p-5">
      <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(3,.85fr)]">
        <div className="relative"><label className="field-label" htmlFor="browse-search">Search name or description</label><div className="relative"><Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" /><input ref={searchRef} id="browse-search" className="input !pl-10 !pr-10" placeholder="e.g. black phone, yellow keychain…" value={filters.search} onFocus={() => setSuggestionsOpen(true)} onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 150)} onChange={(event) => update('search', event.target.value)} /><button type="button" onClick={() => update('search', '')} className={`absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted hover:bg-canvas ${filters.search ? '' : 'hidden'}`} aria-label="Clear search"><X size={15} /></button></div>
          {suggestionsOpen && suggestions.length > 0 && <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border border-line bg-panel p-1 shadow-soft">{suggestions.map((suggestion) => <button key={suggestion} type="button" onMouseDown={() => { update('search', suggestion); setSuggestionsOpen(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-copy hover:bg-canvas"><Search size={13} className="text-muted" />{suggestion}</button>)}</div>}
        </div>
        <div><label className="field-label" htmlFor="browse-category">Category</label><select id="browse-category" className="select" value={filters.category} onChange={(event) => update('category', event.target.value)}><option value="all">All categories</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></div>
        <div><label className="field-label" htmlFor="browse-state">State / UT</label><select id="browse-state" className="select" value={filters.state} onChange={(event) => update('state', event.target.value)}><option value="all">All India</option>{INDIAN_STATES.map((item) => <option key={item}>{item}</option>)}</select></div>
        <div><label className="field-label" htmlFor="browse-city">City</label><div className="relative"><MapPin size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input id="browse-city" className="input !pl-9" placeholder="Any city" value={filters.city} onChange={(event) => update('city', event.target.value)} /></div></div>
      </div>
      <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.1fr_auto]">
        <div><label className="field-label" htmlFor="browse-brand">Brand</label><input id="browse-brand" className="input" placeholder="Any brand" value={filters.brand} onChange={(event) => update('brand', event.target.value)} /></div>
        <div><label className="field-label" htmlFor="browse-from">From date</label><div className="relative"><CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input id="browse-from" type="date" className="input !pl-9" value={filters.from} onChange={(event) => update('from', event.target.value)} /></div></div>
        <div><label className="field-label" htmlFor="browse-to">To date</label><div className="relative"><CalendarDays size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" /><input id="browse-to" type="date" className="input !pl-9" value={filters.to} onChange={(event) => update('to', event.target.value)} /></div></div>
        <div><label className="field-label" htmlFor="browse-status">Report status</label><select id="browse-status" className="select" value={filters.status} onChange={(event) => update('status', event.target.value)}><option value="active">Active reports</option><option value="recovered">Recovered</option><option value="closed">Closed</option><option value="all">Any status</option></select></div>
        <div className="flex items-end"><button type="button" onClick={clearFilters} className="btn-ghost w-full justify-center !border !border-line">Clear filters <X size={14} /></button></div>
      </div>
    </div>

    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="inline-flex flex-wrap gap-1 rounded-2xl border border-line bg-panel p-1"><button onClick={() => update('type', 'all')} className={`rounded-xl px-4 py-2 text-xs font-bold transition ${filters.type === 'all' ? 'bg-royal text-white' : 'text-muted hover:text-copy'}`}>All items</button><button onClick={() => update('type', 'lost')} className={`rounded-xl px-4 py-2 text-xs font-bold transition ${filters.type === 'lost' ? 'bg-rose-500 text-white' : 'text-muted hover:text-copy'}`}>Lost items</button><button onClick={() => update('type', 'found')} className={`rounded-xl px-4 py-2 text-xs font-bold transition ${filters.type === 'found' ? 'bg-teal text-white' : 'text-muted hover:text-copy'}`}>Found items</button></div>
      <div className="flex items-center gap-2 text-xs text-muted"><SlidersHorizontal size={14} /><span>{loading ? 'Loading reports…' : `${filtered.length} report${filtered.length === 1 ? '' : 's'}`}</span><span className="hidden sm:inline">·</span><label className="relative block"><span className="sr-only">Sort reports</span><select className="max-w-[170px] appearance-none rounded-xl border border-line bg-panel py-2 pl-3 pr-8 text-[10px] font-semibold text-copy outline-none sm:text-xs" value={filters.sort} onChange={(event) => update('sort', event.target.value)}><option value="recent">Recently reported</option><option value="oldest">Oldest first</option><option value="relevance">Highest match relevance</option></select><ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" /></label></div>
    </div>
    {error && <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"><p>{error}</p><button onClick={loadItems} className="btn-ghost">Try again</button></div>}
    {loading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <CardSkeleton key={index} />)}</div> : visible.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visible.map((item) => <ItemCard key={item.id} item={item} />)}</div> : <div className="space-y-3"><EmptyState title="No reports match those filters" description="Try a broader search or clear the filters to see all active community reports." /><div className="flex justify-center"><button type="button" onClick={clearFilters} className="btn-secondary">Clear filters <X size={14} /></button></div></div>}
    {!loading && pages > 1 && <div className="mt-9 flex flex-wrap items-center justify-center gap-2"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="btn-secondary !px-4 !py-2">Previous</button>{Array.from({ length: pages }, (_, index) => index + 1).map((number) => <button key={number} type="button" onClick={() => setPage(number)} aria-current={page === number ? 'page' : undefined} className={`grid h-10 w-10 place-items-center rounded-xl text-sm font-bold ${page === number ? 'bg-royal text-white' : 'surface border border-line text-muted hover:text-copy'}`}>{number}</button>)}<button type="button" disabled={page === pages} onClick={() => setPage((value) => value + 1)} className="btn-secondary !px-4 !py-2">Next</button></div>}
    <div className="mt-8 flex items-start gap-2 rounded-2xl border border-line bg-panel px-4 py-3"><Filter size={15} className="mt-0.5 shrink-0 text-teal" /><p className="text-[11px] leading-5 text-muted">Public reports show community-submitted information only. A match relevance sort is an algorithmic estimate—not confirmation that two records describe the same item.</p></div>
  </div>;
}
