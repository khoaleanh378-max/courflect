import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from '@/components/StarRating';

export default function LecturerCard({ lecturer, rating = 0, count = 0 }) {
  const initials = lecturer.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Link
      to={`/lecturers/${lecturer.id}`}
      className="group block bg-white border border-black/10 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="aspect-square bg-[#D9D9D9] flex items-center justify-center overflow-hidden">
        {lecturer.photo_url ? (
          <img src={lecturer.photo_url} alt={lecturer.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl font-bold text-black/40">{initials}</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading font-bold text-lg text-black truncate">{lecturer.name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <StarRating value={rating} readOnly size={16} showValue />
          <span className="text-xs text-black/40">({count})</span>
        </div>
        {lecturer.subjects?.length > 0 && (
          <p className="mt-2 text-xs text-black/50 truncate">{lecturer.subjects.join(' · ')}</p>
        )}
        {lecturer.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {lecturer.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 text-black/60 font-medium">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}