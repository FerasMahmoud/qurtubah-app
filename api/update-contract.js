const Airtable = require('airtable');

function checkAuth(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '');
  return token.trim() === (process.env.ADMIN_PASSWORD || '').trim();
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PATCH') return res.status(405).json({ error: 'Method not allowed' });

  if (!checkAuth(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { id, ...fields } = req.body;
  if (!id) return res.status(400).json({ error: 'Record ID required' });

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
    .base(process.env.AIRTABLE_BASE_ID);

  const updateFields = {};
  if (fields.contractNumber !== undefined) updateFields['Contract Number'] = fields.contractNumber;
  if (fields.unitType !== undefined) updateFields['Unit Type'] = fields.unitType;
  if (fields.monthlyRate !== undefined) updateFields['Monthly Rate'] = Number(fields.monthlyRate);
  if (fields.securityDeposit !== undefined) updateFields['Security Deposit'] = Number(fields.securityDeposit);
  if (fields.fromDate !== undefined) updateFields['From Date'] = fields.fromDate;
  if (fields.toDate !== undefined) updateFields['To Date'] = fields.toDate;
  if (fields.rentType !== undefined) updateFields['Rent Type'] = fields.rentType;
  if (fields.totalAmount !== undefined) updateFields['Total Amount'] = Number(fields.totalAmount);
  if (fields.notes !== undefined) updateFields['Notes'] = fields.notes;
  if (fields.status !== undefined) updateFields['Status'] = fields.status;
  if (fields.tenantName !== undefined) updateFields['Tenant Name'] = fields.tenantName;
  if (fields.tenantPhone !== undefined) updateFields['Tenant Phone'] = fields.tenantPhone;
  if (fields.tenantNationality !== undefined) updateFields['Tenant Nationality'] = fields.tenantNationality;
  if (fields.tenantId !== undefined) updateFields['Tenant ID'] = fields.tenantId;
  if (fields.tenantEmail !== undefined) updateFields['Tenant Email'] = fields.tenantEmail;
  if (fields.dependents !== undefined) updateFields['Dependents'] = Number(fields.dependents);

  try {
    const updated = await base('Contracts').update(id, updateFields);
    return res.status(200).json({ success: true, id: updated.id });
  } catch (err) {
    console.error('Airtable error:', err);
    return res.status(500).json({ error: 'Failed to update contract', details: err.message });
  }
};
