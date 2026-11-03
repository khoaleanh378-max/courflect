import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import StarRating from '@/components/StarRating';
import FeedbackForm from '@/components/FeedbackForm';
import { ArrowLeft, MessageSquare } from 'lucide-react';

export default function LecturerProfile() {
  const { id } = useParams();
  const [lecturer, setLecturer] = useState(null);
  const [stats, setStats] = useState({ avg: 0, count: 0 });
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const l = await base44.entities.Lecturer.get(id);
        setLecturer(l);
        const agg = await base44.entities.Feedback.aggregate({
          query: { lecturer_id: id },
          groupBy: 'lecturer_id',
          avg: 'rating',
          count: true,
        });
        const row = (agg.rows || [])[0];
        setStats({ avg: row?.avg_rating || 0, count: row?.count || 0 });
        const res = await base44.entities.Feedback.filter(
          { lecturer_id: id, comment: { $ne: '' } },
          { sort: '-created_date', limit: 8 }
        );
        setComments(res.items ?? res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <div className="text-center py-24 text-black/40">Loading profile…</div>;
  }

  if (!lecturer) {
    return (
      <div className="text-center py-24">
        <p className="text-black/50">Lecturer not found.</p>
        <Link to="/reflect" className="text-black underline mt-2 inline-block">Back to directory</Link>
      </div>
    );
  }

  const initials = lecturer.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link to="/reflect" className="inline-flex items-center gap-1 text-sm text-black/60 hover:text-black mb-6">
        <ArrowLeft size={14} /> Directory
      </Link>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Photo + info */}
        <div>
          <div className="aspect-square bg-[#D9D9D9] rounded-2xl overflow-hidden flex items-center justify-center">
            {lecturer.photo_url ? (
              <img src={lecturer.photo_url} alt={lecturer.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-7xl font-bold text-black/30">{initials}</span>
            )}
          </div>
        </div>

        <div>
          <h1 className="font-heading font-extrabold text-3xl">{lecturer.name}</h1>
          <div className="mt-3 flex items-center gap-3">
            <StarRating value={stats.avg} readOnly size={24} showValue />
            <span className="text-sm text-black/50">{stats.count} review{stats.count === 1 ? '' : 's'}</span>
          </div>

          {lecturer.bio && <p className="mt-4 text-black/70 leading-relaxed">{lecturer.bio}</p>}

          {lecturer.subjects?.length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-black/50">Subjects taught</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {lecturer.subjects.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full bg-black/5 text-sm font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {lecturer.tags?.length > 0 && (
            <div className="mt-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-black/50">Tags</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {lecturer.tags.map((t) => (
                  <span key={t} className="px-3 py-1 rounded-full bg-[#FFD700]/20 text-sm font-medium text-black">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feedback + comments */}
      <div className="grid md:grid-cols-2 gap-8 mt-12">
        <div>
          <h2 className="font-heading font-bold text-xl mb-4">Share your feedback</h2>
          <FeedbackForm lecturerId={id} lecturerUserId={lecturer.user_id} />
        </div>

        <div>
          <h2 className="font-heading font-bold text-xl mb-4 flex items-center gap-2">
            <MessageSquare size={18} /> Recent comments
          </h2>
          {comments.length === 0 ? (
            <p className="text-black/40 text-sm">No comments yet. Be the first to share.</p>
          ) : (
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className="bg-[#D9D9D9]/40 border border-black/10 rounded-xl p-4">
                  <StarRating value={c.rating} readOnly size={14} />
                  {c.comment && <p className="text-sm text-black/70 mt-2">{c.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}