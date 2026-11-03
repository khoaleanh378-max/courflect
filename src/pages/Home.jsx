import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import LecturerCard from '@/components/LecturerCard';
import { ArrowRight, Star, Shield, BarChart3 } from 'lucide-react';

export default function Home() {
  const [lecturers, setLecturers] = useState([]);
  const [ratings, setRatings] = useState({});
  const [counts, setCounts] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.Lecturer.filter({}, { sort: '-created_date', limit: 6 });
        const items = res.items ?? res;
        setLecturers(items);
        // aggregate ratings per lecturer
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
      }
    })();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-[#D9D9D9]">
        <div className="max-w-6xl mx-auto px-6 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 text-xs font-medium text-black/70 mb-6">
            <Star size={12} className="fill-[#FFD700] text-[#FFD700]" /> Anonymous · Honest · Constructive
          </div>
          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl tracking-tight text-black leading-tight">
            Feedback that helps<br />lecturers grow.
          </h1>
          <p className="mt-6 max-w-xl mx-auto text-lg text-black/70">
            CouRflect lets students share anonymous, honest feedback on their lecturers — and gives lecturers a private dashboard to learn from it.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/reflect" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-black/80 transition-colors">
              Browse lecturers <ArrowRight size={16} />
            </Link>
            <Link to="/about" className="text-black font-medium underline underline-offset-4">
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: 'Truly anonymous', desc: 'Submissions are never linked to your identity. One per lecturer keeps it fair.' },
            { icon: Star, title: 'Star ratings', desc: 'A clear public rating built from every submission, shown right on each profile.' },
            { icon: BarChart3, title: 'Private analytics', desc: 'Lecturers see trends, averages and recent comments on a personal dashboard.' },
          ].map((f) => (
            <div key={f.title} className="bg-[#D9D9D9]/40 border border-black/10 rounded-2xl p-6">
              <f.icon className="text-black mb-4" size={24} />
              <h3 className="font-heading font-bold text-lg">{f.title}</h3>
              <p className="text-sm text-black/60 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured lecturers */}
      {lecturers.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-extrabold text-2xl">Featured lecturers</h2>
            <Link to="/reflect" className="text-sm font-medium text-black/70 hover:text-black inline-flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {lecturers.map((l) => (
              <LecturerCard key={l.id} lecturer={l} rating={ratings[l.id] || 0} count={counts[l.id] || 0} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}