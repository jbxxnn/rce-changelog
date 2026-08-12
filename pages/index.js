import { useEffect, useState } from 'react';
import Head from 'next/head';

const CATEGORY_META = {
  website: { label: 'Website', color: '#0F6E66', bg: '#E6F1EF' },
  marketing: { label: 'Marketing', color: '#B4530A', bg: '#F6E9DD' },
  product: { label: 'Product', color: '#4438C4', bg: '#EAE8F9' },
  general: { label: 'General', color: '#55606E', bg: '#E7E9E6' },
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

function monthKey(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function Home() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('website');
  const [details, setDetails] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetch('/api/entries');
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (err) {
      setLoadError('Could not load the log. Try refreshing the page.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      setFormError('Add a short description of what changed.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, details, author }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setEntries((prev) => [...prev, data.entry]);
      setTitle('');
      setDetails('');
      setAuthor('');
      setCategory('website');
      setFormOpen(false);
    } catch (err) {
      setFormError(err.message || 'Could not save — try again.');
    } finally {
      setSaving(false);
    }
  }

  let filtered = entries.filter((e) => activeFilter === 'all' || e.category === activeFilter);
  if (searchTerm.trim()) {
    const t = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(t) ||
        (e.details || '').toLowerCase().includes(t) ||
        (e.author || '').toLowerCase().includes(t)
    );
  }
  filtered = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  let lastMonth = null;

  return (
    <>
      <Head>
        <title>Team Log</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="app">
        <div className="masthead">
          <div className="masthead-badge">LOG</div>
          <div>
            <h1>Team Log</h1>
            <p>Every ship, tweak, and post — in one place. Add anything worth remembering.</p>
          </div>
        </div>

        <div className="controls">
          <div className="chips">
            {[['all', 'All'], ...Object.entries(CATEGORY_META).map(([k, v]) => [k, v.label])].map(
              ([key, label]) => (
                <button
                  key={key}
                  className={`chip ${activeFilter === key ? 'active' : ''}`}
                  onClick={() => setActiveFilter(key)}
                >
                  {label}
                </button>
              )
            )}
          </div>
          <input
            className="search"
            type="text"
            placeholder="Search…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="add-btn" onClick={() => setFormOpen(true)}>
            + New entry
          </button>
        </div>

        {formOpen && (
          <div className="form-panel">
            {formError && <div className="form-error">{formError}</div>}
            <div className="form-row">
              <label>What changed</label>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Redesigned homepage hero section"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label>Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="website">Website</option>
                <option value="marketing">Marketing</option>
                <option value="product">Product / App</option>
                <option value="general">General</option>
              </select>
            </div>
            <div className="form-row">
              <label>Details (optional)</label>
              <textarea
                placeholder="Anything worth knowing — what, why, links..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>
            <div className="form-row">
              <label>Your name</label>
              <input
                type="text"
                placeholder="e.g. Sam"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setFormOpen(false)} disabled={saving}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Logging…' : 'Log it'}
              </button>
            </div>
          </div>
        )}

        <main>
          {loading && <div className="empty-state">Loading the log…</div>}
          {!loading && loadError && <div className="empty-state">{loadError}</div>}
          {!loading && !loadError && filtered.length === 0 && (
            <div className="empty-state">
              {entries.length === 0 ? 'No entries yet — be the first to log something.' : 'Nothing matches that filter or search.'}
            </div>
          )}
          {!loading &&
            !loadError &&
            filtered.map((e) => {
              const mk = monthKey(e.date);
              const showMonth = mk !== lastMonth;
              lastMonth = mk;
              const meta = CATEGORY_META[e.category] || CATEGORY_META.general;
              return (
                <div key={e.id}>
                  {showMonth && <div className="month-heading">{mk}</div>}
                  <div className="entry">
                    <div className="stamp" style={{ color: meta.color, background: meta.bg }}>
                      <span className="cat">{meta.label}</span>
                      <span className="date">{formatDate(e.date)}</span>
                    </div>
                    <div className="entry-body">
                      <p className="entry-title">{e.title}</p>
                      {e.details && <p className="entry-details">{e.details}</p>}
                      <p className="entry-author">— {e.author}</p>
                    </div>
                  </div>
                </div>
              );
            })}
        </main>
      </div>

      <style jsx global>{`
        :root {
          --paper: #f3f4ef;
          --card: #ffffff;
          --ink: #1b2434;
          --ink-soft: #5b6472;
          --line: #dbddd5;
          --danger: #b3261e;
        }
        * {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          background: var(--paper);
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
      `}</style>

      <style jsx>{`
        .app {
          max-width: 780px;
          margin: 0 auto;
          padding: 40px 20px 80px;
        }
        .masthead {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 28px;
        }
        .masthead-badge {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: var(--paper);
          background: var(--ink);
          padding: 8px 10px;
          border-radius: 4px;
          transform: rotate(-3deg);
          flex-shrink: 0;
          margin-top: 4px;
        }
        .masthead h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 4px;
          letter-spacing: -0.01em;
        }
        .masthead p {
          margin: 0;
          color: var(--ink-soft);
          font-size: 14.5px;
        }
        .controls {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          padding-bottom: 16px;
          margin-bottom: 8px;
          border-bottom: 1px solid var(--line);
          position: sticky;
          top: 0;
          background: var(--paper);
          padding-top: 6px;
          z-index: 5;
        }
        .chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          flex: 1;
        }
        .chip {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          font-weight: 500;
          padding: 6px 11px;
          border-radius: 100px;
          border: 1px solid var(--line);
          background: var(--card);
          color: var(--ink-soft);
          cursor: pointer;
          letter-spacing: 0.01em;
          transition: transform 0.08s ease;
        }
        .chip:hover {
          transform: translateY(-1px);
        }
        .chip.active {
          color: var(--paper);
          background: var(--ink);
          border-color: var(--ink);
        }
        .search {
          font-family: 'Inter', sans-serif;
          font-size: 13.5px;
          padding: 7px 12px;
          border-radius: 100px;
          border: 1px solid var(--line);
          background: var(--card);
          color: var(--ink);
          width: 160px;
          outline: none;
        }
        .search:focus {
          border-color: var(--ink);
        }
        .add-btn {
          font-family: 'Inter', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: 100px;
          border: none;
          background: var(--ink);
          color: var(--paper);
          cursor: pointer;
          white-space: nowrap;
        }
        .add-btn:hover {
          opacity: 0.9;
        }
        .form-panel {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 18px;
          margin: 16px 0 24px;
        }
        .form-row {
          margin-bottom: 12px;
        }
        .form-row label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-soft);
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .form-row input,
        .form-row textarea,
        .form-row select {
          width: 100%;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          padding: 9px 10px;
          border-radius: 6px;
          border: 1px solid var(--line);
          background: var(--paper);
          color: var(--ink);
          outline: none;
        }
        .form-row input:focus,
        .form-row textarea:focus,
        .form-row select:focus {
          border-color: var(--ink);
        }
        .form-row textarea {
          min-height: 70px;
          resize: vertical;
        }
        .form-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        .btn-primary,
        .btn-secondary {
          font-family: 'Inter', sans-serif;
          font-size: 13.5px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 100px;
          cursor: pointer;
          border: none;
        }
        .btn-primary {
          background: var(--ink);
          color: var(--paper);
        }
        .btn-primary:disabled,
        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .btn-secondary {
          background: transparent;
          color: var(--ink-soft);
          border: 1px solid var(--line);
        }
        .form-error {
          color: var(--danger);
          font-size: 13px;
          margin-bottom: 10px;
        }
        .month-heading {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          font-weight: 600;
          color: var(--ink-soft);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin: 26px 0 12px;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--line);
        }
        .entry {
          display: flex;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid var(--line);
        }
        .stamp {
          flex-shrink: 0;
          width: 78px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          text-align: center;
          padding: 6px 4px;
          border-radius: 5px;
          border: 1.5px solid currentColor;
          line-height: 1.3;
          height: fit-content;
        }
        .stamp .cat {
          display: block;
          letter-spacing: 0.02em;
        }
        .stamp .date {
          display: block;
          opacity: 0.75;
          font-weight: 500;
          margin-top: 2px;
        }
        .entry-body {
          flex: 1;
          min-width: 0;
        }
        .entry-title {
          font-size: 15px;
          font-weight: 600;
          margin: 0 0 4px;
        }
        .entry-details {
          font-size: 13.5px;
          color: var(--ink-soft);
          margin: 0 0 6px;
          line-height: 1.5;
          white-space: pre-wrap;
        }
        .entry-author {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11.5px;
          color: var(--ink-soft);
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--ink-soft);
          font-size: 14px;
        }
        @media (max-width: 480px) {
          .search {
            width: 120px;
          }
          .stamp {
            width: 64px;
            font-size: 10px;
          }
        }
      `}</style>
    </>
  );
}
