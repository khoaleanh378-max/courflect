import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Pencil, X } from 'lucide-react';

const emptyLecturer = { name: '', gender: 'other', bio: '', photo_url: '', subjects: '', tags: '', user_id: '' };

export default function Admin() {
  const { user } = useAuth();
  const [lecturers, setLecturers] = useState([]);
  const [users, setUsers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyLecturer);
  const [newSubject, setNewSubject] = useState('');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    try {
      const lRes = await base44.entities.Lecturer.filter({}, { sort: 'name', limit: 100 });
      setLecturers(lRes.items ?? lRes);
      const sRes = await base44.entities.Subject.filter({}, { sort: 'name', limit: 100 });
      setSubjects(sRes.items ?? sRes);
      const tRes = await base44.entities.Tag.filter({}, { sort: 'name', limit: 100 });
      setTags(tRes.items ?? tRes);
      try {
        const uRes = await base44.entities.User.list({ limit: 100 });
        setUsers(uRes.items ?? uRes);
      } catch (e) {
        // user list may be restricted
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h1 className="font-heading font-extrabold text-2xl">Admin access only</h1>
        <p className="text-black/60 mt-2">You need an admin account to manage lecturers, subjects, and tags.</p>
      </div>
    );
  }

  const saveLecturer = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      gender: form.gender,
      bio: form.bio,
      photo_url: form.photo_url,
      subjects: form.subjects.split(',').map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
      user_id: form.user_id || undefined,
    };
    try {
      if (editing) {
        await base44.entities.Lecturer.update(editing, payload);
      } else {
        await base44.entities.Lecturer.create(payload);
      }
      setEditing(null);
      setForm(emptyLecturer);
      await loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const editLecturer = (l) => {
    setEditing(l.id);
    setForm({
      name: l.name,
      gender: l.gender || 'other',
      bio: l.bio || '',
      photo_url: l.photo_url || '',
      subjects: (l.subjects || []).join(', '),
      tags: (l.tags || []).join(', '),
      user_id: l.user_id || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteLecturer = async (id) => {
    if (!confirm('Delete this lecturer? Their feedback remains but will be orphaned.')) return;
    await base44.entities.Lecturer.delete(id);
    await loadAll();
  };

  const addSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    await base44.entities.Subject.create({ name: newSubject.trim() });
    setNewSubject('');
    await loadAll();
  };

  const deleteSubject = async (id) => {
    await base44.entities.Subject.delete(id);
    await loadAll();
  };

  const addTag = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    await base44.entities.Tag.create({ name: newTag.trim() });
    setNewTag('');
    await loadAll();
  };

  const deleteTag = async (id) => {
    await base44.entities.Tag.delete(id);
    await loadAll();
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="font-heading font-extrabold text-3xl mb-8">Admin Panel</h1>

      <Tabs defaultValue="lecturers">
        <TabsList className="bg-[#D9D9D9]/50">
          <TabsTrigger value="lecturers">Lecturers</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>

        {/* Lecturers tab */}
        <TabsContent value="lecturers" className="mt-6">
          {/* Form */}
          <form onSubmit={saveLecturer} className="bg-[#D9D9D9]/40 border border-black/10 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg">{editing ? 'Edit lecturer' : 'Add lecturer'}</h2>
              {editing && (
                <button type="button" onClick={() => { setEditing(null); setForm(emptyLecturer); }} className="text-black/50 hover:text-black">
                  <X size={18} />
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-black/70">Name</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="mt-1 bg-white" />
              </div>
              <div>
                <label className="text-sm font-medium text-black/70">Gender (for placeholder)</label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger className="mt-1 bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-black/70">Photo URL (optional)</label>
                <Input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} className="mt-1 bg-white" />
              </div>
              <div>
                <label className="text-sm font-medium text-black/70">Link to user account</label>
                <Select value={form.user_id || 'none'} onValueChange={(v) => setForm({ ...form, user_id: v === 'none' ? '' : v })}>
                  <SelectTrigger className="mt-1 bg-white"><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {users.filter((u) => u.role === 'lecturer').map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-black/70">Bio</label>
                <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} className="mt-1 bg-white" />
              </div>
              <div>
                <label className="text-sm font-medium text-black/70">Subjects (comma separated)</label>
                <Input value={form.subjects} onChange={(e) => setForm({ ...form, subjects: e.target.value })} className="mt-1 bg-white" placeholder="Algorithms, Databases" />
              </div>
              <div>
                <label className="text-sm font-medium text-black/70">Tags (comma separated)</label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="mt-1 bg-white" placeholder="Engaging, Tough" />
              </div>
            </div>
            <Button type="submit" className="mt-4 bg-black text-white hover:bg-black/80">
              <Plus size={16} className="mr-1" /> {editing ? 'Save changes' : 'Add lecturer'}
            </Button>
          </form>

          {/* List */}
          <div className="space-y-2">
            {lecturers.map((l) => (
              <div key={l.id} className="flex items-center justify-between bg-white border border-black/10 rounded-xl px-4 py-3">
                <div>
                  <div className="font-medium">{l.name}</div>
                  <div className="text-xs text-black/50">
                    {l.subjects?.length || 0} subjects · {l.tags?.length || 0} tags · {l.user_id ? 'linked' : 'unlinked'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editLecturer(l)} className="p-2 text-black/60 hover:text-black"><Pencil size={16} /></button>
                  <button onClick={() => deleteLecturer(l.id)} className="p-2 text-black/60 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Subjects tab */}
        <TabsContent value="subjects" className="mt-6">
          <form onSubmit={addSubject} className="flex gap-2 mb-6">
            <Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="New subject name" className="bg-white" />
            <Button type="submit" className="bg-black text-white hover:bg-black/80"><Plus size={16} /></Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 text-sm">
                {s.name}
                <button onClick={() => deleteSubject(s.id)} className="text-black/40 hover:text-red-600"><X size={12} /></button>
              </span>
            ))}
          </div>
        </TabsContent>

        {/* Tags tab */}
        <TabsContent value="tags" className="mt-6">
          <form onSubmit={addTag} className="flex gap-2 mb-6">
            <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="New tag name" className="bg-white" />
            <Button type="submit" className="bg-black text-white hover:bg-black/80"><Plus size={16} /></Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFD700]/20 text-sm">
                {t.name}
                <button onClick={() => deleteTag(t.id)} className="text-black/40 hover:text-red-600"><X size={12} /></button>
              </span>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}