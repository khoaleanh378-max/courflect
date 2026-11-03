import React from 'react';
import { Star, Shield, BarChart3, Users } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl">About CouRflect</h1>
        <p className="text-black/60 mt-3">
          A lecturer feedback platform built as a university project — sound backend design, real anonymity, and a clean experience for students and lecturers alike.
        </p>
      </div>

      <div className="space-y-6">
        {[
          { icon: Users, title: 'For students', body: 'Browse the lecturer directory, open a profile, and submit one anonymous rating with an optional comment. Your identity is never displayed.' },
          { icon: Star, title: 'Public ratings', body: 'Every submission aggregates into a public star rating shown on the lecturer profile — a transparent signal for future students.' },
          { icon: BarChart3, title: 'For lecturers', body: 'A private dashboard shows your average ratings, trends over time, participation rate, and recent comments — all without exposing who submitted.' },
          { icon: Shield, title: 'Anonymity by design', body: 'One submission per student per lecturer is enforced on the backend, but the student identity is never returned in any public or lecturer-facing view.' },
        ].map((s) => (
          <div key={s.title} className="bg-[#D9D9D9]/40 border border-black/10 rounded-2xl p-6 flex gap-4">
            <div className="shrink-0 w-12 h-12 rounded-full bg-black text-white flex items-center justify-center">
              <s.icon size={20} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg">{s.title}</h3>
              <p className="text-sm text-black/60 mt-1">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}