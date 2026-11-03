import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import StarRating from '@/components/StarRating';
import { Send, CheckCircle2 } from 'lucide-react';

export default function FeedbackForm({ lecturerId, lecturerUserId }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await base44.entities.Feedback.filter(
          { lecturer_id: lecturerId, student_id: user.id },
          { limit: 1 }
        );
        const items = res.items ?? res;
        if (items.length > 0) {
          setExisting(items[0]);
          setRating(items[0].rating);
          setComment(items[0].comment || '');
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [lecturerId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitting(true);
    try {
      if (existing) {
        await base44.entities.Feedback.update(existing.id, { rating, comment });
      } else {
        await base44.entities.Feedback.create({ lecturer_id: lecturerId, lecturer_user_id: lecturerUserId, rating, comment, student_id: user.id });
      }
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-8 text-center text-sm text-black/40">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="bg-[#D9D9D9]/40 border border-black/10 rounded-2xl p-6 text-center">
        <p className="text-sm text-black/60">Please sign in to submit anonymous feedback.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-[#D9D9D9]/40 border border-black/10 rounded-2xl p-8 text-center">
        <CheckCircle2 className="mx-auto text-black mb-3" size={36} />
        <h3 className="font-heading font-bold text-lg">Thank you for your feedback</h3>
        <p className="text-sm text-black/60 mt-1">Your submission is anonymous.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#D9D9D9]/40 border border-black/10 rounded-2xl p-6 space-y-5">
      <div>
        <h3 className="font-heading font-bold text-lg text-black">
          {existing ? 'Update your feedback' : 'Rate this lecturer'}
        </h3>
        <p className="text-xs text-black/50 mt-0.5">Your identity is never shown. One submission per lecturer.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-black/70 mb-2">Your rating</label>
        <StarRating value={rating} onChange={setRating} size={32} />
      </div>
      <div>
        <label className="block text-sm font-medium text-black/70 mb-2">Comment (optional)</label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share anonymous thoughts about teaching style, clarity, engagement…"
          rows={4}
          className="bg-white"
        />
      </div>
      <Button type="submit" disabled={rating === 0 || submitting} className="w-full bg-black text-white hover:bg-black/80">
        <Send size={16} className="mr-2" />
        {submitting ? 'Submitting…' : existing ? 'Update feedback' : 'Submit feedback'}
      </Button>
    </form>
  );
}