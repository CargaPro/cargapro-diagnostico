import { useState, useRef } from "react";

// ══════════════════════════════════════════════════════════════════
//  ⚙️  CONFIGURE AQUI — EmailJS (emailjs.com — plano grátis)
//  1. Add Email Service (Gmail) → copie Service ID
//  2. Create Email Template     → copie Template ID
//  3. Account → API Keys        → copie Public Key
// ══════════════════════════════════════════════════════════════════
const EJS_SERVICE_ID  = "service_5fs3ror";
const EJS_TEMPLATE_ID = "template_dhkt3ur";
const EJS_PUBLIC_KEY  = "YaS19i6KzKLzHgm7m";
const DEST_EMAIL      = "minatti@cargapro.com.br";

// ── CORES ─────────────────────────────────────────────────────────
const C = {
  navy:"#0f2744", navy2:"#1e3a5f", orange:"#f97316",
  orangeLt:"#fff3e0", green:"#22c55e", greenLt:"#f0fdf4",
  greenDk:"#166534", red:"#ef4444", redLt:"#fef2f2",
  redDk:"#991b1b", amber:"#f59e0b", amberLt:"#fffbeb",
  gray:"#6b7280", grayLt:"#f8fafc", grayBd:"#e2e8f0",
  dark:"#1e293b",
};

// ── PROMPT DA IA ──────────────────────────────────────────────────
const SYSTEM_PROMPT = `Você é um consultor técnico sênior em seguros de transporte de cargas rodoviárias no Brasil, com mais de 20 anos de experiência. Trabalha para a CargaPro ao lado de especialistas humanos.

Sua missão não é apenas apontar riscos — é encontrar SOLUÇÕES PRÁTICAS de cobertura e, principalmente, REDUÇÃO DE CUSTO sem abrir mão da proteção. O seguro de carga funciona por averbação (taxa percentual sobre o valor averbado por viagem), o que oferece oportunidades reais de otimização.

Analise os dados da operação, a apólice atual (se enviada) e a última fatura (se enviada). Pense como um consultor que quer ganhar a confiança do cliente mostrando que conhece a operação dele melhor do que a corretora atual.

Responda APENAS em JSON válido, sem texto fora do JSON, sem markdown. Estrutura obrigatória:
{
  "resumo_executivo": "2-3 frases diretas sobre a situação atual",
  "score_protecao": <0 a 100>,
  "pontos_positivos": [
    { "item": "o que está funcionando bem", "detalhe": "explicação técnica" }
  ],
  "riscos_e_solucoes": [
    {
      "nivel": "ALTO|MEDIO|BAIXO",
      "risco": "descrição clara do risco",
      "impacto": "o que pode acontecer na prática",
      "solucao": "como resolver — cobertura, cláusula ou ajuste específico"
    }
  ],
  "oportunidades_reducao_custo": [
    {
      "oportunidade": "onde e como reduzir custo",
      "como": "mecanismo técnico — taxa de averbação, franquia, rastreamento, consolidação",
      "estimativa": "estimativa percentual ou benefício esperado"
    }
  ],
  "plano_de_acao": [
    { "prioridade": "IMEDIATA|CURTO_PRAZO|MEDIO_PRAZO", "acao": "ação específica e objetiva" }
  ],
  "recomendacao_consultoria": "parágrafo humanizado como especialista que quer ajudar, cite produtos CargaPro (RCTR-C, RC-DC, TN, RCT-VI) quando relevante, finalize convidando para conversa"
}`;

// ── HELPERS ───────────────────────────────────────────────────────
const readB64 = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result.split(",")[1]);
  r.onerror = rej;
  r.readAsDataURL(file);
});
const fmtDate     = () => new Date().toLocaleDateString("pt-BR");
const scoreColor  = (s) => s >= 70 ? C.green  : s >= 40 ? C.amber  : C.red;
const scoreLabel  = (s) => s >= 70 ? "Boa Proteção" : s >= 40 ? "Proteção Parcial" : "Atenção Necessária";
const NIVEL_C     = { ALTO:C.red,    MEDIO:C.amber,    BAIXO:C.green   };
const NIVEL_BG    = { ALTO:C.redLt,  MEDIO:C.amberLt,  BAIXO:C.greenLt };
const PRIOR_C     = { IMEDIATA:"#dc2626", CURTO_PRAZO:"#d97706", MEDIO_PRAZO:"#2563eb" };
const PRIOR_BG    = { IMEDIATA:"#fef2f2", CURTO_PRAZO:"#fffbeb", MEDIO_PRAZO:"#eff6ff" };

