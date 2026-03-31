export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) return res.status(500).json({ error: "RESEND_API_KEY não configurada." });

  try {
    const { fields, attachments } = req.body;

    const html = `
<div style="font-family:Calibri,sans-serif;max-width:700px;margin:0 auto;">
  <div style="background:#0f2744;padding:18px 24px;border-radius:8px 8px 0 0;">
    <span style="color:#f97316;font-size:22px;font-weight:bold;letter-spacing:2px;">CARGAPRO</span>
    <span style="color:#94a3b8;font-size:11px;margin-left:12px;text-transform:uppercase;">Novo Lead</span>
  </div>
  <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 8px 8px;padding:24px;">
    <h2 style="color:#0f2744;margin:0 0 16px;">📋 Dados da Transportadora</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:7px 10px;background:#f8fafc;font-weight:bold;width:38%;border:1px solid #e2e8f0;">Empresa</td><td style="padding:7px 10px;border:1px solid #e2e8f0;">${fields.empresa}</td></tr>
      <tr><td style="padding:7px 10px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">CNPJ</td><td style="padding:7px 10px;border:1px solid #e2e8f0;">${fields.cnpj}</td></tr>
      <tr><td style="padding:7px 10px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">Contato</td><td style="padding:7px 10px;border:1px solid #e2e8f0;">${fields.nome}</td></tr>
      <tr><td style="padding:7px 10px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">E-mail</td><td style="padding:7px 10px;border:1px solid #e2e8f0;">${fields.email}</td></tr>
      <tr><td style="padding:7px 10px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">WhatsApp</td><td style="padding:7px 10px;border:1px solid #e2e8f0;">${fields.telefone}</td></tr>
      <tr><td style="padding:7px 10px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">Frota</td><td style="padding:7px 10px;border:1px solid #e2e8f0;">${fields.frota}</td></tr>
    </table>

    <h2 style="color:#0f2744;margin:20px 0 12px;">🚛 Operação</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:7px 10px;background:#f8fafc;font-weight:bold;width:38%;border:1px solid #e2e8f0;">Rotas</td><td style="padding:7px 10px;border:1px solid #e2e8f0;">${fields.rotas}</td></tr>
      <tr><td style="padding:7px 10px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">Tipo de Carga</td><td style="padding:7px 10px;border:1px solid #e2e8f0;">${fields.cargas}</td></tr>
      <tr><td style="padding:7px 10px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">Valor Médio/Viagem</td><td style="padding:7px 10px;border:1px solid #e2e8f0;">${fields.valor_medio}</td></tr>
      <tr><td style="padding:7px 10px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">Viagens/Mês</td><td style="padding:7px 10px;border:1px solid #e2e8f0;">${fields.viagens_mes}</td></tr>
      <tr><td style="padding:7px 10px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">Valor Máximo/Viagem</td><td style="padding:7px 10px;border:1px solid #e2e8f0;">${fields.valor_maximo}</td></tr>
    </table>

    <h2 style="color:#0f2744;margin:20px 0 12px;">🛡️ Seguro Atual</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:7px 10px;background:#f8fafc;font-weight:bold;width:38%;border:1px solid #e2e8f0;">Seguradora</td><td style="padding:7px 10px;border:1px solid #e2e8f0;">${fields.seguradora}</td></tr>
      <tr><td style="padding:7px 10px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">Coberturas</td><td style="padding:7px 10px;border:1px solid #e2e8f0;">${fields.coberturas}</td></tr>
      <tr><td style="padding:7px 10px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">Sinistros (2 anos)</td><td style="padding:7px 10px;border:1px solid #e2e8f0;">${fields.sinistros}</td></tr>
      <tr><td style="padding:7px 10px;background:#f8fafc;font-weight:bold;border:1px solid #e2e8f0;">Observações</td><td style="padding:7px 10px;border:1px solid #e2e8f0;">${fields.observacoes}</td></tr>
    </table>

    <div style="background:#fff3e0;border-left:4px solid #f97316;padding:12px 16px;margin-top:20px;border-radius:0 8px 8px 0;font-size:13px;color:#7c3d00;">
      <b>📎 Documentos:</b> ${fields.docs_info}
    </div>

    <div style="margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;font-size:12px;color:#6b7280;text-align:center;">
      CargaPro · (47) 99942-8938 · minatti@cargapro.com.br · cargapro.com.br
    </div>
  </div>
</div>`;

    const payload = {
      from: "CargaPro <onboarding@resend.dev>",
      to: ["minatti@cargapro.com.br"],
      subject: `Novo Lead CargaPro — ${fields.empresa}`,
      html,
    };

    // Adiciona anexos se houver
    if (attachments && attachments.length > 0) {
      payload.attachments = attachments.map(a => ({
        filename: a.name,
        content:  a.data,
      }));
    }

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok) return res.status(resendRes.status).json({ error: resendData });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
