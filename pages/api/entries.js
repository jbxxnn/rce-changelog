import { Redis } from '@upstash/redis';

const KEY = 'changelog:entries';

// The Upstash integration sometimes sets KV_REST_API_URL/TOKEN and sometimes
// UPSTASH_REDIS_REST_URL/TOKEN depending on how it was connected — support both.
const kv = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const entries = (await kv.get(KEY)) || [];
      res.status(200).json({ entries });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to load entries.' });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const { title, category, details, author } = req.body || {};

      if (!title || typeof title !== 'string' || !title.trim()) {
        res.status(400).json({ error: 'A short description of what changed is required.' });
        return;
      }

      const validCategories = ['website', 'marketing', 'product', 'general'];
      const safeCategory = validCategories.includes(category) ? category : 'general';

      const entries = (await kv.get(KEY)) || [];

      const newEntry = {
        id: 'e_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        title: title.trim().slice(0, 300),
        category: safeCategory,
        details: (details || '').trim().slice(0, 2000),
        author: (author || '').trim().slice(0, 100) || 'Anonymous',
        date: new Date().toISOString(),
      };

      entries.push(newEntry);
      await kv.set(KEY, entries);

      res.status(200).json({ entry: newEntry });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to save the entry.' });
    }
    return;
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).json({ error: `Method ${req.method} not allowed.` });
}
