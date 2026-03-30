# CargaPro — Análise Técnica com IA

Site de diagnóstico gratuito de seguros de carga para transportadoras.

---

## 🚀 Deploy no Vercel (5 minutos)

### Passo 1 — Subir no GitHub

1. Crie uma conta em github.com (gratuito)
2. Crie um novo repositório chamado `cargapro-diagnostico`
3. Faça upload de todos os arquivos desta pasta
4. Clique em **Commit changes**

### Passo 2 — Deploy no Vercel

1. Acesse vercel.com e clique em **Add New Project**
2. Conecte ao GitHub e selecione o repositório
3. Clique em **Deploy**

### Passo 3 — ⚠️ Configurar a chave da API (OBRIGATÓRIO)

Sem isso a análise não funciona:

1. No painel do Vercel, acesse seu projeto
2. Clique em **Settings → Environment Variables**
3. Clique em **Add New**
4. Preencha:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** sua chave da API (começa com `sk-ant-...`)
   - **Environment:** Production, Preview, Development (marque todos)
5. Clique em **Save**
6. Vá em **Deployments → Redeploy** para aplicar

> 💡 Para obter sua chave: acesse console.anthropic.com → API Keys → Create Key

---

## ⚙️ Configurar o EmailJS (envio automático)

As credenciais já estão configuradas no código. Se precisar trocar,
abra `src/App.jsx` e edite as constantes no topo:

```js
const EJS_SERVICE_ID  = "service_5fs3ror";
const EJS_TEMPLATE_ID = "template_dhkt3ur";
const EJS_PUBLIC_KEY  = "YaS19i6KzKLzHgm7m";
```

---

## 🌐 Embedar no Wix

Após o deploy, você terá uma URL como `https://cargapro-diagnostico.vercel.app`

No editor do Wix:
1. Clique em **"+" → Embed → HTML iFrame**
2. Cole o código abaixo (substitua pela sua URL):

```html
<iframe
  src="https://cargapro-diagnostico.vercel.app"
  width="100%"
  height="950px"
  frameborder="0"
  style="border-radius:12px;">
</iframe>
```

---

## 📁 Estrutura do Projeto

```
cargapro-vercel/
├── api/
│   └── analyze.js     # Função serverless — chama a API Anthropic com segurança
├── src/
│   ├── main.jsx       # Entry point React
│   └── App.jsx        # Aplicação completa
├── public/
│   └── favicon.svg
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

---

## 📞 Suporte

CargaPro · (47) 99942-8938 · minatti@cargapro.com.br · cargapro.com.br
