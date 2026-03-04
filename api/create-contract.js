const Airtable = require('airtable');

function generateToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 18; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function checkAuth(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '');
  return token.trim() === (process.env.ADMIN_PASSWORD || '').trim();
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const {
    contractNumber, unitType, monthlyRate, securityDeposit,
    fromDate, toDate, rentType, totalAmount, notes
  } = req.body;

  if (!contractNumber || !unitType || !monthlyRate || !fromDate || !toDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
    .base(process.env.AIRTABLE_BASE_ID);

  const token = generateToken();
  const now = new Date().toISOString();

  try {
    const record = await base('Contracts').create({
      'Token': token,
      'Contract Number': contractNumber,
      'Unit Type': unitType,
      'Monthly Rate': Number(monthlyRate),
      'Security Deposit': Number(securityDeposit) || 0,
      'From Date': fromDate,
      'To Date': toDate,
      'Rent Type': rentType || 'شهري',
      'Total Amount': Number(totalAmount) || 0,
      'Notes': notes || '',
      'Status': 'Pending',
      'Created At': now
    });

    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const signingUrl = `${proto}://${host}/sign?token=${token}`;

    return res.status(200).json({
      success: true,
      token,
      signingUrl,
      recordId: record.id
    });
  } catch (err) {
    console.error('Airtable error:', err);
    return res.status(500).json({ error: 'Failed to create contract', details: err.message });
  }
};
