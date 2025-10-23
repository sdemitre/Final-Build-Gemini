import React, { useEffect, useState } from 'react';
import { api } from '../context/AuthContext';

interface PaperSummary {
  id: number;
  title: string;
  abstract: string;
  institution?: string;
  submission_date?: string;
}

const AdminVetting: React.FC = () => {
  const [pending, setPending] = useState<PaperSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/admin/vetting');
        setPending(res.data.papers || []);
      } catch (err) {
        console.error('Failed to load vetting list', err);
        setPending([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const verify = async (id: number) => {
    try {
      await api.post(`/admin/vetting/${id}/verify`);
      setPending(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Verify failed', err);
      alert('Failed to verify paper');
    }
  };

  return (
    <div className="container">
      <h1>Admin — Paper Vetting</h1>
      <p className="text-muted">This is a lightweight admin UI for vetting submitted papers. Use with admin credentials.</p>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="grid gap-4">
          {pending.length === 0 && <div className="card p-4">No papers awaiting vetting.</div>}
          {pending.map(p => (
            <div key={p.id} className="card">
              <div className="card-body">
                <h3>{p.title}</h3>
                <p className="text-muted">{p.institution} — {p.submission_date}</p>
                <p>{p.abstract ? p.abstract.substring(0, 400) + (p.abstract.length > 400 ? '…' : '') : ''}</p>
                <div className="mt-2">
                  <button className="btn btn-sm btn-primary mr-2" onClick={() => verify(p.id)}>Mark Verified</button>
                  <a className="btn btn-sm btn-outline" href={`/papers/${p.id}`}>View</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVetting;
