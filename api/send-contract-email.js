module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { contract: c } = req.body;
  if (!c || !c.tenantEmail) return res.status(400).json({ error: 'Missing contract or email' });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — skipping email');
    return res.status(200).json({ success: false, reason: 'email_not_configured' });
  }

  function fmt(n) { return Number(n || 0).toLocaleString('en-US'); }
  function fmtDate(d) {
    if (!d) return '-';
    const p = d.split('-');
    if (p.length !== 3) return d;
    const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${p[2]} ${M[parseInt(p[1])-1]} ${p[0]}`;
  }
  function monthsBetween(from, to) {
    const d1 = new Date(from), d2 = new Date(to);
    return (d2.getFullYear()-d1.getFullYear())*12 + (d2.getMonth()-d1.getMonth());
  }

  const months = (c.fromDate && c.toDate) ? Math.round(monthsBetween(c.fromDate, c.toDate)) : '-';
  const signedAt = c.signedAt ? new Date(c.signedAt).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' }) : '-';

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>نسخة عقد الإيجار — شقق قرطبة</title>
</head>
<body style="margin:0;padding:0;background:#f0ece0;font-family:Arial,sans-serif;direction:rtl;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ece0;padding:30px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.12);">

  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%);padding:30px;text-align:center;border-bottom:4px solid #b8963e;">
    <div style="width:70px;height:70px;border:3px solid #b8963e;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;background:rgba(184,150,62,.1);margin-bottom:12px;">
      <span style="font-size:28px;">🏠</span>
    </div>
    <div style="color:#b8963e;font-size:22px;font-weight:800;margin-bottom:4px;">شقق قرطبة</div>
    <div style="color:rgba(255,255,255,.7);font-size:12px;letter-spacing:2px;">QURTUBAH APARTMENTS</div>
    <div style="background:rgba(255,255,255,.1);border:1px solid rgba(184,150,62,.4);border-radius:20px;display:inline-block;margin-top:12px;padding:6px 20px;">
      <span style="color:#d4af5a;font-size:13px;font-weight:700;">عقد رقم: ${c.contractNumber || '-'}</span>
    </div>
  </td></tr>

  <!-- Success banner -->
  <tr><td style="background:linear-gradient(135deg,#d1fae5,#a7f3d0);padding:20px 30px;text-align:center;">
    <div style="font-size:36px;margin-bottom:8px;">✅</div>
    <div style="font-size:20px;font-weight:800;color:#065f46;margin-bottom:4px;">تم توقيع العقد بنجاح</div>
    <div style="font-size:13px;color:#047857;">Contract Successfully Signed — ${signedAt}</div>
  </td></tr>

  <!-- Contract details -->
  <tr><td style="padding:28px 30px;">
    <div style="font-size:15px;font-weight:700;color:#1a1a2e;border-bottom:2px solid #e0d4b0;padding-bottom:8px;margin-bottom:18px;">📋 تفاصيل العقد — Contract Details</div>

    <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
      <tr style="background:#f9f3e3;">
        <td style="border:1px solid #e0d4b0;font-weight:700;color:#6b6b6b;width:45%;">نوع الوحدة / Unit Type</td>
        <td style="border:1px solid #e0d4b0;color:#2d2d2d;font-weight:600;">${c.unitType || '-'}</td>
      </tr>
      <tr>
        <td style="border:1px solid #e0d4b0;font-weight:700;color:#6b6b6b;">نوع الإيجار / Rent Type</td>
        <td style="border:1px solid #e0d4b0;color:#2d2d2d;font-weight:600;">${c.rentType || '-'}</td>
      </tr>
      <tr style="background:#f9f3e3;">
        <td style="border:1px solid #e0d4b0;font-weight:700;color:#6b6b6b;">تاريخ البداية / From</td>
        <td style="border:1px solid #e0d4b0;color:#2d2d2d;direction:ltr;text-align:right;">${fmtDate(c.fromDate)}</td>
      </tr>
      <tr>
        <td style="border:1px solid #e0d4b0;font-weight:700;color:#6b6b6b;">تاريخ الانتهاء / To</td>
        <td style="border:1px solid #e0d4b0;color:#2d2d2d;direction:ltr;text-align:right;">${fmtDate(c.toDate)}</td>
      </tr>
      <tr style="background:#f9f3e3;">
        <td style="border:1px solid #e0d4b0;font-weight:700;color:#6b6b6b;">مدة العقد / Duration</td>
        <td style="border:1px solid #e0d4b0;color:#2d2d2d;">${months} شهر / Months</td>
      </tr>
      <tr>
        <td style="border:1px solid #e0d4b0;font-weight:700;color:#6b6b6b;">الإيجار الشهري / Monthly Rate</td>
        <td style="border:1px solid #e0d4b0;color:#1a6b3c;font-weight:800;font-size:15px;">${fmt(c.monthlyRate)} SAR</td>
      </tr>
      <tr style="background:#f9f3e3;">
        <td style="border:1px solid #e0d4b0;font-weight:700;color:#6b6b6b;">التأمين / Security Deposit</td>
        <td style="border:1px solid #e0d4b0;color:#2d2d2d;font-weight:600;">${fmt(c.securityDeposit)} SAR</td>
      </tr>
      <tr style="background:#1a1a2e;">
        <td style="border:1px solid #b8963e;font-weight:800;color:#b8963e;font-size:14px;">الإجمالي / Total Amount</td>
        <td style="border:1px solid #b8963e;color:#d4af5a;font-weight:800;font-size:16px;">${fmt(c.totalAmount)} SAR</td>
      </tr>
    </table>

    ${c.notes ? `<div style="background:#fef9ef;border:1px solid #e0d4b0;border-radius:8px;padding:12px 16px;margin-top:16px;font-size:13px;color:#6b6b6b;">📌 ${c.notes}</div>` : ''}
  </td></tr>

  <!-- Tenant info -->
  <tr><td style="padding:0 30px 28px;">
    <div style="font-size:15px;font-weight:700;color:#1a1a2e;border-bottom:2px solid #e0d4b0;padding-bottom:8px;margin-bottom:18px;">👤 بيانات المستأجر — Tenant Information</div>

    <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
      <tr style="background:#f9f3e3;">
        <td style="border:1px solid #e0d4b0;font-weight:700;color:#6b6b6b;width:45%;">الاسم / Name</td>
        <td style="border:1px solid #e0d4b0;color:#2d2d2d;font-weight:700;">${c.tenantName || '-'}</td>
      </tr>
      <tr>
        <td style="border:1px solid #e0d4b0;font-weight:700;color:#6b6b6b;">الجوال / Phone</td>
        <td style="border:1px solid #e0d4b0;color:#2d2d2d;direction:ltr;text-align:right;">${c.tenantPhone || '-'}</td>
      </tr>
      <tr style="background:#f9f3e3;">
        <td style="border:1px solid #e0d4b0;font-weight:700;color:#6b6b6b;">الجنسية / Nationality</td>
        <td style="border:1px solid #e0d4b0;color:#2d2d2d;">${c.tenantNationality || '-'}</td>
      </tr>
      <tr>
        <td style="border:1px solid #e0d4b0;font-weight:700;color:#6b6b6b;">الهوية / ID</td>
        <td style="border:1px solid #e0d4b0;color:#2d2d2d;direction:ltr;text-align:right;">${c.tenantId || '-'}</td>
      </tr>
      <tr style="background:#f9f3e3;">
        <td style="border:1px solid #e0d4b0;font-weight:700;color:#6b6b6b;">البريد / Email</td>
        <td style="border:1px solid #e0d4b0;color:#2d2d2d;direction:ltr;text-align:right;">${c.tenantEmail || '-'}</td>
      </tr>
      <tr>
        <td style="border:1px solid #e0d4b0;font-weight:700;color:#6b6b6b;">المرافقون / Dependents</td>
        <td style="border:1px solid #e0d4b0;color:#2d2d2d;">${c.dependents ?? 0}</td>
      </tr>
    </table>

    ${c.signature ? `<div style="text-align:center;margin-top:20px;padding:16px;background:#f9f9f9;border:1px solid #e0d4b0;border-radius:8px;">
      <div style="font-size:12px;color:#6b6b6b;margin-bottom:8px;">التوقيع / Signature</div>
      <img src="${c.signature}" alt="Signature" style="max-width:280px;max-height:80px;border:1px solid #ddd;border-radius:4px;">
      <div style="font-size:11px;color:#999;margin-top:6px;direction:ltr;">${signedAt}</div>
    </div>` : ''}
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#1a1a2e;padding:20px 30px;text-align:center;">
    <div style="color:#b8963e;font-size:13px;font-weight:700;margin-bottom:4px;">شقق قرطبة</div>
    <div style="color:rgba(255,255,255,.5);font-size:11px;">الرياض، شارع مليحة &nbsp;|&nbsp; 0531182200</div>
    <div style="color:rgba(255,255,255,.3);font-size:10px;margin-top:8px;direction:ltr;">Qurtubah Apartments — Riyadh, Saudi Arabia</div>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'شقق قرطبة <contracts@qurtubah-app.vercel.app>',
        to: [c.tenantEmail],
        subject: `عقد إيجار رقم ${c.contractNumber || '-'} — شقق قرطبة`,
        html
      })
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('Resend error:', result);
      return res.status(200).json({ success: false, reason: result.message || 'email_failed' });
    }
    return res.status(200).json({ success: true, id: result.id });
  } catch (err) {
    console.error('Email send error:', err);
    return res.status(200).json({ success: false, reason: err.message });
  }
};
