const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const LOGO_URL = "https://res.cloudinary.com/db8mcyukl/image/upload/v1768945790/logo_brkxgk.png";

// ====================== PREMIUM BASE TEMPLATE (Arcana Brown/White Theme) ======================
const baseEmailTemplate = (content, title) => {
  const SOCIAL = {
    instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
    x: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    tiktok: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>`,
    pinterest: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>`,
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Poppins:wght@300;400;500;600&display=swap');
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    .animate-fade-up { animation: fadeInUp 0.8s ease-out forwards; opacity: 0; }
    .animate-fade { animation: fadeIn 1s ease-out forwards; opacity: 0; }
    .animate-scale { animation: scaleIn 0.6s ease-out forwards; opacity: 0; }
    .delay-1 { animation-delay: 0.15s; }
    .delay-2 { animation-delay: 0.3s; }
    .delay-3 { animation-delay: 0.45s; }
    body { margin: 0; padding: 0; background: #1a1410; font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f5f0eb; -webkit-font-smoothing: antialiased; }
    .wrapper { max-width: 640px; margin: 0 auto; background: #231c16; box-shadow: 0 25px 80px rgba(0,0,0,0.4); }
    .header { padding: 56px 48px 40px; text-align: center; background: linear-gradient(180deg, #2a2119 0%, #1e1812 100%); position: relative; overflow: hidden; }
    .header::before { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 120px; height: 3px; background: linear-gradient(90deg, transparent, #8B6A4E, transparent); }
    .header img { width: 140px; height: auto; display: block; margin: 0 auto; filter: brightness(0) invert(1) drop-shadow(0 2px 8px rgba(0,0,0,0.3)); }
    .header .tagline { font-size: 11px; letter-spacing: 5px; color: rgba(245,240,235,0.45); margin-top: 20px; text-transform: uppercase; font-weight: 400; font-family: 'Poppins', sans-serif; }
    .header-line { height: 1px; background: linear-gradient(90deg, transparent, rgba(139,106,78,0.4), transparent); margin: 32px auto 0; max-width: 200px; }
    .body { padding: 52px 48px; background: #f5f0eb; position: relative; }
    .body::before { content: ''; position: absolute; top: 0; left: 48px; right: 48px; height: 1px; background: linear-gradient(90deg, transparent, rgba(89,73,59,0.2), transparent); }
    .heading { font-size: 32px; font-weight: 600; margin: 0 0 16px; color: #2a2119; letter-spacing: -1px; line-height: 1.15; font-family: 'Playfair Display', Georgia, serif; }
    .heading-accent { display: inline-block; position: relative; }
    .heading-accent::after { content: ''; position: absolute; bottom: 2px; left: 0; width: 100%; height: 8px; background: rgba(139,106,78,0.15); z-index: -1; }
    .subheading { font-size: 15px; color: #8B6A4E; margin-bottom: 36px; line-height: 1.7; font-weight: 400; letter-spacing: 0.3px; }
    .content { font-size: 15px; line-height: 1.85; color: #3d3025; }
    .content p { margin: 0 0 18px; }
    .content ul { margin: 20px 0; padding-left: 0; list-style: none; }
    .content li { margin-bottom: 14px; padding-left: 28px; position: relative; color: #3d3025; font-size: 14.5px; }
    .content li::before { content: '—'; position: absolute; left: 0; color: #8B6A4E; font-weight: 600; }
    .btn-wrap { margin: 36px 0; text-align: center; }
    .btn { display: inline-block; padding: 20px 52px; background: #59493b; color: #f5f0eb; text-decoration: none; font-size: 12px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; border-radius: 0; position: relative; overflow: hidden; transition: all 0.4s ease; border: 2px solid #59493b; }
    .btn::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); transition: left 0.6s ease; }
    .btn:hover { background: #3d3025; border-color: #3d3025; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(89,73,59,0.25); }
    .btn:hover::before { left: 100%; }
    .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(89,73,59,0.15), transparent); margin: 40px 0; position: relative; }
    .divider::before { content: '◆'; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); background: #f5f0eb; padding: 0 16px; color: rgba(89,73,59,0.3); font-size: 10px; }
    .info-box { background: #ffffff; padding: 32px; margin: 32px 0; border-left: 4px solid #59493b; box-shadow: 0 4px 20px rgba(89,73,59,0.06); position: relative; }
    .info-box::before { content: ''; position: absolute; top: 0; right: 0; width: 40px; height: 40px; background: linear-gradient(135deg, rgba(89,73,59,0.03) 50%, transparent 50%); }
    .info-box p { margin: 0; font-size: 14px; line-height: 1.75; color: #3d3025; }
    .info-box strong { color: #59493b; font-weight: 600; }
    .order-table { width: 100%; border-collapse: collapse; margin: 28px 0; }
    .order-table th { text-align: left; padding: 14px 0; border-bottom: 2px solid #59493b; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #59493b; font-weight: 600; font-family: 'Poppins', sans-serif; }
    .order-table td { padding: 18px 0; border-bottom: 1px solid rgba(89,73,59,0.08); font-size: 14px; color: #3d3025; }
    .order-table .total { font-weight: 700; font-size: 17px; color: #2a2119; font-family: 'Playfair Display', serif; }
    .order-table tfoot td { border-top: 2px solid #59493b; border-bottom: none; padding-top: 18px; }
    .status-wrap { margin: 24px 0; }
    .status-badge { display: inline-block; padding: 10px 24px; background: #59493b; color: #f5f0eb; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; font-weight: 600; font-family: 'Poppins', sans-serif; position: relative; }
    .status-badge::after { content: ''; position: absolute; bottom: -4px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #59493b; }
    .status-badge.shipped { background: #8B6A4E; }
    .status-badge.shipped::after { border-top-color: #8B6A4E; }
    .status-badge.delivered { background: #3d3025; }
    .status-badge.delivered::after { border-top-color: #3d3025; }
    .footer { padding: 48px; text-align: center; background: linear-gradient(180deg, #1e1812 0%, #2a2119 100%); position: relative; }
    .footer::before { content: ''; position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 80px; height: 2px; background: linear-gradient(90deg, transparent, #8B6A4E, transparent); }
    .footer img { width: 100px; height: auto; display: block; margin: 0 auto 20px; filter: brightness(0) invert(1) opacity(0.85); }
    .footer .tagline-small { font-size: 10px; letter-spacing: 4px; color: rgba(245,240,235,0.35); text-transform: uppercase; margin-bottom: 28px; font-weight: 400; }
    .footer p { font-size: 12px; color: rgba(245,240,235,0.4); margin: 6px 0; line-height: 1.7; }
    .footer .social { margin-top: 28px; display: flex; justify-content: center; gap: 24px; align-items: center; }
    .footer .social a { color: rgba(245,240,235,0.5); text-decoration: none; display: inline-flex; align-items: center; transition: all 0.3s ease; padding: 8px; border: 1px solid rgba(245,240,235,0.1); }
    .footer .social a:hover { color: #f5f0eb; border-color: rgba(245,240,235,0.4); transform: translateY(-3px); }
    .footer .social-label { font-size: 9px; letter-spacing: 3px; text-transform: uppercase; color: rgba(245,240,235,0.25); margin-top: 20px; font-weight: 500; }
    .footer-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(139,106,78,0.2), transparent); margin: 28px auto; max-width: 160px; }
    .quote { font-size: 15px; color: #8B6A4E; font-style: italic; line-height: 1.8; padding: 28px 32px; border-left: 3px solid #59493b; margin: 32px 0; background: rgba(89,73,59,0.03); font-family: 'Playfair Display', serif; }
    .small { font-size: 12.5px; color: #8B6A4E; line-height: 1.7; }
    .small a { color: #59493b; text-decoration: none; border-bottom: 1px solid rgba(89,73,59,0.3); transition: border-color 0.3s; }
    .small a:hover { border-bottom-color: #59493b; }
    .product-img { border-radius: 0; box-shadow: 0 4px 15px rgba(0,0,0,0.08); transition: transform 0.4s ease; }
    .step { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px; }
    .step-num { width: 32px; height: 32px; background: #59493b; color: #f5f0eb; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; font-family: 'Playfair Display', serif; }
    .step-text { font-size: 14px; line-height: 1.7; color: #3d3025; padding-top: 4px; }
    @media only screen and (max-width: 600px) {
      .body, .header, .footer { padding: 36px 28px !important; }
      .heading { font-size: 26px !important; }
      .btn { padding: 18px 36px !important; font-size: 11px !important; }
      .info-box { padding: 24px !important; }
      .quote { padding: 20px 24px !important; }
    }
  </style>
</head>
<body>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr><td align="center" style="padding: 40px 16px; background: #1a1410;">
      <div class="wrapper">
        <div class="header animate-fade">
          <img src="${LOGO_URL}" alt="Arcana" class="animate-scale delay-1" />
          <div class="tagline animate-fade-up delay-2">Designed With Intention</div>
          <div class="header-line animate-fade delay-3"></div>
        </div>
        <div class="body">
          ${content}
        </div>
        <div class="footer animate-fade">
          <div class="footer-divider"></div>
          <img src="${LOGO_URL}" alt="Arcana" />
          <div class="tagline-small">Designed With Intention</div>
          <div class="social">
            <a href="https://instagram.com/arcana.pz" title="Instagram">${SOCIAL.instagram}</a>
            <a href="https://x.com/arcanashopng1" title="X">${SOCIAL.x}</a>
            <a href="https://tiktok.com/@arcana.ng" title="TikTok">${SOCIAL.tiktok}</a>
            <a href="https://pinterest.com/arcanang" title="Pinterest">${SOCIAL.pinterest}</a>
          </div>
          <div class="social-label">Follow The Journey</div>
          <div class="footer-divider"></div>
          <p>© ${new Date().getFullYear()} Arcana. All rights reserved.</p>
          <p>support@mail.shop-arcana.store</p>
        </div>
      </div>
    </td></tr>
  </table>
</body>
</html>`;
};

const sendEmail = async ({ to, subject, html, cc }) => {
  try {
    const options = {
      from: process.env.EMAIL_FROM || "Arcana <support@mail.shop-arcana.store>",
      to,
      subject,
      html,
      reply_to: "arcanashopng@gmail.com",
    };
    if (cc) options.cc = cc;

    const response = await resend.emails.send(options);
    console.log("✅ Email sent:", response.id);
    return response;
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw error;
  }
};

module.exports = { sendEmail, resend, baseEmailTemplate, LOGO_URL };