// ── WORD REPORT ───────────────────────────────────────────────────
const generateWordHtml = (form, r) => `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='utf-8'><title>Analise CargaPro</title>
<style>
  body{font-family:Calibri,sans-serif;font-size:11pt;color:#1e293b;margin:2cm;}
  h1{color:#0f2744;font-size:18pt;border-bottom:3px solid #f97316;padding-bottom:8px;}
  h2{color:#0f2744;font-size:13pt;margin-top:24px;margin-bottom:10px;}
  .sub{color:#6b7280;font-size:9pt;margin-bottom:22px;}
  .score-box{background:#f1f5f9;border-left:6px solid #f97316;padding:14px 18px;margin:14px 0;}
  .score-num{font-size:32pt;font-weight:bold;color:${scoreColor(r.score_protecao)};}
  .ok{border-left:4px solid #22c55e;background:#f0fdf4;padding:9px 13px;margin:8px 0;}
  .risk{padding:9px 13px;margin:8px 0;}
  .risk-ALTO{border-left:4px solid #ef4444;background:#fef2f2;}
  .risk-MEDIO{border-left:4px solid #f59e0b;background:#fffbeb;}
  .risk-BAIXO{border-left:4px solid #22c55e;background:#f0fdf4;}
  .tag{display:inline-block;padding:2px 8px;font-weight:bold;font-size:8pt;color:white;margin-right:6px;}
  .tag-ALTO{background:#ef4444;}.tag-MEDIO{background:#f59e0b;}.tag-BAIXO{background:#22c55e;}
  .eco{border-left:4px solid #f97316;background:#fff3e0;padding:9px 13px;margin:8px 0;}
  .ac-IMEDIATA{border-left:4px solid #dc2626;background:#fef2f2;padding:8px 13px;margin:6px 0;}
  .ac-CURTO_PRAZO{border-left:4px solid #d97706;background:#fffbeb;padding:8px 13px;margin:6px 0;}
  .ac-MEDIO_PRAZO{border-left:4px solid #2563eb;background:#eff6ff;padding:8px 13px;margin:6px 0;}
  .rec{background:#0f2744;color:white;padding:18px 22px;margin-top:22px;}
  .rec-title{color:#f97316;font-weight:bold;font-size:12pt;margin-bottom:10px;}
  .rec-body{color:#e2e8f0;line-height:1.8;}
  .rec-ct{margin-top:14px;padding-top:12px;border-top:1px solid #1e3a5f;font-size:9pt;color:#94a3b8;}
  table{width:100%;border-collapse:collapse;margin:10px 0;}
  td{padding:7px 10px;border:1px solid #e2e8f0;font-size:10pt;}
  td:first-child{background:#f1f5f9;font-weight:bold;width:34%;}
  .hdr{background:#0f2744;padding:16px 22px;margin-bottom:22px;}
  .hdr-logo{color:#f97316;font-size:20pt;font-weight:bold;letter-spacing:2px;}
  .hdr-sub{color:#94a3b8;font-size:9pt;margin-top:2px;}
  .footer{margin-top:28px;padding-top:10px;border-top:1px solid #e2e8f0;font-size:8pt;color:#6b7280;text-align:center;}
</style></head>
<body>
<div class="hdr"><div class="hdr-logo">CARGAPRO</div><div class="hdr-sub">Analise Tecnica de Cobertura e Reducao de Custo — Consultor + IA</div></div>
<h1>Relatorio de Analise Tecnica</h1>
<div class="sub">Gerado em ${fmtDate()} | CargaPro Consultoria | (47) 99942-8938</div>
<h2>Identificacao do Cliente</h2>
<table>
  <tr><td>Empresa</td><td><b>${form.empresa}</b></td></tr>
  <tr><td>CNPJ</td><td>${form.cnpj||"Nao informado"}</td></tr>
  <tr><td>Contato</td><td>${form.nome} | ${form.email} | ${form.telefone}</td></tr>
  <tr><td>Rotas</td><td>${form.rotas}</td></tr>
  <tr><td>Tipo de Carga</td><td>${form.cargas}</td></tr>
  <tr><td>Frota</td><td>${form.frota||"Nao informado"}</td></tr>
  <tr><td>Valor Medio/Viagem</td><td>${form.valor_medio||"Nao informado"}</td></tr>
  <tr><td>Media de Viagens/Mes</td><td>${form.viagens_mes||"Nao informado"}</td></tr>
  <tr><td>Valor Maximo por Viagem</td><td>${form.valor_maximo||"Nao informado"}</td></tr>
  <tr><td>Coberturas Atuais</td><td>${form.coberturas}</td></tr>
  <tr><td>Seguradora</td><td>${form.seguradora||"Nao informada"}</td></tr>
  <tr><td>Sinistros (2 anos)</td><td>${form.sinistros||"Nao informado"}</td></tr>
  <tr><td>Documentos Enviados</td><td>${form.docs_info||"Nenhum"}</td></tr>
</table>
<h2>Score de Protecao</h2>
<div class="score-box">
  <div class="score-num">${r.score_protecao}<span style="font-size:16pt;">/100</span></div>
  <div style="font-weight:bold;color:${scoreColor(r.score_protecao)};margin-bottom:6px;">${scoreLabel(r.score_protecao).toUpperCase()}</div>
  <div>${r.resumo_executivo}</div>
</div>
<h2>Pontos Positivos</h2>
${(r.pontos_positivos||[]).map(p=>`<div class="ok"><b>${p.item}</b><br/><span style="font-size:10pt;color:#6b7280;">${p.detalhe}</span></div>`).join("")}
<h2>Riscos e Solucoes</h2>
${(r.riscos_e_solucoes||[]).map(x=>`<div class="risk risk-${x.nivel}"><span class="tag tag-${x.nivel}">${x.nivel}</span><b>${x.risco}</b><br/><span style="font-size:10pt;"><b>Impacto:</b> ${x.impacto}</span><br/><span style="font-size:10pt;color:#0f2744;"><b>Solucao:</b> ${x.solucao}</span></div>`).join("")}
<h2>Reducao de Custo</h2>
${(r.oportunidades_reducao_custo||[]).map(e=>`<div class="eco"><b>${e.oportunidade}</b> - <b style="color:#c2410c;">${e.estimativa}</b><br/><span style="font-size:10pt;">${e.como}</span></div>`).join("")}
<h2>Plano de Acao</h2>
${(r.plano_de_acao||[]).map(a=>`<div class="ac-${a.prioridade}"><b>${a.prioridade.replace(/_/g," ")}</b> - ${a.acao}</div>`).join("")}
<div class="rec">
  <div class="rec-title">Nota do Consultor CargaPro</div>
  <div class="rec-body">${r.recomendacao_consultoria}</div>
  <div class="rec-ct">Tel: (47) 99942-8938 | minatti@cargapro.com.br | cargapro.com.br</div>
</div>
<div class="footer">Analise Tecnica CargaPro | Consultor + IA | ${fmtDate()}</div>
</body></html>`;

