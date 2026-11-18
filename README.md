<div align="center">

# ✨ Convite Digital & Console Administrativo — 15 Anos | Bianca Franco

**Experiência interativa *Uma Noite de Conto de Fadas* com design *iOS Liquid Glass*, papelaria artesanal *deckled edge*, jardim encantado interativo, confirmação de presença no Supabase e painel administrativo completo com impressão/PDF e estúdio de cartão digital.**

[![Convite Online](https://img.shields.io/badge/Convite_Público-biancafranco15.vercel.app-9875c4?style=for-the-badge&logo=vercel&logoColor=white)](https://biancafranco15.vercel.app/)
[![Painel Admin](https://img.shields.io/badge/Painel_Admin-%23admin-6e4f99?style=for-the-badge&logo=supabase&logoColor=white)](https://biancafranco15.vercel.app/#admin)

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-0055FF?style=flat-square&logo=framer&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%2B_RLS-3FCF8E?style=flat-square&logo=supabase&logoColor=white)

</div>

---

## 📌 Visão Geral do Projeto

Projeto full-stack de convite digital para festa de debutante (**Bianca Franco — 15 Anos**), pensado prioritariamente para abertura pelo **WhatsApp no celular** e equipado com um **Console Administrativo** protegido por autenticação e Row Level Security (RLS).

| Ambiente | URL |
|---|---|
| **Convite Público (para convidados)** | https://biancafranco15.vercel.app/ |
| **Painel Administrativo (restrito)** | https://biancafranco15.vercel.app/#admin *(ou `/admin`)* |
| **Repositório GitHub** | https://github.com/geanlogoff-spec/biancafranco15 |

---

## Parte 1 — Guia Rápido para o Cliente e Organização

### 🌸 1. Experiência dos Convidados (Convite Público)

O convite conduz o convidado por **7 cenas contínuas** (*One-Page Scrolling*), com barra de progresso no topo, pílula de etapa estilo *Dynamic Island*, botão guiado **"Continuar: [Próxima Seção] ↓"** e menu lateral de navegação com véu fosco legível mesmo em navegadores mobile que limitam `backdrop-filter` (como o Brave):

1. **Portal Encantado (`Scene1Portal`):** Cartão de papelaria artesanal *deckled edge* em *iOS Liquid Glass* com coroa dourada, flores desabrochando, borboletas e abertura cinematográfica ao tocar em **"ABRIR MEU CONVITE"**.
2. **Apresentação da Debutante (`Scene2Debutante`):** Numeral **15** em destaque dourado animado, nome manuscrito letra a letra (*Great Vibes*) e ilustração oficial da princesa (`/images/princesa.jpg`) em moldura em arco rodeada de rosas.
3. **Envelope Real & Carta do Convite (`Scene3Invitation`):** Envelope em vidro lavanda com abas chanfradas e **lacre de cera dourada `15`** que se abre em 3D revelando a carta com marca d'água e assinatura da debutante (com opção para fechar o envelope novamente).
4. **Data, Horário & Contagem Regressiva (`Scene4DateTime`):** Cartão oficial da data, cronômetro ao vivo (dias, horas, minutos e segundos) e botão **"SALVAR NA AGENDA"** integrado ao Google Agenda.
5. **Local da Festa (`Scene5Location`):** Endereço completo, mapa interativo incorporado do Google Maps e botões **"COMO CHEGAR"** (rota GPS) e **"VER NO MAPA"**.
6. **Pistas da Fada Madrinha (`SceneGiftHints`):** Sugestões divididas em **5 capítulos** (`Pista I` a `Pista V`), tabela visual de tamanhos (**Calçados `37`**, **Blusas & Vestidos `M / Único`**, **Calça `36`**) e botão **"Copiar colinha de tamanhos"**.
7. **Confirmação de Presença (`Scene6Rsvp`) & Encerramento (`Scene7Closing`):** Formulário com campos de alto contraste, validação de nome completo e WhatsApp, gravação real no Supabase, jardim final com botão **"VOLTAR AO INÍCIO"** e botão discreto **"Acesso Admin"** no rodapé.

---

### 🛡️ 2. Como Usar o Painel Administrativo (`#admin`)

Ao acessar `https://biancafranco15.vercel.app/#admin`, o administrador encontra uma tela de login com **Jardim Encantado interativo** (borboletas que seguem o ponteiro/toque e flores que brotam e desabrocham em resposta ao movimento). Após entrar com e-mail e senha cadastrados no Supabase Auth, o painel abre com 3 abas principais:

#### 📊 Aba 1 — Visão Geral
- **Banner com Cronômetro Técnico:** Contagem regressiva ao vivo até o evento, botão **Imprimir / PDF Visão Geral** (gera relatório executivo A4 pronto para impressão ou PDF) e botão **Exportar CSV**.
- **4 KPIs em Tempo Real:** *Confirmados (Sim)*, *Não Comparecerão*, *Taxa de Presença* e *Total de Respostas*.
- **Composição & Telemetria:** Barras de distribuição percentual e painel de saúde da conexão Supabase (*Latência REST*, *Segurança RLS*, tabela e última sincronização).
- **Atalhos Rápidos:** Acesso direto à impressão da **Lista Oficial em PDF**, à aba de **Confirmações** e ao estúdio **Convite, PDF & WhatsApp**.

#### 📋 Aba 2 — Confirmações
- **Lista Completa Escalável:** Busca instantânea por nome ou telefone (`useDeferredValue`), filtro por status (*Todos*, *Confirmados*, *Não poderão ir*) e paginação na tela (`25`, `50` ou `100` registros por página) para manter fluidez total mesmo com mais de **1.000 convidados**.
- **Ações Diretas:** Link clicável para chamar o convidado no **WhatsApp**, criação manual (**Nova Confirmação**), edição e exclusão com confirmação modal (formato *Bottom-Sheet* no celular).
- **Exportações:**
  - **Imprimir / PDF:** Gera a **Lista Oficial de Convidados em A4** com caixinha de **Check-in** para controle na portaria/recepção, alternância entre **Ordem Alfabética (A–Z)** ou **Mais recentes** e filtro rápido na pré-visualização.
  - **CSV:** Baixa todos os registros filtrados em planilha compatível com Excel e Google Planilhas.

#### 💌 Aba 3 — Convite, PDF & WhatsApp
- **Estúdio de Cartão Digital Personalizado:**
  - Gera em tempo real no navegador o **Cartão Oficial do Convite** em alta resolução (`1080 × 1620 px`), com opção de exibir a **Foto da Princesa** ou o **Brasão Clássico (15)** e personalização automática com o nome do convidado (`CONVITE ESPECIAL PARA: ...`).
  - **Download em PDF Interativo:** PDF 1.4 gerado localmente contendo botões clicáveis reais (`/Subtype /Link`) para abrir o convite na web e a localização no Google Maps.
  - **Download & Compartilhamento em Imagem (PNG):** Botão para baixar a imagem, copiar a imagem direto para colar no WhatsApp Web (`Ctrl+V` via `ClipboardItem`) ou enviar no WhatsApp pelo compartilhamento nativo do celular.
- **Mensagens Prontas para WhatsApp:** 3 modelos personalizáveis com substituição automática de `{convidado}` e `{link}`, salvamento em `localStorage`, cópia rápida ou envio direto.

---

## Parte 2 — Arquitetura, Design System & Engenharia

### 📅 Dados do Evento Configurados (`src/config/invitation.config.ts`)

| Parâmetro | Valor Atual |
|---|---|
| **Debutante** | Bianca Franco |
| **Data e Horário** | Sexta-feira, 15 de janeiro de 2027 · `19h30` (`America/Rio_Branco`) |
| **Endereço** | R. do Amazonas, 2225 – São José, Cruzeiro do Sul – AC (`CEP 69980-000`) |
| **Link do Mapa** | https://maps.app.goo.gl/c8gyLdGMQLSDT1A66 |
| **Tabela Supabase** | `rsvps_bianca15` |

---

### 🎨 Design System (*iOS Liquid Glass* & Papelaria Real)

- **Glassmorphism estilo iOS:** Camadas translúcidas com bordas especulares internas, sombras coloridas em lavanda/ameixa (`.glass-card`, `.ios-glass-pill`, `.admin-panel-card`, `.kpi-card`) e barra superior fixa com faixa protetora e alta opacidade (`.admin-navbar`, `.section-menu-panel`) para leitura nítida em qualquer navegador mobile.
- **Fundo Encantado (`EnchantedLoginGarden`):**
  - No **Login Administrativo**: física contínua com 6 borboletas orbitando o ponteiro/toque e flores SVG germinando espontaneamente ou ao clicar.
  - Na **Dashboard Administrativa**: `staticMode` elegante com a mesma aquarela lavanda, rosas, trepadeiras e borboletas estáticas para máximo foco e leitura dos dados.
- **Tipografia:** `Great Vibes` (assinaturas manuscritas), `Playfair Display` (numerais), `Cormorant Garamond` (textos literários), `Geist` e `Geist Mono`.

---

### ⚡ Otimizações de Performance e Escalabilidade

- **Paginação Completa no Banco (`fetchRsvps`):** Consulta paginada via `.range()` em blocos de 1.000 registros com ordenação determinística (`created_at DESC`, `id DESC`), superando o limite padrão de 1.000 linhas por requisição do PostgREST/Supabase.
- **Renderização Eficiente na Dashboard:** Paginação client-side (`25 / 50 / 100` itens por página), busca adiada (`useDeferredValue`) e renderização exclusiva por viewport (`matchMedia`), evitando montar tabela desktop e cards mobile simultaneamente no DOM.
- **Isolamento de Re-renders:** Cronômetro regressivo isolado no subcomponente `<AdminCountdownDigits />` (o tick de 1s não re-renderiza abas, listas ou fundo), formatadores `Intl.DateTimeFormat` em instância única e `React.memo` no jardim de fundo.
- **Animações Sob Demanda (`useInView`):** `Sparkles` e `ButterflySwarm` pausam automaticamente loops infinitos quando a cena sai da área visível e respeitam `prefers-reduced-motion`.
- **Code-Splitting & Chunks:** `AdminLogin` e `AdminDashboard` carregam sob demanda via `React.lazy` + `<Suspense>` (visitantes do convite público não baixam o código administrativo nem os geradores de PDF/relatórios), com divisão de vendors no `vite.config.ts` (`vendor-react`, `vendor-motion`, `vendor-supabase`).

---

### 🗂️ Estrutura do Projeto

```text
biancafranco15/
├── public/
│   ├── images/princesa.jpg          # Ilustração/foto principal da debutante
│   ├── llms.txt                     # Contexto estruturado para IAs (GEO)
│   ├── robots.txt                   # Indexação pública (bloqueia /admin)
│   └── sitemap.xml                  # Mapa do site para buscadores
├── src/
│   ├── config/
│   │   └── invitation.config.ts     # Arquivo único de personalização do evento
│   ├── lib/
│   │   ├── adminPrintReports.ts     # Relatórios A4 para impressão / PDF (Visão Geral & Lista)
│   │   ├── date.ts                  # Formatação de data/fuso horário e hook useCountdown
│   │   ├── inviteCardGenerator.ts   # Gerador Canvas 1080x1620 + PDF 1.4 com links clicáveis
│   │   └── supabase.ts              # Cliente Supabase, Auth admin, paginação RSVP e validação
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.tsx   # Console administrativo completo (3 abas)
│   │   │   ├── AdminLogin.tsx       # Tela de login com vidro iOS e jardim interativo
│   │   │   ├── EnchantedLoginGarden.tsx # Fundo animado (login) e estático (dashboard)
│   │   │   └── InviteSharePanel.tsx # Estúdio PDF/PNG e mensagens WhatsApp
│   │   ├── decorative/              # BloomingRose, Butterfly, OrnateFrame, PaperDeckled, Sparkles
│   │   ├── scenes/                  # Scene1Portal até Scene7Closing + SceneGiftHints
│   │   ├── FloatingControls.tsx     # Menu lateral de seções, música e voltar ao topo
│   │   ├── JourneyGuide.tsx         # Barra de progresso superior e guia inferior
│   │   └── Scene.tsx                # Container de cena com parallax e Reveal
│   ├── App.tsx                      # Roteamento convite/#admin com React.lazy
│   └── index.css                    # Tokens CSS, tema Tailwind v4 e classes Liquid Glass
├── index.html                       # Meta tags, Open Graph, Twitter Cards e JSON-LD
├── APRESENTACAO_ENTREGA.md          # Documento espelho de entrega ao cliente
└── vite.config.ts                   # Vite + Tailwind v4 + manualChunks
```

---

### 🔐 Segurança & SEO / GEO

- **Autenticação & Banco Isolado:** Validação de sessão administrativa na tabela `admins_bianca15` via Supabase Auth e políticas de **Row Level Security (RLS)** na tabela `rsvps_bianca15` (visitantes públicos têm permissão apenas para envio de confirmação; leitura, edição e exclusão exigem administrador autenticado).
- **SEO & GEO:** Metadados Open Graph para prévia rica no WhatsApp, dados estruturados `JSON-LD` (`Event` e `FAQPage`) em `index.html`, `robots.txt`, `sitemap.xml` e `llms.txt`.

---

### 🚀 Como Executar Localmente

1. **Instale as dependências:**
   ```bash
   npm install
   ```
2. **Configure as variáveis de ambiente** no arquivo `.env` na raiz:
   ```env
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_publicavel_anon
   ```
3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
4. **Gere o build de produção (TypeScript + Vite):**
   ```bash
   npm run build
   ```
