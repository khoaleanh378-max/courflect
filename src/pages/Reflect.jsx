import React, { useEffect, useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import LecturerCard from '@/components/LecturerCard';
import { Search } from 'lucide-react';

export default function Reflect() {
  const [lecturers, setLecturers] = useState([]);
  const [ratings, setRatings] = useState({});
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.Lecturer.filter({}, { sort: 'name', limit: 100 });
        const items = res.items ?? res;
        setLecturers(items);
        const agg = await base44.entities.Feedback.aggregate({ groupBy: 'lecturer_id', avg: 'rating', count: true });
        const r = {};
        const c = {};
        (agg.rows || []).forEach((row) => {
          r[row.lecturer_id] = row.avg_rating;
          c[row.lecturer_id] = row.count;
        });
        setRatings(r);
        setCounts(c);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const allTags = useMemo(() => {
    const s = new Set();
    lecturers.forEach((l) => l.tags?.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [lecturers]);

  const allSubjects = useMemo(() => {
    const s = new Set();
    lecturers.forEach((l) => l.subjects?.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [lecturers]);

  const filtered = useMemo(() => {
    return lecturers.filter((l) => {
      const matchesSearch = !search || l.name.toLowerCase().includes(search.toLowerCase());
      const matchesTag = tagFilter === 'all' || l.tags?.includes(tagFilter);
      const matchesSubject = subjectFilter === 'all' || l.subjects?.includes(subjectFilter);
      return matchesSearch && matchesTag && matchesSubject;
    });
  }, [lecturers, search, tagFilter, subjectFilter]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl">Lecturer Directory</h1>
        <p className="text-black/60 mt-2">Search, filter, and share anonymous feedback.</p>
      </div>

      {/* Filters */}
      <div className="bg-[#D9D9D9]/40 border border-black/10 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full pl-9 pr-3 py-2 rounded-full bg-white border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
          />
        </div>
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="px-3 py-2 rounded-full bg-white border border-black/10 text-sm focus:outline-none"
        >
          <option value="all">All tags</option>
          {allTags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-3 py-2 rounded-full bg-white border border-black/10 text-sm focus:outline-none"
        >
          <option value="all">All subjects</option>
          {allSubjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-black/40">Loading lecturers…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-black/40">No lecturers match your filters.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((l) => (
            <LecturerCard key={l.id} lecturer={l} rating={ratings[l.id] || 0} count={counts[l.id] || 0} />
          ))}
        </div>
      )}
    </div>
  );
}