import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_lib/supabaseClient';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query as { id?: string };
  if (!id) return res.status(400).json({ error: 'id is required' });

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin.from('commits').select('*').eq('id', id).single();
      if (error) return res.status(404).json({ error: 'Not found' });
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      const { error } = await supabaseAdmin.from('commits').delete().eq('id', id);
      if (error) throw error;
      return res.status(204).end();
    }

    res.setHeader('Allow', 'GET,DELETE');
    return res.status(405).end('Method Not Allowed');
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