// ── EMAIL ─────────────────────────────────────────────────────────
const sendEmail = async (form, resultado, wordB64) => {
  const body = `NOVA ANALISE — ${form.empresa}
Score: ${resultado.score_protecao}/100 — ${scoreLabel(resultado.score_protecao)}

CLIENTE: ${form.nome} | ${form.email} | ${form.telefone}
EMPRESA: ${form.empresa} (${form.cnpj||"sem CNPJ"})

RESUMO:
${resultado.resumo_executivo}

RISCOS:
${(resultado.riscos_e_solucoes||[]).map(r=>`[${r.nivel}] ${r.risco}`).join("\n")}

REDUCAO DE CUSTO:
${(resultado.oportunidades_reducao_custo||[]).map(e=>`• ${e.oportunidade}: ${e.estimativa}`).join("\n")}

PLANO DE ACAO:
${(resultado.plano_de_acao||[]).map(a=>`[${a.prioridade}] ${a.acao}`).join("\n")}

DOCUMENTOS: ${form.docs_info||"Nenhum"}
Data: ${fmtDate()}`;

  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: EJS_SERVICE_ID,
      template_id: EJS_TEMPLATE_ID,
      user_id: EJS_PUBLIC_KEY,
      template_params: { to_email:DEST_EMAIL, empresa:form.empresa, nome:form.nome, email_cliente:form.email, telefone:form.telefone, score:resultado.score_protecao, body },
      attachments: [{ name:`CargaPro_Analise_${form.empresa.replace(/\s+/g,"_")}.doc`, data:wordB64, type:"application/msword" }],
    })
  });
  if (!res.ok) throw new Error("EmailJS error");
};

// ══════════════════════════════════════════════════════════════════
//  COMPONENTES
// ══════════════════════════════════════════════════════════════════
function StepBar({ current }) {
  const steps = ["Seus Dados","Documentos","Analisando","Relatório"];
  return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",marginBottom:32 }}>
      {steps.map((s,i) => (
        <div key={i} style={{ display:"flex",alignItems:"center" }}>
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:5 }}>
            <div style={{
              width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
              fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:15,
              background:i<current?C.green:i===current?C.orange:C.grayBd,
              color:i<=current?"white":C.gray, transition:"all .3s",
              boxShadow:i===current?`0 0 0 4px ${C.orangeLt}`:"none",
            }}>{i<current?"✓":i+1}</div>
            <span style={{ fontSize:10,color:i===current?C.orange:C.gray,fontWeight:i===current?700:400,whiteSpace:"nowrap" }}>{s}</span>
          </div>
          {i<steps.length-1 && <div style={{ width:52,height:2,background:i<current?C.green:C.grayBd,margin:"0 4px",marginBottom:20,transition:"all .3s" }}/>}
        </div>
      ))}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, required, type="text", textarea, half, hint }) {
  const base = { width:"100%",border:`1.5px solid ${C.grayBd}`,borderRadius:8,padding:"10px 13px",fontSize:14,color:C.dark,background:C.grayLt,fontFamily:"'Lato',sans-serif",outline:"none" };
  return (
    <div style={{ gridColumn:half?"auto":"1/-1" }}>
      <label style={{ display:"block",fontSize:11,fontWeight:700,color:C.gray,marginBottom:4,textTransform:"uppercase",letterSpacing:.5 }}>
        {label}{required&&<span style={{ color:C.orange }}> *</span>}
      </label>
      {hint && <div style={{ fontSize:11,color:C.gray,marginBottom:5,fontStyle:"italic" }}>{hint}</div>}
      {textarea
        ? <textarea rows={2} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{...base,resize:"vertical"}}/>
        : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={base}/>
      }
    </div>
  );
}

function UploadZone({ label, badge, hint, icon, accentColor, files, onAdd, onRemove }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);
  const add = raw => onAdd(Array.from(raw).filter(f => f.name.toLowerCase().endsWith(".pdf")));
  return (
    <div>
      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
        <span style={{ fontSize:12,fontWeight:700,color:C.dark,textTransform:"uppercase",letterSpacing:.5 }}>{label}</span>
        {badge && <span style={{ fontSize:10,fontWeight:700,background:C.orangeLt,color:"#c2410c",borderRadius:100,padding:"2px 8px" }}>{badge}</span>}
      </div>
      {hint && <div style={{ fontSize:12,color:C.gray,marginBottom:8,lineHeight:1.55 }}>{hint}</div>}
      <div
        onDrop={e=>{e.preventDefault();setDrag(false);add(e.dataTransfer.files);}}
        onDragOver={e=>{e.preventDefault();setDrag(true);}}
        onDragLeave={()=>setDrag(false)}
        onClick={()=>ref.current.click()}
        style={{ border:`2px dashed ${drag?accentColor:C.grayBd}`,borderRadius:10,padding:"22px 16px",textAlign:"center",cursor:"pointer",background:drag?"#fff8f0":C.grayLt,transition:"all .2s" }}>
        <div style={{ fontSize:26,marginBottom:6 }}>{icon}</div>
        <div style={{ fontWeight:700,fontSize:13,color:C.dark,marginBottom:2 }}>Arraste ou clique para selecionar</div>
        <div style={{ fontSize:11,color:C.gray }}>PDFs · máx. 5 arquivos</div>
        <input ref={ref} type="file" accept=".pdf" multiple style={{ display:"none" }} onChange={e=>add(e.target.files)}/>
      </div>
      {files.map((fi,i) => (
        <div key={i} style={{ display:"flex",alignItems:"center",gap:8,background:C.greenLt,border:`1px solid ${C.green}`,borderRadius:7,padding:"7px 12px",marginTop:6 }}>
          <span>✅</span>
          <span style={{ flex:1,fontSize:12,color:C.greenDk,fontWeight:700 }}>{fi.name}</span>
          <span style={{ fontSize:11,color:C.gray }}>{(fi.size/1024).toFixed(0)} KB</span>
          <button onClick={e=>{e.stopPropagation();onRemove(i);}} style={{ background:"none",border:"none",cursor:"pointer",color:C.red,fontSize:15 }}>✕</button>
        </div>
      ))}
    </div>
  );
}

