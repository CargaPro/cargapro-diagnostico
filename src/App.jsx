import { useState, useRef } from "react";

// ══════════════════════════════════════════════════════════════════
//  EmailJS — credenciais já configuradas
// ══════════════════════════════════════════════════════════════════
const EJS_SERVICE_ID  = "service_5fs3ror";
const EJS_TEMPLATE_ID = "template_ezzxggh";
const EJS_PUBLIC_KEY  = "YaS19i6KzKLzHgm7m";
const DEST_EMAIL      = "minatti@cargapro.com.br";

// ── CORES ─────────────────────────────────────────────────────────
const C = {
  navy:"#0f2744", navy2:"#1e3a5f", orange:"#f97316",
  orangeLt:"#fff3e0", green:"#22c55e", greenLt:"#f0fdf4",
  greenDk:"#166534", red:"#ef4444", redLt:"#fef2f2",
  redDk:"#991b1b", gray:"#6b7280", grayLt:"#f8fafc",
  grayBd:"#e2e8f0", dark:"#1e293b",
};

// ── HELPERS ───────────────────────────────────────────────────────
const fmtDate = () => new Date().toLocaleDateString("pt-BR");

const readB64 = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result.split(",")[1]);
  r.onerror = rej;
  r.readAsDataURL(file);
});

// ── ENVIO EMAIL ───────────────────────────────────────────────────
const sendEmail = async (form, apolices, faturas) => {
  const body = `
NOVO LEAD — ${form.empresa}
Data: ${fmtDate()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTATO
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nome:       ${form.nome}
E-mail:     ${form.email}
WhatsApp:   ${form.telefone}
Empresa:    ${form.empresa}
CNPJ:       ${form.cnpj || "Não informado"}
Frota:      ${form.frota || "Não informado"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
OPERAÇÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Rotas:                      ${form.rotas}
Tipo de carga:              ${form.cargas}
Valor médio/viagem:         ${form.valor_medio || "Não informado"}
Média de viagens/mês:       ${form.viagens_mes || "Não informado"}
Valor máximo por viagem:    ${form.valor_maximo || "Não informado"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEGURO ATUAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Seguradora:                 ${form.seguradora || "Não informada"}
Coberturas atuais:          ${form.coberturas}
Sinistros (2 anos):         ${form.sinistros || "Não informado"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBSERVAÇÕES
━━━━━━━━━━━━━━━━━━━━━━━━━━━
${form.obs || "Nenhuma"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
DOCUMENTOS ENVIADOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Apólices: ${apolices.length ? apolices.map(f => f.name).join(", ") : "Nenhuma"}
Faturas:  ${faturas.length  ? faturas.map(f  => f.name).join(", ") : "Nenhuma"}
  `.trim();

  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id:   EJS_SERVICE_ID,
      template_id:  EJS_TEMPLATE_ID,
      user_id:      EJS_PUBLIC_KEY,
      template_params: {
        to_email:      DEST_EMAIL,
        empresa:       form.empresa,
        nome:          form.nome,
        email_cliente: form.email,
        telefone:      form.telefone,
        score:         "—",
        body,
      },
    }),
  });

  const responseText = await res.text();
  if (!res.ok) throw new Error(`EmailJS ${res.status}: ${responseText}`);
};

