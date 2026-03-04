require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error('Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID in .env');
  process.exit(1);
}

async function createTable() {
  const url = `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`;

  const body = {
    name: 'Contracts',
    fields: [
      { name: 'Token', type: 'singleLineText' },
      { name: 'Contract Number', type: 'singleLineText' },
      { name: 'Unit Type', type: 'singleLineText' },
      { name: 'Monthly Rate', type: 'number', options: { precision: 2 } },
      { name: 'Security Deposit', type: 'number', options: { precision: 2 } },
      { name: 'From Date', type: 'singleLineText' },
      { name: 'To Date', type: 'singleLineText' },
      { name: 'Rent Type', type: 'singleLineText' },
      { name: 'Total Amount', type: 'number', options: { precision: 2 } },
      { name: 'Notes', type: 'multilineText' },
      {
        name: 'Status',
        type: 'singleSelect',
        options: {
          choices: [
            { name: 'Pending', color: 'yellowLight2' },
            { name: 'Signed', color: 'greenLight2' }
          ]
        }
      },
      { name: 'Tenant Name', type: 'singleLineText' },
      { name: 'Tenant Phone', type: 'singleLineText' },
      { name: 'Tenant Nationality', type: 'singleLineText' },
      { name: 'Tenant ID', type: 'singleLineText' },
      { name: 'Tenant Email', type: 'email' },
      { name: 'Dependents', type: 'number', options: { precision: 0 } },
      { name: 'Signature', type: 'multilineText' },
      { name: 'Signed At', type: 'singleLineText' },
      { name: 'Created At', type: 'singleLineText' }
    ]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    if (data.error && data.error.type === 'TABLE_EXISTS') {
      console.log('✓ Table "Contracts" already exists — skipping creation.');
    } else {
      console.error('Failed to create table:', JSON.stringify(data, null, 2));
      process.exit(1);
    }
  } else {
    console.log('✓ Table "Contracts" created successfully!');
    console.log('  Table ID:', data.id);
  }
}

createTable().then(() => {
  console.log('\nSetup complete. You can now deploy with: vercel --prod');
}).catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