function ScoreMeter({ score }) {
  const c=scoreColor(score), r=52, circ=2*Math.PI*r;
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:5 }}>
      <svg width={130} height={130}>
        <circle cx={65} cy={65} r={r} fill="none" stroke={C.grayBd} strokeWidth={10}/>
        <circle cx={65} cy={65} r={r} fill="none" stroke={c} strokeWidth={10}
          strokeDasharray={circ} strokeDashoffset={circ-(score/100)*circ}
          strokeLinecap="round" transform="rotate(-90 65 65)" style={{ transition:"stroke-dashoffset 1.2s ease" }}/>
        <text x={65} y={61} textAnchor="middle" fontSize={26} fontWeight={800} fill={c} fontFamily="'Barlow Condensed',sans-serif">{score}</text>
        <text x={65} y={79} textAnchor="middle" fontSize={11} fill={C.gray} fontFamily="sans-serif">/100</text>
      </svg>
      <span style={{ fontSize:11,fontWeight:800,color:c,letterSpacing:1,textTransform:"uppercase" }}>{scoreLabel(score)}</span>
    </div>
  );
}

function SecTitle({ icon, label, color }) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
      <span style={{ fontSize:17 }}>{icon}</span>
      <span style={{ fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:800,color,letterSpacing:1,textTransform:"uppercase" }}>{label}</span>
    </div>
  );
}

function Hr() { return <div style={{ height:1,background:C.grayBd,margin:"18px 0" }}/>; }

