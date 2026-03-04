const Airtable = require('airtable');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    token, tenantName, tenantPhone, tenantNationality,
    tenantId, tenantEmail, dependents, signature
  } = req.body;

  if (!token || !tenantName || !tenantPhone || !tenantNationality || !tenantEmail || !signature) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

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
    if (rec.fields['Status'] === 'Signed') {
      return res.status(409).json({ error: 'Contract already signed' });
    }

    const now = new Date().toISOString();

    await base('Contracts').update(rec.id, {
      'Tenant Name': tenantName,
      'Tenant Phone': tenantPhone,
      'Tenant Nationality': tenantNationality,
      'Tenant ID': tenantId || '',
      'Tenant Email': tenantEmail,
      'Dependents': Number(dependents) || 0,
      'Signature': signature,
      'Status': 'Signed',
      'Signed At': now
    });

    const fields = rec.fields;
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
      status: 'Signed',
      tenantName,
      tenantPhone,
      tenantNationality,
      tenantId: tenantId || '',
      tenantEmail,
      dependents: Number(dependents) || 0,
      signature,
      signedAt: now,
      createdAt: fields['Created At']
    };

    return res.status(200).json({ success: true, contract });
  } catch (err) {
    console.error('Airtable error:', err);
    return res.status(500).json({ error: 'Failed to sign contract', details: err.message });
  }
};
