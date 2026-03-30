# CargaPro — Análise Técnica com IA

Site de diagnóstico gratuito de seguros de carga para transportadoras.

---

## 🚀 Deploy no Vercel (5 minutos)

### Opção A — Via GitHub (recomendado)

1. Crie uma conta em github.com (gratuito)
2. Crie um novo repositório chamado `cargapro-diagnostico`
3. Faça upload de todos os arquivos desta pasta
4. Acesse vercel.com e clique em "Add New Project"
5. Conecte ao GitHub e selecione o repositório
6. Clique em "Deploy" — pronto!

### Opção B — Via Vercel CLI

```bash
npm install -g vercel
cd cargapro-vercel
vercel
```

---

## ⚙️ Configurar o EmailJS (envio automático)

Abra o arquivo `src/App.jsx` e preencha as 3 constantes no topo:

```js
const EJS_SERVICE_ID  = "service_XXXXXXX";   // emailjs.com → Email Services
const EJS_TEMPLATE_ID = "template_XXXXXXX";  // emailjs.com → Email Templates
const EJS_PUBLIC_KEY  = "XXXXXXXXXXXXXXX";   // emailjs.com → Account → API Keys
```

**Template sugerido no EmailJS:**
- To Email: {{to_email}}
- Subject: Nova Análise Técnica — {{empresa}} (Score: {{score}}/100)
- Body: {{body}}

---

## 🌐 Embedar no Wix

Após o deploy, você terá uma URL como `https://cargapro-diagnostico.vercel.app`

No editor do Wix:
1. Clique em "+" → Embed → HTML iFrame
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
├── src/
│   ├── main.jsx       # Entry point React
│   └── App.jsx        # Aplicação completa
├── public/
│   └── favicon.svg    # Ícone da CargaPro
├── index.html         # HTML base
├── package.json       # Dependências
├── vite.config.js     # Config do Vite
└── vercel.json        # Config do Vercel
```

---

## 📞 Suporte

CargaPro · (47) 99942-8938 · minatti@cargapro.com.br · cargapro.com.br
