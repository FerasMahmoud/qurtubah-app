const Airtable = require('airtable');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token required' });

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
    .base(process.env.AIRTABLE_BASE_ID);

  try {
    const records = await base('Contracts').select({
      filterByFormula: `{Token} = "${token}"`,
      maxRecords: 1
    }).firstPage();

    if (!records || records.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const rec = records[0];
    const fields = rec.fields;

    // Don't expose signature to GET (only returned after signing)
    const contract = {
      id: rec.id,
      token: fields['Token'],
      contractNumber: fields['Contract Number'],
      unitType: fields['Unit Type'],
      monthlyRate: fields['Monthly Rate'],
      securityDeposit: fields['Security Deposit'],
      fromDate: fields['From Date'],
      toDate: fields['To Date'],
      rentType: fields['Rent Type'],
      totalAmount: fields['Total Amount'],
      notes: fields['Notes'],
      status: fields['Status'],
      tenantName: fields['Tenant Name'],
      tenantPhone: fields['Tenant Phone'],
      tenantNationality: fields['Tenant Nationality'],
      tenantId: fields['Tenant ID'],
      tenantEmail: fields['Tenant Email'],
      dependents: fields['Dependents'],
      signedAt: fields['Signed At'],
      createdAt: fields['Created At']
    };

    return res.status(200).json({ success: true, contract });
  } catch (err) {
    console.error('Airtable error:', err);
    return res.status(500).json({ error: 'Failed to fetch contract', details: err.message });
  }
};