// ══════════════════════════════════════════════════════════════════
//  APP
// ══════════════════════════════════════════════════════════════════
export default function App() {
  const [step, setStep]     = useState(0);
  const [form, setForm]     = useState({ nome:"",email:"",telefone:"",empresa:"",cnpj:"",rotas:"",cargas:"",frota:"",valor_medio:"",viagens_mes:"",valor_maximo:"",coberturas:"",seguradora:"",sinistros:"",obs:"",docs_info:"" });
  const [apolices, setApolices] = useState([]);
  const [faturas,  setFaturas]  = useState([]);
  const [resultado, setResultado] = useState(null);
  const [loadMsg, setLoadMsg]     = useState("");
  const [emailStatus, setEmailStatus] = useState(null);
  const [erro, setErro] = useState("");
  const fld = k => v => setForm(p=>({...p,[k]:v}));

  const validate1 = () => {
    if (!form.nome||!form.email||!form.empresa||!form.rotas||!form.cargas||!form.coberturas) {
      setErro("Preencha os campos obrigatórios marcados com *."); return false;
    }
    setErro(""); return true;
  };

  const handleAnalyze = async () => {
    setStep(2);
    const docsInfo = [
      apolices.length ? `Apólice: ${apolices.map(x=>x.name).join(", ")}` : "Sem apólice",
      faturas.length  ? `Fatura: ${faturas.map(x=>x.name).join(", ")}`   : "Sem fatura",
    ].join(" | ");
    const formFull = {...form, docs_info:docsInfo};

    try {
      const content = [];
      setLoadMsg("Preparando documentos...");
      content.push({ type:"text", text:`Analise os dados e documentos desta transportadora. Atue como consultor técnico focado em coberturas adequadas e REDUCAO DE CUSTO via averbacao:

Empresa: ${form.empresa} | CNPJ: ${form.cnpj||"N/I"}
Contato: ${form.nome} | ${form.email} | ${form.telefone}
Rotas: ${form.rotas}
Carga: ${form.cargas}
Frota: ${form.frota||"N/I"}
Valor medio/viagem: ${form.valor_medio||"N/I"}
Media de viagens/mes: ${form.viagens_mes||"N/I"}
Valor maximo em uma unica viagem: ${form.valor_maximo||"N/I"}
Coberturas atuais: ${form.coberturas}
Seguradora: ${form.seguradora||"N/I"}
Sinistros (2a): ${form.sinistros||"N/I"}
Obs: ${form.obs||"Nenhuma"}
Docs enviados: ${docsInfo}

LEMBRE: seguro de carga e por averbacao (taxa % sobre valor averbado). Identifique oportunidades de reducao de taxa, ajuste de franquia, consolidacao de cobertura, rastreamento.` });

      for (const file of [...apolices, ...faturas]) {
        try { const b64 = await readB64(file); content.push({ type:"document", source:{ type:"base64", media_type:"application/pdf", data:b64 } }); } catch {}
      }

      setLoadMsg("Consultor + IA analisando cobertura e custos...");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:SYSTEM_PROMPT, messages:[{role:"user",content}] })
      });
      const data = await res.json();
      const parsed = JSON.parse(data.content.map(i=>i.text||"").join("").replace(/```json|```/g,"").trim());

      setLoadMsg("Gerando relatório Word...");
      const blob = new Blob([generateWordHtml(formFull,parsed)],{type:"application/msword"});
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href=url; a.download=`CargaPro_Analise_${form.empresa.replace(/\s+/g,"_")}.doc`; a.click(); URL.revokeObjectURL(url);

      setLoadMsg("Notificando consultor CargaPro...");
      setEmailStatus("sending");
      try {
        const b64w = await new Promise(res2=>{ const r2=new FileReader(); r2.onload=()=>res2(r2.result.split(",")[1]); r2.readAsDataURL(blob); });
        await sendEmail(formFull, parsed, b64w);
        setEmailStatus("sent");
      } catch { setEmailStatus("error"); }

      setResultado(parsed);
      setForm(formFull);
      setStep(3);
    } catch(e) {
      console.error(e); setErro("Erro na análise. Tente novamente."); setStep(1);
    }
  };

  const resetAll = () => {
    setStep(0); setResultado(null); setApolices([]); setFaturas([]);
    setEmailStatus(null); setErro("");
    setForm({ nome:"",email:"",telefone:"",empresa:"",cnpj:"",rotas:"",cargas:"",frota:"",valor_medio:"",viagens_mes:"",valor_maximo:"",coberturas:"",seguradora:"",sinistros:"",obs:"",docs_info:"" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Lato:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#f1f5f9;font-family:'Lato',sans-serif;}
        input,textarea{font-family:'Lato',sans-serif;}
        input:focus,textarea:focus{outline:none;border-color:${C.orange}!important;box-shadow:0 0 0 3px rgba(249,115,22,.15);}
        .btn{border:none;border-radius:9px;cursor:pointer;font-family:'Barlow Condensed',sans-serif;font-weight:800;letter-spacing:.5px;text-transform:uppercase;transition:all .2s;}
        .btn-p{background:linear-gradient(135deg,#f97316,#ea580c);color:white;}
        .btn-p:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(249,115,22,.4);}
        .btn-o{background:white;color:${C.navy};border:2px solid ${C.navy};}
        .btn-o:hover{background:${C.navy};color:white;}
        .card{background:white;border-radius:14px;border:1px solid ${C.grayBd};padding:28px;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        .fu{animation:fadeUp .45s ease both;}
        @media(max-width:640px){
          .g2{grid-template-columns:1fr!important;}
          .g3{grid-template-columns:1fr!important;}
          .hero h1{font-size:26px!important;}
        }
      `}</style>

      {/* HEADER */}
      <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navy2})`,padding:"18px 28px",display:"flex",alignItems:"center",gap:14,boxShadow:"0 4px 20px rgba(15,39,68,.3)" }}>
        <div style={{ width:46,height:46,background:C.orange,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0 }}>🚛</div>
        <div>
          <div style={{ color:"white",fontFamily:"'Barlow Condensed',sans-serif",fontSize:24,fontWeight:800,letterSpacing:1 }}>CARGAPRO</div>
          <div style={{ color:"#94a3b8",fontSize:11,letterSpacing:2,textTransform:"uppercase" }}>Análise Técnica Gratuita · Consultor + IA</div>
        </div>
        <div style={{ marginLeft:"auto",textAlign:"right" }}>
          <div style={{ color:C.orange,fontWeight:700,fontSize:13 }}>📞 (47) 99942-8938</div>
          <div style={{ color:"#94a3b8",fontSize:11 }}>cargapro.com.br</div>
        </div>
      </div>

      <div style={{ maxWidth:800,margin:"0 auto",padding:"32px 16px" }}>

        {/* HERO */}
        {step===0 && (
          <div className="fu hero" style={{ textAlign:"center",marginBottom:32 }}>
            <div style={{ display:"inline-block",background:C.orangeLt,borderRadius:100,padding:"5px 18px",marginBottom:14 }}>
              <span style={{ fontSize:12,fontWeight:700,color:"#c2410c",letterSpacing:1,textTransform:"uppercase" }}>✦ Análise gratuita · Sem compromisso</span>
            </div>
            <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif",fontSize:34,fontWeight:800,color:C.navy,lineHeight:1.15,marginBottom:14 }}>
              Consultor técnico + IA revisando<br/>
              <span style={{ color:C.orange }}>cobertura e reduzindo seu custo.</span>
            </h1>
            <p style={{ fontSize:15,color:C.gray,maxWidth:560,margin:"0 auto",lineHeight:1.8 }}>
              Preencha os dados da operação, envie sua apólice e a última fatura. Identificamos riscos, gaps de cobertura e onde você está pagando mais do que deveria.
            </p>
            <div className="g3" style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginTop:28,textAlign:"left" }}>
              {[
                { icon:"🔍", title:"Revisão Técnica", desc:"Consultor experiente + IA analisam cada cláusula da sua apólice" },
                { icon:"💰", title:"Redução de Custo", desc:"Otimizamos sua taxa de averbação sem abrir mão da proteção" },
                { icon:"📋", title:"Plano de Ação", desc:"Relatório claro com prioridades e próximos passos" },
              ].map((p,i) => (
                <div key={i} style={{ background:"white",borderRadius:10,border:`1px solid ${C.grayBd}`,padding:"16px 18px" }}>
                  <div style={{ fontSize:22,marginBottom:8 }}>{p.icon}</div>
                  <div style={{ fontWeight:700,fontSize:13,color:C.dark,marginBottom:5 }}>{p.title}</div>
                  <div style={{ fontSize:12,color:C.gray,lineHeight:1.6 }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <StepBar current={step}/>

        {/* ── STEP 0: FORMULÁRIO ─────────────────────────────── */}
        {step===0 && (
          <div className="fu card">
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:800,color:C.navy,marginBottom:16,letterSpacing:.5 }}>📋 DADOS DA OPERAÇÃO</div>
            <div style={{ background:C.grayLt,borderRadius:7,padding:"9px 14px",marginBottom:14,borderLeft:`3px solid ${C.orange}`,fontSize:11,fontWeight:700,color:C.dark,textTransform:"uppercase",letterSpacing:.5 }}>Contato</div>
            <div className="g2" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20 }}>
              <Field label="Seu Nome" value={form.nome} onChange={fld("nome")} placeholder="João Silva" required half/>
              <Field label="E-mail" value={form.email} onChange={fld("email")} placeholder="joao@empresa.com.br" required type="email" half/>
              <Field label="WhatsApp" value={form.telefone} onChange={fld("telefone")} placeholder="(47) 99999-9999" required half/>
              <Field label="Transportadora" value={form.empresa} onChange={fld("empresa")} placeholder="Razão social ou nome fantasia" required half/>
              <Field label="CNPJ" value={form.cnpj} onChange={fld("cnpj")} placeholder="00.000.000/0001-00" half/>
              <Field label="Frota" value={form.frota} onChange={fld("frota")} placeholder="Ex: 15 carretas próprias + agregados" half/>
            </div>
            <div style={{ background:C.grayLt,borderRadius:7,padding:"9px 14px",marginBottom:14,borderLeft:`3px solid ${C.orange}`,fontSize:11,fontWeight:700,color:C.dark,textTransform:"uppercase",letterSpacing:.5 }}>Operação e Seguro Atual</div>
            <div className="g2" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
              <Field label="Rotas principais" value={form.rotas} onChange={fld("rotas")} placeholder="Ex: SC → SP, PR → RJ, Sul-Sudeste" required textarea/>
              <Field label="Tipo de carga" value={form.cargas} onChange={fld("cargas")} placeholder="Ex: Eletrônicos, alimentos, carga geral" required textarea/>
              <Field label="Valor médio de carga por viagem" value={form.valor_medio} onChange={fld("valor_medio")} placeholder="Ex: R$ 200.000" half hint="Base para análise da taxa de averbação e exposição de risco"/>
              <Field label="Seguradora atual" value={form.seguradora} onChange={fld("seguradora")} placeholder="Ex: HDI, Tokio Marine, Zurich..." half/>
              <Field label="Média de viagens por mês" value={form.viagens_mes} onChange={fld("viagens_mes")} placeholder="Ex: 45 viagens/mês" half hint="Usado para estimar o volume total averbado e oportunidades de negociação"/>
              <Field label="Valor máximo transportado em uma única viagem" value={form.valor_maximo} onChange={fld("valor_maximo")} placeholder="Ex: R$ 800.000" half hint="Determina o limite de cobertura necessário e exposição de risco máxima"/>
              <Field label="Coberturas atuais" value={form.coberturas} onChange={fld("coberturas")} placeholder="Ex: RCTR-C básico — sem RC-DC" required textarea hint="Descreva o que souber — a apólice nos ajuda a detalhar"/>
              <Field label="Sinistros nos últimos 2 anos" value={form.sinistros} onChange={fld("sinistros")} placeholder="Ex: 1 acidente leve em 2023, sem roubo" textarea/>
              <Field label="Observações sobre a operação" value={form.obs} onChange={fld("obs")} placeholder="Rotas críticas, cargas especiais, sazonalidade, frota própria x agregados..." textarea/>
            </div>
            {erro && <div style={{ background:C.redLt,border:`1px solid ${C.red}`,borderRadius:8,padding:"11px 14px",color:C.redDk,fontSize:13,marginTop:14 }}>⚠️ {erro}</div>}
            <div style={{ marginTop:22,display:"flex",justifyContent:"flex-end" }}>
              <button className="btn btn-p" style={{ padding:"15px 42px",fontSize:16 }} onClick={()=>{ if(validate1()) setStep(1); }}>
                Próximo — Enviar Documentos →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1: DOCUMENTOS ─────────────────────────────── */}
        {step===1 && (
          <div className="fu card">
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif",fontSize:17,fontWeight:800,color:C.navy,marginBottom:6 }}>📎 DOCUMENTOS PARA ANÁLISE</div>
            <p style={{ fontSize:13,color:C.gray,marginBottom:22,lineHeight:1.65 }}>
              Quanto mais documentos, mais precisa a análise. Você pode avançar sem eles — usaremos os dados preenchidos.
            </p>
            <div className="g2" style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,marginBottom:24 }}>
              <UploadZone
                label="Apólice de Seguro" hint="Apólice atual, endosso ou condições gerais em PDF"
                icon="📋" accentColor={C.orange} files={apolices}
                onAdd={fs=>setApolices(p=>[...p,...fs].slice(0,5))}
                onRemove={i=>setApolices(p=>p.filter((_,j)=>j!==i))}
              />
              <UploadZone
                label="Última Fatura" badge="Essencial para análise de custo"
                hint="Fatura mensal ou extrato de averbações — usamos para identificar oportunidades reais de redução"
                icon="🧾" accentColor={C.navy} files={faturas}
                onAdd={fs=>setFaturas(p=>[...p,...fs].slice(0,5))}
                onRemove={i=>setFaturas(p=>p.filter((_,j)=>j!==i))}
              />
            </div>
            <div style={{ background:C.orangeLt,borderRadius:10,padding:"14px 18px",fontSize:13,color:"#7c3d00",marginBottom:22,lineHeight:1.65 }}>
              <b>📧 O que acontece depois:</b> o consultor CargaPro recebe imediatamente o relatório, os dados da operação e os documentos. Em até 24h você terá um retorno com proposta personalizada de cobertura e custo.
            </div>
            {erro && <div style={{ background:C.redLt,border:`1px solid ${C.red}`,borderRadius:8,padding:"11px 14px",color:C.redDk,fontSize:13,marginBottom:14 }}>⚠️ {erro}</div>}
            <div style={{ display:"flex",gap:12,justifyContent:"space-between",flexWrap:"wrap" }}>
              <button className="btn btn-o" style={{ padding:"13px 28px",fontSize:15 }} onClick={()=>setStep(0)}>← Voltar</button>
              <button className="btn btn-p" style={{ padding:"15px 40px",fontSize:16 }} onClick={handleAnalyze}>🔍 Iniciar Análise Técnica</button>
            </div>
          </div>
        )}

        {/* ── STEP 2: LOADING ────────────────────────────────── */}
        {step===2 && (
          <div className="fu card" style={{ textAlign:"center",padding:"56px 28px" }}>
            <div style={{ width:68,height:68,borderRadius:"50%",border:`5px solid ${C.grayBd}`,borderTopColor:C.orange,animation:"spin 1s linear infinite",margin:"0 auto 28px" }}/>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif",fontSize:22,fontWeight:800,color:C.navy,marginBottom:10 }}>Consultor + IA analisando sua operação...</div>
            <div style={{ fontSize:14,color:C.gray,marginBottom:30 }}>{loadMsg}</div>
            <div style={{ display:"flex",flexDirection:"column",gap:10,maxWidth:420,margin:"0 auto",textAlign:"left" }}>
              {["Lendo apólice e fatura enviadas","Cruzando coberturas com rotas e tipo de carga","Identificando riscos com soluções práticas","Calculando oportunidades de redução de custo","Montando plano de ação priorizado","Gerando relatório Word completo","Notificando consultor CargaPro"].map((t,i) => (
                <div key={i} style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:7,height:7,borderRadius:"50%",background:C.orange,flexShrink:0 }}/>
                  <span style={{ fontSize:13,color:C.dark }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 3: RESULTADO ──────────────────────────────── */}
        {step===3 && resultado && (
          <div className="fu">
            {/* Status bar */}
            <div style={{ display:"flex",gap:10,marginBottom:18,flexWrap:"wrap" }}>
              {[
                { icon:"✅", title:"Relatório Word baixado", sub:"Download automático realizado", ok:true },
                { icon:emailStatus==="sent"?"📧":emailStatus==="error"?"⚠️":"⏳", title:"Consultor CargaPro", sub:emailStatus==="sent"?"Notificado — retorno em até 24h":emailStatus==="error"?"Configure o EmailJS para ativar":"Notificando...", ok:emailStatus==="sent", err:emailStatus==="error" },
              ].map((s,i) => (
                <div key={i} style={{ flex:1,minWidth:200,background:"white",borderRadius:10,border:`1px solid ${s.ok?C.green:s.err?C.red:C.grayBd}`,padding:"12px 16px",display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontSize:20 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontWeight:700,fontSize:13,color:C.dark }}>{s.title}</div>
                    <div style={{ fontSize:11,color:s.ok?C.greenDk:s.err?C.redDk:C.gray }}>{s.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {emailStatus==="error" && (
              <div style={{ background:"#fef9c3",border:"1px solid #fde047",borderRadius:10,padding:"12px 16px",marginBottom:14,fontSize:12,color:"#713f12",lineHeight:1.6 }}>
                <b>⚙️ Ativar envio automático:</b> crie conta em <b>emailjs.com</b> → Add Email Service → Create Template, e preencha as constantes <code>EJS_SERVICE_ID</code>, <code>EJS_TEMPLATE_ID</code> e <code>EJS_PUBLIC_KEY</code> no topo do arquivo <code>src/App.jsx</code>.
              </div>
            )}

            <div className="card" style={{ marginBottom:16 }}>
              {/* Header */}
              <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navy2})`,borderRadius:10,padding:"20px 24px",marginBottom:22,display:"flex",alignItems:"center",gap:20,flexWrap:"wrap" }}>
                <ScoreMeter score={resultado.score_protecao}/>
                <div style={{ flex:1,minWidth:180 }}>
                  <div style={{ fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"#94a3b8",marginBottom:4 }}>Análise Técnica — Consultor + IA</div>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif",fontSize:21,fontWeight:800,color:"white",marginBottom:6 }}>{form.empresa}</div>
                  <div style={{ fontSize:13,color:"#cbd5e1",lineHeight:1.65 }}>{resultado.resumo_executivo}</div>
                </div>
              </div>

              {resultado.pontos_positivos?.length>0 && (<>
                <SecTitle icon="✅" label="O que está funcionando bem" color={C.greenDk}/>
                {resultado.pontos_positivos.map((p,i) => (
                  <div key={i} style={{ borderLeft:`4px solid ${C.green}`,background:C.greenLt,borderRadius:"0 8px 8px 0",padding:"10px 14px",marginBottom:8 }}>
                    <div style={{ fontWeight:700,fontSize:13,color:C.greenDk }}>{p.item}</div>
                    <div style={{ fontSize:12,color:C.gray,marginTop:3,lineHeight:1.6 }}>{p.detalhe}</div>
                  </div>
                ))}
                <Hr/>
              </>)}

              {resultado.riscos_e_solucoes?.length>0 && (<>
                <SecTitle icon="⚠️" label="Riscos Identificados — com Soluções" color="#92400e"/>
                {resultado.riscos_e_solucoes.map((r,i) => (
                  <div key={i} style={{ display:"flex",gap:0,borderRadius:8,overflow:"hidden",marginBottom:10,border:`1px solid ${C.grayBd}` }}>
                    <div style={{ width:46,background:NIVEL_C[r.nivel],display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                      <span style={{ color:"white",fontWeight:800,fontSize:8,textAlign:"center",lineHeight:1.3,padding:4 }}>{r.nivel}</span>
                    </div>
                    <div style={{ background:NIVEL_BG[r.nivel],padding:"10px 14px",flex:1 }}>
                      <div style={{ fontWeight:700,fontSize:13,color:C.dark,marginBottom:5 }}>{r.risco}</div>
                      <div style={{ fontSize:12,color:C.gray,marginBottom:6 }}><b>Impacto:</b> {r.impacto}</div>
                      <div style={{ fontSize:12,color:C.navy,background:"rgba(255,255,255,.65)",borderRadius:6,padding:"6px 10px" }}><b>💡 Solução:</b> {r.solucao}</div>
                    </div>
                  </div>
                ))}
                <Hr/>
              </>)}

              {resultado.oportunidades_reducao_custo?.length>0 && (<>
                <SecTitle icon="💰" label="Oportunidades de Redução de Custo" color="#065f46"/>
                {resultado.oportunidades_reducao_custo.map((e,i) => (
                  <div key={i} style={{ display:"flex",gap:0,borderRadius:8,overflow:"hidden",marginBottom:10,border:`1px solid ${C.grayBd}` }}>
                    <div style={{ flex:1,background:C.grayLt,padding:"10px 14px" }}>
                      <div style={{ fontWeight:700,fontSize:13,color:C.dark,marginBottom:4 }}>{e.oportunidade}</div>
                      <div style={{ fontSize:12,color:C.gray,lineHeight:1.6 }}>{e.como}</div>
                    </div>
                    <div style={{ background:C.orangeLt,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"center",minWidth:110 }}>
                      <span style={{ fontWeight:800,fontSize:12,color:"#c2410c",textAlign:"center" }}>{e.estimativa}</span>
                    </div>
                  </div>
                ))}
                <Hr/>
              </>)}

              {resultado.plano_de_acao?.length>0 && (<>
                <SecTitle icon="📋" label="Plano de Ação" color={C.navy}/>
                {resultado.plano_de_acao.map((a,i) => (
                  <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:10,borderRadius:8,padding:"10px 14px",marginBottom:8,background:PRIOR_BG[a.prioridade],border:`1px solid ${C.grayBd}`,borderLeft:`4px solid ${PRIOR_C[a.prioridade]}` }}>
                    <span style={{ fontSize:9,fontWeight:800,color:"white",background:PRIOR_C[a.prioridade],borderRadius:5,padding:"2px 8px",whiteSpace:"nowrap",flexShrink:0,marginTop:2 }}>{a.prioridade.replace(/_/g," ")}</span>
                    <span style={{ fontSize:13,color:C.dark,lineHeight:1.6 }}>{a.acao}</span>
                  </div>
                ))}
                <Hr/>
              </>)}

              {/* Nota do consultor */}
              <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navy2})`,borderRadius:12,padding:"22px 26px" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
                  <span style={{ fontSize:20 }}>🚛</span>
                  <span style={{ fontFamily:"'Barlow Condensed',sans-serif",fontSize:14,fontWeight:800,color:C.orange,letterSpacing:1,textTransform:"uppercase" }}>Nota do Consultor CargaPro</span>
                </div>
                <p style={{ fontSize:13,color:"#e2e8f0",lineHeight:1.85,margin:0 }}>{resultado.recomendacao_consultoria}</p>
                <div style={{ marginTop:18,paddingTop:14,borderTop:`1px solid ${C.navy2}`,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8,alignItems:"center" }}>
                  <div style={{ fontSize:12,color:"#94a3b8" }}>Retorno em até 24h com proposta personalizada</div>
                  <div style={{ fontWeight:700,color:C.orange,fontSize:13 }}>📞 (47) 99942-8938</div>
                </div>
              </div>
            </div>

            <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
              <button className="btn btn-o" style={{ flex:1,padding:"14px",fontSize:15 }} onClick={resetAll}>+ Nova Análise</button>
              <button className="btn btn-p" style={{ flex:1,padding:"14px",fontSize:15 }} onClick={()=>{
                const blob=new Blob([generateWordHtml(form,resultado)],{type:"application/msword"});
                const url=URL.createObjectURL(blob); const a=document.createElement("a");
                a.href=url; a.download=`CargaPro_Analise_${form.empresa.replace(/\s+/g,"_")}.doc`; a.click(); URL.revokeObjectURL(url);
              }}>⬇️ Baixar Relatório Word</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
