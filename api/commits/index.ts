import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE env vars:', { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY });
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '');

export default async function handler(req: any, res: any) {
  try {
    const method = req.method?.toUpperCase();

    if (method === 'GET') {
      const { data, error } = await supabase.from('commits').select('*').order('date', { ascending: false });
      if (error) {
        console.error('Supabase GET error:', error);
        return res.status(500).json({ error: error.message || 'Supabase error' });
      }
      return res.status(200).json(data || []);
    }

    if (method === 'POST') {
      const { message, author, url } = req.body || {};
      if (!message) return res.status(400).json({ error: 'message is required' });

      const payload: any = { message, author: author ?? null, url: url ?? null };
      const { data, error } = await supabase.from('commits').insert([payload]).select().single();
      if (error) {
        console.error('Supabase INSERT error:', error);
        return res.status(500).json({ error: error.message || 'Supabase insert error' });
      }
      return res.status(201).json(data);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (err: any) {
    console.error('API /api/commits error:', err);
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}
