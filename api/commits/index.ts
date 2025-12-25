import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from '../_lib/supabaseClient';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const { data, error } = await supabaseAdmin
        .from('commits')
        .select('*')
        .order('date', { ascending: false })
        .limit(100);

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { message, author, date, url } = req.body ?? {};
      if (!message) return res.status(400).json({ error: 'message is required' });

      const payload = {
        message,
        author: author ?? null,
        date: date ?? new Date().toISOString(),
        url: url ?? null
      };

      const { data, error } = await supabaseAdmin
        .from('commits')
        .insert([payload])
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    res.setHeader('Allow', 'GET,POST');
    return res.status(405).end('Method Not Allowed');
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
