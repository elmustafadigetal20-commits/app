import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '');

export default async function handler(req: any, res: any) {
  try {
    const { id } = req.query || {};
    const method = req.method?.toUpperCase();

    if (!id) return res.status(400).json({ error: 'id is required' });

    if (method === 'GET') {
      const { data, error } = await supabase.from('commits').select('*').eq('id', id).single();
      if (error) {
        console.error('Supabase GET by id error:', error);
        return res.status(500).json({ error: error.message || 'Supabase error' });
      }
      return res.status(200).json(data);
    }

    if (method === 'DELETE') {
      const { data, error } = await supabase.from('commits').delete().eq('id', id).select().single();
      if (error) {
        console.error('Supabase DELETE error:', error);
        return res.status(500).json({ error: error.message || 'Supabase delete error' });
      }
      return res.status(200).json({ deleted: data });
    }

    res.setHeader('Allow', ['GET', 'DELETE']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  } catch (err: any) {
    console.error('API /api/commits/[id] error:', err);
    return res.status(500).json({ error: err?.message || 'Internal Server Error' });
  }
}
