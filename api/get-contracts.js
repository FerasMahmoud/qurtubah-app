const Airtable = require('airtable');

function checkAuth(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '');
  return token.trim() === (process.env.ADMIN_PASSWORD || '').trim();
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
    .base(process.env.AIRTABLE_BASE_ID);

  try {
    const records = await base('Contracts').select({
      sort: [{ field: 'Created At', direction: 'desc' }]
    }).all();

    const contracts = records.map(rec => ({
      id: rec.id,
      token: rec.fields['Token'],
      contractNumber: rec.fields['Contract Number'],
      unitType: rec.fields['Unit Type'],
      monthlyRate: rec.fields['Monthly Rate'],
      securityDeposit: rec.fields['Security Deposit'],
      fromDate: rec.fields['From Date'],
      toDate: rec.fields['To Date'],
      rentType: rec.fields['Rent Type'],
      totalAmount: rec.fields['Total Amount'],
      notes: rec.fields['Notes'],
      status: rec.fields['Status'],
      tenantName: rec.fields['Tenant Name'],
      tenantPhone: rec.fields['Tenant Phone'],
      tenantNationality: rec.fields['Tenant Nationality'],
      tenantId: rec.fields['Tenant ID'],
      tenantEmail: rec.fields['Tenant Email'],
      dependents: rec.fields['Dependents'],
      signature: rec.fields['Signature'],
      signedAt: rec.fields['Signed At'],
      createdAt: rec.fields['Created At']
    }));

    return res.status(200).json({ success: true, contracts });
  } catch (err) {
    console.error('Airtable error:', err);
    return res.status(500).json({ error: 'Failed to fetch contracts', details: err.message });
  }
};