// ══════════════════════════════════════════════════════════════════
//  COMPONENTES
// ══════════════════════════════════════════════════════════════════
function StepBar({ current }) {
  const steps = ["Seus Dados", "Documentos", "Enviando", "Concluído"];
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", marginBottom:32 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
            <div style={{
              width:38, height:38, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:15,
              background: i < current ? C.green : i === current ? C.orange : C.grayBd,
              color: i <= current ? "white" : C.gray,
              transition:"all .3s",
              boxShadow: i === current ? `0 0 0 4px ${C.orangeLt}` : "none",
            }}>{i < current ? "✓" : i + 1}</div>
            <span style={{ fontSize:10, color:i===current?C.orange:C.gray, fontWeight:i===current?700:400, whiteSpace:"nowrap" }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ width:52, height:2, background:i<current?C.green:C.grayBd, margin:"0 4px", marginBottom:20, transition:"all .3s" }}/>
          )}
        </div>
      ))}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, required, type="text", textarea, half, hint }) {
  const base = { width:"100%", border:`1.5px solid ${C.grayBd}`, borderRadius:8, padding:"10px 13px", fontSize:14, color:C.dark, background:C.grayLt, fontFamily:"'Lato',sans-serif", outline:"none" };
  return (
    <div style={{ gridColumn: half ? "auto" : "1/-1" }}>
      <label style={{ display:"block", fontSize:11, fontWeight:700, color:C.gray, marginBottom:4, textTransform:"uppercase", letterSpacing:.5 }}>
        {label}{required && <span style={{ color:C.orange }}> *</span>}
      </label>
      {hint && <div style={{ fontSize:11, color:C.gray, marginBottom:5, fontStyle:"italic" }}>{hint}</div>}
      {textarea
        ? <textarea rows={2} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{...base, resize:"vertical"}}/>
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
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
        <span style={{ fontSize:12, fontWeight:700, color:C.dark, textTransform:"uppercase", letterSpacing:.5 }}>{label}</span>
        {badge && <span style={{ fontSize:10, fontWeight:700, background:C.orangeLt, color:"#c2410c", borderRadius:100, padding:"2px 8px" }}>{badge}</span>}
      </div>
      {hint && <div style={{ fontSize:12, color:C.gray, marginBottom:8, lineHeight:1.55 }}>{hint}</div>}
      <div
        onDrop={e=>{ e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
        onDragOver={e=>{ e.preventDefault(); setDrag(true); }}
        onDragLeave={()=>setDrag(false)}
        onClick={()=>ref.current.click()}
        style={{ border:`2px dashed ${drag ? accentColor : C.grayBd}`, borderRadius:10, padding:"22px 16px", textAlign:"center", cursor:"pointer", background:drag?"#fff8f0":C.grayLt, transition:"all .2s" }}>
        <div style={{ fontSize:26, marginBottom:6 }}>{icon}</div>
        <div style={{ fontWeight:700, fontSize:13, color:C.dark, marginBottom:2 }}>Arraste ou clique para selecionar</div>
        <div style={{ fontSize:11, color:C.gray }}>PDFs · máx. 5 arquivos</div>
        <input ref={ref} type="file" accept=".pdf" multiple style={{ display:"none" }} onChange={e=>add(e.target.files)}/>
      </div>
      {files.map((fi, i) => (
        <div key={i} style={{ display:"flex", alignItems:"center", gap:8, background:C.greenLt, border:`1px solid ${C.green}`, borderRadius:7, padding:"7px 12px", marginTop:6 }}>
          <span>✅</span>
          <span style={{ flex:1, fontSize:12, color:C.greenDk, fontWeight:700 }}>{fi.name}</span>
          <span style={{ fontSize:11, color:C.gray }}>{(fi.size/1024).toFixed(0)} KB</span>
          <button onClick={e=>{ e.stopPropagation(); onRemove(i); }} style={{ background:"none", border:"none", cursor:"pointer", color:C.red, fontSize:15 }}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  APP
// ══════════════════════════════════════════════════════════════════
export default function App() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    nome:"", email:"", telefone:"", empresa:"", cnpj:"",
    rotas:"", cargas:"", frota:"", valor_medio:"", viagens_mes:"",
    valor_maximo:"", coberturas:"", seguradora:"", sinistros:"", obs:"",
  });
  const [apolices, setApolices] = useState([]);
  const [faturas,  setFaturas]  = useState([]);
  const [erro, setErro]         = useState("");
  const fld = k => v => setForm(p => ({...p, [k]:v}));

  const validate = () => {
    if (!form.nome||!form.email||!form.empresa||!form.rotas||!form.cargas||!form.coberturas) {
      setErro("Preencha os campos obrigatórios marcados com *."); return false;
    }
    setErro(""); return true;
  };

  const handleSend = async () => {
    setStep(2);
    try {
      await sendEmail(form, apolices, faturas);
      setStep(3);
    } catch(e) {
      console.error(e);
      setErro(`Erro ao enviar: ${e.message}`);
      setStep(1);
    }
  };

  const resetAll = () => {
    setStep(0); setApolices([]); setFaturas([]); setErro("");
    setForm({ nome:"", email:"", telefone:"", empresa:"", cnpj:"", rotas:"", cargas:"", frota:"", valor_medio:"", viagens_mes:"", valor_maximo:"", coberturas:"", seguradora:"", sinistros:"", obs:"" });
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
        @media(max-width:640px){.g2{grid-template-columns:1fr!important;}.g3{grid-template-columns:1fr!important;}.hero h1{font-size:26px!important;}}
      `}</style>

      {/* HEADER */}
      <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navy2})`, padding:"18px 28px", display:"flex", alignItems:"center", gap:14, boxShadow:"0 4px 20px rgba(15,39,68,.3)" }}>
        <div style={{ width:46, height:46, background:C.orange, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>🚛</div>
        <div>
          <div style={{ color:"white", fontFamily:"'Barlow Condensed',sans-serif", fontSize:24, fontWeight:800, letterSpacing:1 }}>CARGAPRO</div>
          <div style={{ color:"#94a3b8", fontSize:11, letterSpacing:2, textTransform:"uppercase" }}>Análise Técnica Gratuita · Consultor + IA</div>
        </div>
        <div style={{ marginLeft:"auto", textAlign:"right" }}>
          <div style={{ color:C.orange, fontWeight:700, fontSize:13 }}>📞 (47) 99942-8938</div>
          <div style={{ color:"#94a3b8", fontSize:11 }}>cargapro.com.br</div>
        </div>
      </div>

      <div style={{ maxWidth:800, margin:"0 auto", padding:"32px 16px" }}>

        {/* HERO */}
        {step === 0 && (
          <div className="fu hero" style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ display:"inline-block", background:C.orangeLt, borderRadius:100, padding:"5px 18px", marginBottom:14 }}>
              <span style={{ fontSize:12, fontWeight:700, color:"#c2410c", letterSpacing:1, textTransform:"uppercase" }}>✦ Análise gratuita · Sem compromisso</span>
            </div>
            <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:34, fontWeight:800, color:C.navy, lineHeight:1.15, marginBottom:14 }}>
              Consultor técnico + IA revisando<br/>
              <span style={{ color:C.orange }}>cobertura e reduzindo seu custo.</span>
            </h1>
            <p style={{ fontSize:15, color:C.gray, maxWidth:560, margin:"0 auto", lineHeight:1.8 }}>
              Preencha os dados da operação, envie sua apólice e a última fatura. Nosso consultor analisa e retorna com um diagnóstico personalizado em até 24h.
            </p>
            <div className="g3" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginTop:28, textAlign:"left" }}>
              {[
                { icon:"📋", title:"Preencha o formulário", desc:"Dados da operação, rotas, tipo de carga e cobertura atual" },
                { icon:"📎", title:"Envie os documentos", desc:"Apólice e última fatura em PDF para análise completa" },
                { icon:"📧", title:"Receba o diagnóstico", desc:"Nosso consultor retorna em até 24h com análise e proposta" },
              ].map((p, i) => (
                <div key={i} style={{ background:"white", borderRadius:10, border:`1px solid ${C.grayBd}`, padding:"16px 18px" }}>
                  <div style={{ fontSize:22, marginBottom:8 }}>{p.icon}</div>
                  <div style={{ fontWeight:700, fontSize:13, color:C.dark, marginBottom:5 }}>{p.title}</div>
                  <div style={{ fontSize:12, color:C.gray, lineHeight:1.6 }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <StepBar current={step}/>

        {/* ── STEP 0: FORMULÁRIO ─────────────────────────────── */}
        {step === 0 && (
          <div className="fu card">
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:17, fontWeight:800, color:C.navy, marginBottom:16, letterSpacing:.5 }}>📋 DADOS DA OPERAÇÃO</div>

            <div style={{ background:C.grayLt, borderRadius:7, padding:"9px 14px", marginBottom:14, borderLeft:`3px solid ${C.orange}`, fontSize:11, fontWeight:700, color:C.dark, textTransform:"uppercase", letterSpacing:.5 }}>Contato</div>
            <div className="g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:20 }}>
              <Field label="Seu Nome"        value={form.nome}     onChange={fld("nome")}     placeholder="João Silva"                   required half/>
              <Field label="E-mail"          value={form.email}    onChange={fld("email")}    placeholder="joao@empresa.com.br"          required type="email" half/>
              <Field label="WhatsApp"        value={form.telefone} onChange={fld("telefone")} placeholder="(47) 99999-9999"              required half/>
              <Field label="Transportadora"  value={form.empresa}  onChange={fld("empresa")}  placeholder="Razão social ou nome fantasia" required half/>
              <Field label="CNPJ"            value={form.cnpj}     onChange={fld("cnpj")}     placeholder="00.000.000/0001-00"            half/>
              <Field label="Frota"           value={form.frota}    onChange={fld("frota")}    placeholder="Ex: 15 carretas próprias"      half/>
            </div>

            <div style={{ background:C.grayLt, borderRadius:7, padding:"9px 14px", marginBottom:14, borderLeft:`3px solid ${C.orange}`, fontSize:11, fontWeight:700, color:C.dark, textTransform:"uppercase", letterSpacing:.5 }}>Operação e Seguro Atual</div>
            <div className="g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Field label="Rotas principais"        value={form.rotas}         onChange={fld("rotas")}         placeholder="Ex: SC → SP, PR → RJ" required textarea/>
              <Field label="Tipo de carga"           value={form.cargas}        onChange={fld("cargas")}        placeholder="Ex: Eletrônicos, alimentos" required textarea/>
              <Field label="Valor médio por viagem"  value={form.valor_medio}   onChange={fld("valor_medio")}   placeholder="Ex: R$ 200.000" half hint="Base para análise da taxa de averbação"/>
              <Field label="Média de viagens/mês"    value={form.viagens_mes}   onChange={fld("viagens_mes")}   placeholder="Ex: 30 viagens/mês" half hint="Usado para estimar volume total averbado"/>
              <Field label="Valor máximo por viagem" value={form.valor_maximo}  onChange={fld("valor_maximo")}  placeholder="Ex: R$ 800.000" half hint="Determina o limite de cobertura necessário"/>
              <Field label="Seguradora atual"        value={form.seguradora}    onChange={fld("seguradora")}    placeholder="Ex: HDI, Tokio Marine..." half/>
              <Field label="Coberturas atuais"       value={form.coberturas}    onChange={fld("coberturas")}    placeholder="Ex: RCTR-C básico sem RC-DC" required textarea hint="Descreva o que souber — a apólice nos ajuda a detalhar"/>
              <Field label="Sinistros (2 anos)"      value={form.sinistros}     onChange={fld("sinistros")}     placeholder="Ex: 1 acidente leve em 2023" textarea/>
              <Field label="Observações"             value={form.obs}           onChange={fld("obs")}           placeholder="Rotas críticas, cargas especiais, sazonalidade..." textarea/>
            </div>

            {erro && <div style={{ background:C.redLt, border:`1px solid ${C.red}`, borderRadius:8, padding:"11px 14px", color:C.redDk, fontSize:13, marginTop:14 }}>⚠️ {erro}</div>}
            <div style={{ marginTop:22, display:"flex", justifyContent:"flex-end" }}>
              <button className="btn btn-p" style={{ padding:"15px 42px", fontSize:16 }} onClick={()=>{ if(validate()) setStep(1); }}>
                Próximo — Enviar Documentos →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 1: DOCUMENTOS ─────────────────────────────── */}
        {step === 1 && (
          <div className="fu card">
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:17, fontWeight:800, color:C.navy, marginBottom:6 }}>📎 DOCUMENTOS PARA ANÁLISE</div>
            <p style={{ fontSize:13, color:C.gray, marginBottom:22, lineHeight:1.65 }}>
              Quanto mais documentos, mais precisa a análise. Você pode avançar sem eles — usaremos os dados preenchidos.
            </p>

            <div className="g2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:24 }}>
              <UploadZone
                label="Apólice de Seguro"
                hint="Apólice atual, endosso ou condições gerais em PDF"
                icon="📋" accentColor={C.orange}
                files={apolices}
                onAdd={fs => setApolices(p => [...p,...fs].slice(0,5))}
                onRemove={i => setApolices(p => p.filter((_,j) => j!==i))}
              />
              <UploadZone
                label="Última Fatura"
                badge="Essencial para análise de custo"
                hint="Fatura mensal ou extrato de averbações — usamos para identificar oportunidades de redução"
                icon="🧾" accentColor={C.navy}
                files={faturas}
                onAdd={fs => setFaturas(p => [...p,...fs].slice(0,5))}
                onRemove={i => setFaturas(p => p.filter((_,j) => j!==i))}
              />
            </div>

            <div style={{ background:C.orangeLt, borderRadius:10, padding:"14px 18px", fontSize:13, color:"#7c3d00", marginBottom:22, lineHeight:1.65 }}>
              <b>📧 O que acontece depois:</b> seus dados e documentos chegam diretamente ao consultor CargaPro. Em até 24h você recebe um diagnóstico personalizado de cobertura e custo.
            </div>

            {erro && <div style={{ background:C.redLt, border:`1px solid ${C.red}`, borderRadius:8, padding:"11px 14px", color:C.redDk, fontSize:13, marginBottom:14 }}>⚠️ {erro}</div>}

            <div style={{ display:"flex", gap:12, justifyContent:"space-between", flexWrap:"wrap" }}>
              <button className="btn btn-o" style={{ padding:"13px 28px", fontSize:15 }} onClick={()=>setStep(0)}>← Voltar</button>
              <button className="btn btn-p" style={{ padding:"15px 40px", fontSize:16 }} onClick={handleSend}>
                📨 Enviar para CargaPro
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: ENVIANDO ───────────────────────────────── */}
        {step === 2 && (
          <div className="fu card" style={{ textAlign:"center", padding:"56px 28px" }}>
            <div style={{ width:68, height:68, borderRadius:"50%", border:`5px solid ${C.grayBd}`, borderTopColor:C.orange, animation:"spin 1s linear infinite", margin:"0 auto 28px" }}/>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, fontWeight:800, color:C.navy, marginBottom:10 }}>
              Enviando seus dados...
            </div>
            <div style={{ fontSize:14, color:C.gray }}>Aguarde um momento.</div>
          </div>
        )}

        {/* ── STEP 3: SUCESSO ────────────────────────────────── */}
        {step === 3 && (
          <div className="fu card" style={{ textAlign:"center", padding:"48px 28px" }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:C.greenLt, border:`3px solid ${C.green}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, margin:"0 auto 24px" }}>✅</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:26, fontWeight:800, color:C.navy, marginBottom:12 }}>
              Dados enviados com sucesso!
            </div>
            <p style={{ fontSize:15, color:C.gray, maxWidth:460, margin:"0 auto 20px", lineHeight:1.8 }}>
              O consultor CargaPro recebeu suas informações.<br/>
              <b style={{ color:C.dark }}>Retorno em até 24h</b> com diagnóstico e proposta personalizada.
            </p>
            <div style={{ background:"#fff3e0", border:"1px solid #f97316", borderRadius:10, padding:"14px 18px", maxWidth:460, margin:"0 auto 28px", textAlign:"left", fontSize:13, color:"#7c3d00", lineHeight:1.7 }}>
              <b>📎 Envie também os PDFs via WhatsApp:</b><br/>
              Para uma análise completa, encaminhe sua <b>apólice</b> e <b>última fatura</b> pelo WhatsApp abaixo. Nosso consultor já vai estar esperando!
            </div>

            {/* Resumo do que foi enviado */}
            <div style={{ background:C.grayLt, borderRadius:12, padding:"18px 22px", textAlign:"left", maxWidth:480, margin:"0 auto 28px", border:`1px solid ${C.grayBd}` }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.gray, textTransform:"uppercase", letterSpacing:.5, marginBottom:12 }}>Resumo do envio</div>
              {[
                ["Empresa",    form.empresa],
                ["Contato",    `${form.nome} · ${form.telefone}`],
                ["E-mail",     form.email],
                ["Rotas",      form.rotas],
                ["Carga",      form.cargas],
                ["Apólices",   apolices.length ? apolices.map(f=>f.name).join(", ") : "Não enviada"],
                ["Fatura",     faturas.length  ? faturas.map(f=>f.name).join(", ")  : "Não enviada"],
              ].map(([k, v], i) => (
                <div key={i} style={{ display:"flex", gap:10, padding:"6px 0", borderBottom:i<6?`1px solid ${C.grayBd}`:"none" }}>
                  <span style={{ fontSize:12, fontWeight:700, color:C.gray, minWidth:70 }}>{k}</span>
                  <span style={{ fontSize:12, color:C.dark, flex:1 }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
              <button className="btn btn-o" style={{ padding:"13px 28px", fontSize:15 }} onClick={resetAll}>
                + Nova Solicitação
              </button>
              <a href="https://wa.me/5547999428938" target="_blank" rel="noreferrer"
                style={{ display:"inline-block", background:`linear-gradient(135deg,#25d366,#128c7e)`, color:"white", borderRadius:9, padding:"13px 28px", fontSize:15, fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, letterSpacing:.5, textTransform:"uppercase", textDecoration:"none" }}>
                💬 Falar no WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
