import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import StarRating from '@/components/StarRating';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, MessageSquare, Users, Star } from 'lucide-react';

export default function LecturerDashboard() {
  const { user } = useAuth();
  const [lecturer, setLecturer] = useState(null);
  const [stats, setStats] = useState({ avg: 0, count: 0 });
  const [trend, setTrend] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await base44.entities.Lecturer.filter({ user_id: user.id }, { limit: 1 });
        const items = res.items ?? res;
        if (items.length === 0) {
          setLoading(false);
          return;
        }
        const l = items[0];
        setLecturer(l);

        const agg = await base44.entities.Feedback.aggregate({
          query: { lecturer_id: l.id },
          groupBy: 'lecturer_id',
          avg: 'rating',
          count: true,
        });
        const row = (agg.rows || [])[0];
        setStats({ avg: row?.avg_rating || 0, count: row?.count || 0 });

        const trendAgg = await base44.entities.Feedback.aggregate({
          query: { lecturer_id: l.id },
          dateBucket: { field: 'created_date', unit: 'week' },
          avg: 'rating',
          count: true,
        });
        const chartData = (trendAgg.rows || []).map((r) => ({
          date: r.created_date?.slice(0, 10) || r._id,
          rating: Number((r.avg_rating || 0).toFixed(2)),
          count: r.count,
        }));
        setTrend(chartData);

        const cRes = await base44.entities.Feedback.filter(
          { lecturer_id: l.id },
          { sort: '-created_date', limit: 8 }
        );
        setComments(cRes.items ?? cRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <div className="text-center py-24 text-black/40">Loading your dashboard…</div>;

  if (!lecturer) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="font-heading font-extrabold text-2xl">No lecturer profile linked</h1>
        <p className="text-black/60 mt-2">
          Your account isn't linked to a lecturer profile yet. An admin needs to assign your account to a lecturer in the admin panel.
        </p>
      </div>
    );
  }

  const cards = [
    { icon: Star, label: 'Average rating', value: stats.avg ? stats.avg.toFixed(2) : '—', sub: `${stats.count} submissions` },
    { icon: MessageSquare, label: 'Total feedback', value: stats.count, sub: 'reviews collected' },
    { icon: TrendingUp, label: 'Trend points', value: trend.length, sub: 'weeks of data' },
    { icon: Users, label: 'Participation', value: stats.count, sub: 'students engaged' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="font-heading font-extrabold text-3xl">{lecturer.name}</h1>
        <p className="text-black/60 mt-1">Your private analytics dashboard</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="bg-[#D9D9D9]/40 border border-black/10 rounded-2xl p-5">
            <c.icon className="text-black/70 mb-3" size={18} />
            <div className="text-3xl font-heading font-extrabold">{c.value}</div>
            <div className="text-sm font-medium text-black/70 mt-1">{c.label}</div>
            <div className="text-xs text-black/40">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      <div className="bg-white border border-black/10 rounded-2xl p-6 mb-8">
        <h2 className="font-heading font-bold text-lg mb-4">Rating trend over time</h2>
        {trend.length === 0 ? (
          <p className="text-black/40 text-sm py-10 text-center">Not enough data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#00000010" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#00000080' }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#00000080' }} />
              <Tooltip />
              <Line type="monotone" dataKey="rating" stroke="#000000" strokeWidth={2.5} dot={{ fill: '#FFD700', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent comments */}
      <div>
        <h2 className="font-heading font-bold text-lg mb-4">Recent feedback</h2>
        {comments.length === 0 ? (
          <p className="text-black/40 text-sm">No feedback yet.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="bg-[#D9D9D9]/40 border border-black/10 rounded-xl p-4 flex gap-4">
                <StarRating value={c.rating} readOnly size={16} />
                <p className="text-sm text-black/70 flex-1">{c.comment || '—'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}