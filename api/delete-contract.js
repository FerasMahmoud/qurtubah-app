const Airtable = require('airtable');

function checkAuth(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '');
  return token.trim() === (process.env.ADMIN_PASSWORD || '').trim();
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });

  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Record ID required' });

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
    .base(process.env.AIRTABLE_BASE_ID);

  try {
    await base('Contracts').destroy(id);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Airtable error:', err);
    return res.status(500).json({ error: 'Failed to delete contract', details: err.message });
  }
};
