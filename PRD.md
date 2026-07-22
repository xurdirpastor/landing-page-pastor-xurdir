# PRD — Seja Livre

Landing page + área administrativa do Ministério Seja Livre (Pastor Xurdir). Este documento define o que construir e por quê; o "como" (stack, arquitetura, convenções) está em [`CLAUDE.md`](./CLAUDE.md). Fonte de verdade visual: `design/design-system-landing-page-pastor.pdf` (tokens) e `design/landing-pastor-standalone.html` (layout/referência).

## 1. Visão geral, problema e objetivo

O Pastor Xurdir e o Ministério Seja Livre não têm hoje uma presença digital própria que apresente o ministério, divulgue a agenda de cultos/mentorias/pregações, venda livros, compartilhe depoimentos e receba dízimos/ofertas de forma organizada. O conteúdo (fotos, textos, datas) muda com frequência (nova agenda toda semana, novos depoimentos, eventuais novos livros) e hoje depende de quem sabe mexer em código para atualizar qualquer coisa.

**Objetivo do MVP**: publicar uma landing page pública fiel ao protótipo do Claude Design, rápida e bem indexada por buscadores, e dar a ~3 administradores um painel simples para manter o conteúdo dessas seções atualizado sem depender de deploy.

## 2. Personas

- **Pastor Xurdir / administradores (~3 pessoas)**: alimentam agenda, livros, depoimentos, dados de oferta e texto/fotos do "Sobre". Não são desenvolvedores — precisam de formulários simples, sem construtor visual, com feedback claro de sucesso/erro.
- **Visitante/fiel**: acessa o site pelo celular (majoritariamente) ou desktop para conhecer o ministério, ver a próxima data de culto/mentoria, comprar um livro, assistir à última pregação, ler depoimentos ou fazer uma doação/dízimo via Pix ou transferência (inclusive do exterior).
- **Aluno (futuro, v2)**: papel já reservado no modelo de dados (`role = student`), sem nenhuma funcionalidade no MVP — existirá quando a área do aluno (cursos/mentorias pagas) for construída.

## 3. Escopo: MVP vs. v2

| Item | MVP | v2 |
|---|---|---|
| Landing page pública (Sobre, Agenda, Livros, Vídeo, Depoimentos, Ofertas, Rodapé) | ✅ | — |
| Admin com CRUD de conteúdo dessas seções (~3 admins, RBAC simples) | ✅ | — |
| Construtor visual de seções (drag-n-drop) | ❌ | ✅ |
| Pix/bancário: só exibição (chave estática + QR client-side + dados bancários) | ✅ | — |
| Pagamento via gateway (AbacatePay): inscrição em cursos/mentorias, compra de livro, cobrança recorrente Pix/cartão | ❌ | ✅ |
| Área do aluno (cursos, aulas) | ❌ | ✅ |
| Lembretes de lives/aulas | ❌ | ✅ |
| Papel `student` | reservado no schema, sem uso | ✅ funcional |

## 4. Requisitos funcionais por seção

Navegação pública, nesta ordem (idêntica ao protótipo): **Sobre · Agenda · Livros · Depoimentos · Ofertas**, com CTA fixo "Fale Conosco" no header (aponta para `#agenda`, igual ao protótipo — reproduzir esse comportamento; qualquer destino diferente, como WhatsApp, é uma mudança de escopo a aprovar explicitamente, não uma correção "óbvia").

### 4.1 Apresentação / Sobre (`#sobre`)
- FR-1: Exibir foto de destaque do pastor (hero, seção `#hero`) com headline em duas linhas — 1ª linha em Source Serif 4, 2ª linha manuscrita (Caveat, cor laranja) — e texto de apresentação mencionando a esposa e os filhos. **Atualizado em 2026-07-21**: a foto de destaque agora tem uma variante opcional específica pra mobile (`heroPhotoMobileUrl`, nullable) — abaixo de 860px o `<picture>`/`<source media>` troca pra essa imagem (cai de volta pra foto de desktop se a de mobile não estiver definida); usa `<picture>` nativo em vez de dois `next/image` porque só ele garante que o navegador baixe uma imagem só por viewport (dois `<Image>` alternados por CSS `hidden`/`nav:hidden` baixam as duas, mesmo sem `priority` — confirmado via rede no Playwright).
- FR-2: Exibir foto da família (`#hero-familia`) e um bloco de texto "Uma missão, três frentes" com 3 cartões (ícone + título + descrição curta): Palavra viva, Libertação e cura interior, Formação de líderes.
- FR-3: Todo texto e todas as fotos desta seção (headline, texto de apresentação, foto do pastor, foto da família, os 3 cartões) devem ser editáveis pelo admin — nada hardcoded no código após o MVP estar no ar. **Atualizado em 2026-07-21**: no admin, viraram **duas telas separadas** (`/admin/hero` e `/admin/sobre`) em vez de uma só — pedido explícito do usuário pra desembolar os dois blocos, que estavam misturados num único form. Continuam a mesma tabela `PastorProfile` no banco (sem necessidade de split de schema), só a Server Action/schema/form de cada tela que foram separados (`lib/actions/hero.ts`+`lib/schemas/hero.ts` vs `lib/actions/about-content.ts`+`lib/schemas/about-content.ts`, renomeado de `pastor-profile.ts` já que não cobre mais os campos de hero).

### 4.2 Agenda (`#agenda`)
- FR-4: Listar itens de agenda (culto presencial, mentoria, pregação) como cards: foto, selo **Presencial** (laranja sólido) ou **Online** (escuro translúcido), título, data (texto livre exibido + data real para ordenação), local, link "Saiba mais →".
- FR-5: Cards em carrossel horizontal com setas prev/next (ver mapeamento shadcn `Carousel` no `CLAUDE.md`); card com largura fixa (~340px) e gap de 24px, igual ao protótipo.
- FR-6: Admin cria/edita/remove itens de agenda, define tipo (Presencial/Online), define ordem de exibição, publica/despublica um item sem apagá-lo.
- FR-7: Itens despublicados **ou com `date` já passada** não aparecem na seção pública — a expiração por data é automática (o admin não precisa lembrar de despublicar um evento que já aconteceu).

### 4.3 Livros (`#livros`)
- FR-8: Exibir cada livro publicado como card em destaque: capa, título, subtítulo, descrição, preço (formatado em `R$`), botão "Comprar agora" (link externo).
- FR-9: Admin cria/edita/remove livros (capa, título, subtítulo, descrição, preço, link de compra), define ordem, publica/despublica.
- FR-10: No lançamento, a seção exibe **1 livro** (igual ao protótipo). O modelo de dados já é uma lista ordenável (`order`, `isPublished`), então adicionar um 2º livro no futuro é só um novo registro no admin — não exige mudança de schema, só eventual ajuste de layout (grid) se a lista crescer.

### 4.4 Vídeo em destaque (`#video`)
- FR-11: Exibir um bloco de vídeo em destaque: thumbnail com overlay de "play" e duração, rótulo (eyebrow), título, descrição curta, botão "Assistir agora". **Atualizado em 2026-07-20**: o vídeo toca inline num lightbox (`Dialog`) na própria página (YouTube/Vimeo embutido via iframe, ou `<video>` nativo se o link for um arquivo) — não é mais link externo abrindo em nova aba. Mudança pedida explicitamente pelo usuário após a Fase 2, não é a decisão original da Fase 1.
- FR-12: Admin edita o vídeo em destaque atual (thumbnail, título, descrição, link, rótulo, duração). MVP: um vídeo em destaque por vez (não é uma lista/histórico de vídeos).

### 4.5 Depoimentos / "Vidas transformadas" (`#depoimentos`)
- FR-13: Exibir depoimentos em grid responsivo de cards: citação, avatar circular com iniciais, nome, papel/vínculo ("Membro desde 2021" etc.).
- FR-14: Admin cria/edita/remove depoimentos, define ordem, publica/despublica.

### 4.6 Dízimos e ofertas (`#ofertas`)
- FR-15: Exibir 3 cartões lado a lado: (a) Pix — QR Code + chave copia-e-cola com botão "Copiar"; (b) Conta nacional — Banco, Agência, Conta corrente, CNPJ; (c) Conta internacional — Banco, IBAN, SWIFT/BIC, Titular.
- FR-16: O QR Code Pix é **gerado no cliente** a partir dos dados cadastrados (chave, nome do beneficiário, cidade) montando o payload BR Code (EMV) — nunca é uma imagem estática enviada pelo admin nem armazenada no banco/Storage.
- FR-17: Botão "Copiar" copia a chave Pix (texto copia-e-cola) para a área de transferência e dá feedback visual de sucesso.
- FR-18: Admin edita, num único formulário de configuração ("Ofertas"), todos os campos usados nos 3 cartões (chave Pix + dados da conta nacional + dados da conta internacional). Não há histórico/versionamento no MVP — é um registro singleton.

### 4.7 Rodapé
- FR-19: Exibir logo + nome do ministério, CNPJ, endereço, links de navegação (Sobre/Agenda/Livros/Ofertas), 3 ícones de redes sociais (Instagram, YouTube, WhatsApp) e linha de copyright.
- FR-20: Admin edita CNPJ, endereço, os 3 links de redes sociais e o texto de copyright.

### 4.8 Área admin (`/admin`)
- FR-21: Login restrito (Supabase Auth) — só usuários com registro na tabela `Admin` (papel `admin`) acessam qualquer rota de `/admin`.
- FR-22: CRUD de conteúdo para cada seção acima (Sobre, Agenda, Livros, Vídeo, Depoimentos, Ofertas, Rodapé) — sem construtor visual, sem editor de layout, só formulários por seção.
- FR-23: Upload de imagens direto para Supabase Storage a partir do formulário do admin (sem passo manual de subir arquivo em outro lugar e colar URL).
- FR-24: Ao salvar qualquer conteúdo, a página pública correspondente é revalidada sob demanda (o visitante vê a mudança sem esperar rebuild/deploy).
- FR-25: RBAC simples: todo admin cadastrado tem acesso total ao CRUD de conteúdo (não há, no MVP, permissões granulares por seção entre os 3 admins).
- FR-26: Qualquer admin logado pode cadastrar um novo admin (e-mail + nome) e remover um admin existente pelo próprio painel — exceto o admin marcado `isSuperAdmin`, cuja remoção é sempre bloqueada (erro explícito, não falha silenciosa). Não há tela de gestão de admin fora do painel (sem depender do dashboard do Supabase para isso).

### 4.9 Header / navbar (adicionado em 2026-07-22, fora da ordem numérica original)
- FR-27: Exibir nome do ministério (usado no navbar, rodapé e no selo do Hero — um campo só controla os 3 lugares), atalhos de menu no navbar/menu mobile e um botão de CTA fixo (texto + destino) no canto direito do navbar.
- FR-28: Admin edita o nome do ministério, o texto/destino do CTA do header, e a lista de atalhos do menu — pode adicionar, remover e editar quantos atalhos quiser; o destino de cada atalho (e do CTA) é escolhido via dropdown restrito às âncoras públicas existentes (`#sobre`, `#agenda`, `#video`, `#livros`, `#depoimentos`, `#ofertas`, `#hero`), não texto livre — evita link quebrado apontando pra uma seção que não existe.
- FR-29: Hero exibe até 2 botões de ação (CTAs), cada um com texto, link (âncora ou URL completa) e tipo (primário/secundário — estilo visual). Admin adiciona/remove (até 2) e edita texto/link/tipo de cada um na tela Hero.
- FR-30: O selo "Ministério {nome}" no Hero é opcional — admin liga/desliga via toggle (`heroShowBadge`) na tela Hero; o nome usado vem do campo único do Header (FR-27), não é editável separadamente aqui.

## 5. Design & UI

**O protótipo do Claude Design é a fonte de verdade visual** — qualquer dúvida de cor, espaçamento, tipografia ou componente se resolve olhando `design/design-system-landing-page-pastor.pdf` e `design/landing-pastor-standalone.html`, nunca por estimativa.

- **Paleta**: grafite (`#161A22` base, `#1D222D`/`#252B38`/`#2D3444` painéis e cards) + azul de marca/links (`#3159C7` a `#8FB4FF`) + **laranja `#FF7A3D`** como única cor de ação (CTAs, selo "Presencial"). Tema escuro único, sem alternância para claro.
- **Tipografia**: Source Serif 4 (títulos), Manrope (corpo/UI), Caveat (destaque manuscrito), todas carregadas via `next/font/google`.
- **Design tokens completos** (cores, gradientes, radius, sombras, escala tipográfica e de espaçamento): ver tabela consolidada em `CLAUDE.md` §5 — não duplicado aqui para evitar os dois documentos divergirem.
- **Breakpoints**: o protótipo é fluido (grids `auto-fit/minmax`) com um único ponto de quebra funcional, **860px**, onde a navbar troca de menu inline para hambúrguer/`Sheet`. Não há outros breakpoints fixos a reproduzir — o layout deve se comportar bem em qualquer largura entre mobile e desktop, não só em pontos específicos.
- **Inventário de componentes** (visual → shadcn): navbar + menu mobile, hero, cards de "Sobre" (ícone+título+texto), carrossel de agenda (card + selo), card de livro, bloco de vídeo, card de depoimento (+ avatar), bloco de ofertas (3 cards + botão copiar), selos Presencial/Online, rodapé (logo, links, ícones sociais), botões primário/secundário — mapeamento detalhado para primitivos shadcn (`Button`, `Card`, `Badge`, `Sheet`, `Avatar`, `Carousel`, `Separator`) em `CLAUDE.md` §5, incluindo os dois desvios justificados (uso de `Carousel` do shadcn em vez do scroll manual do protótipo; ícones sociais via `lucide-react` em vez dos SVGs desenhados à mão).
- **Acessibilidade**: o próprio protótipo já foi calibrado para contraste AA em tema escuro (`--text-primary` ~13:1, `--text-secondary` ~8:1, `--text-muted` ~4.6:1 sobre `--bg`) — não é permitido "escurecer" ou "clarear" essas cores por preferência estética sem checar contraste de novo. Além disso: toda imagem com `alt` descritivo, navegação por teclado no menu mobile (`Sheet`) e no carrossel de agenda, foco visível usando o `--ring` do design system, formulários do admin com `label` associado a cada campo.

## 6. Modelo de dados (entidades e campos)

> Nomes em inglês (convenção do projeto); tipos indicativos para o Prisma schema, a refinar na fase de planejamento.

- **Admin**: `id` (uuid, PK própria — **não** é mais igual ao `auth.users.id` desde o início, ver nota abaixo), `email` (único, chave de negócio), `supabaseUserId` (nullable, preenchido no primeiro login via magic link), `name`, `role` (`admin` | `student`, default `admin` — `student` reservado, sem uso no MVP), `isSuperAdmin` (boolean, default `false` — exatamente 1 linha nasce `true`, via seed, e nunca pode ser removida), `createdAt`.
  > Diferente do desenho original: como o login é por **magic link** e um admin é cadastrado pelo e-mail antes de existir qualquer usuário no Supabase Auth, `Admin.id` não pode nascer igual ao `auth.users.id` (que só existe depois do primeiro acesso). `supabaseUserId` é preenchido nesse momento — até lá, o registro existe só com `email`.
- **PastorProfile** (singleton): `heroPhotoUrl`, `heroPhotoMobileUrl` (nullable — fallback pra `heroPhotoUrl` quando vazio, adicionado 2026-07-21), `heroShowBadge` (boolean, default `true`, adicionado 2026-07-22 — controla o selo "Ministério {nome}" no Hero), `heroHeadline` (1ª linha), `heroHighlight` (2ª linha manuscrita), `heroIntro` (texto), `familyPhotoUrl`, `aboutEyebrow`, `aboutHeading`, `aboutIntro`. Continua 1 tabela só no banco — a separação em "Hero" e "Sobre" é só no admin (§9), não no schema.
- **HeroCta** (adicionado 2026-07-22): `id`, `label`, `href`, `variant` (`primary` | `secondary`), `order`. Até 2 linhas (limite aplicado no zod/form, não no banco) — os botões de ação do Hero.
- **HeaderSettings** (singleton, adicionado 2026-07-22): `ministryName` (usado também no rodapé e no selo do Hero — campo único), `ctaLabel`, `ctaHref` (uma das âncoras públicas).
- **NavLink** (adicionado 2026-07-22): `id`, `label`, `href` (uma das âncoras públicas via dropdown, não texto livre), `order`. Lista aberta — admin adiciona/remove quantos atalhos quiser.
- **AboutPillar**: `id`, `icon` (slug do ícone), `title`, `description`, `order`.
- **AgendaItem**: `id`, `title`, `type` (`presencial` | `online`), `date` (DateTime, para ordenação/expiração), `dateLabel` (texto exibido, ex.: "Qui, 17 de julho · 19h30"), `location`, `imageUrl`, `linkUrl`, `order`, `isPublished`, `createdAt`, `updatedAt`.
- **Book**: `id`, `title`, `subtitle`, `description`, `price` (Decimal), `coverImageUrl`, `buyUrl`, `order`, `isPublished`.
- **VideoHighlight** (singleton): `eyebrow`, `title`, `description`, `thumbnailUrl`, `videoUrl`, `durationLabel`, `ctaLabel`.
- **Testimonial**: `id`, `quote`, `name`, `role`, `initials`, `avatarColor`, `order`, `isPublished`.
- **OfferingSettings** (singleton): `pixKey`, `pixKeyType` (`email`|`cpf`|`cnpj`|`phone`|`random`), `pixMerchantName`, `pixMerchantCity`, `nationalBank`, `nationalAgency`, `nationalAccount`, `nationalCnpj`, `intlBank`, `intlIban`, `intlSwift`, `intlAccountHolder`.
- **FooterSettings** (singleton): `cnpj`, `address`, `instagramUrl`, `youtubeUrl`, `whatsappUrl`, `copyrightText`.

Singletons (`PastorProfile`, `VideoHighlight`, `OfferingSettings`, `FooterSettings`) modelados como tabela de 1 linha fixa — mais simples de editar num formulário único do que uma tabela genérica de "settings" chave-valor, e suficiente para ~3 admins sem necessidade de histórico de versões no MVP.

## 7. Requisitos não funcionais

- **SEO/ISR**: páginas públicas renderizadas no servidor (Server Components), com `metadata` (title/description/OpenGraph) apropriado por seção-âncora quando fizer sentido, `next/image` para todas as imagens, e revalidação sob demanda (não polling) ao salvar no admin — ver arquitetura de cache em `CLAUDE.md` §3.
- **Performance**: imagens otimizadas via `next/image` a partir do Supabase Storage; fontes via `next/font` (sem layout shift de fonte); carrossel de agenda não deve bloquear o carregamento inicial da página.
- **Acessibilidade**: contraste AA no tema escuro (ver §5), navegação por teclado, `alt` em imagens, foco visível.
- **Segurança/authz**: autorização decidida na aplicação (Server Actions/Route Handlers), não em RLS — modelo completo em `CLAUDE.md` §7. Nenhuma rota de mutação de conteúdo aceita requisição sem sessão de admin válida revalidada no servidor.
- **Responsividade**: mobile-first, fluida, com o único breakpoint funcional em 860px (troca de navbar) — ver §5.
- **i18n**: todo conteúdo do site e do admin em pt-BR; identificadores de código, nomes de tabela/coluna, commits e comandos em inglês.

## 8. Pagamentos

- **MVP**: só exibição de dados de doação — QR Pix gerado no cliente a partir do payload BR Code (chave + nome + cidade cadastrados em `OfferingSettings`), chave copia-e-cola, e dados bancários nacionais/internacionais. Nenhuma integração de gateway, nenhuma cobrança processada pelo site.
- **v2 (fora de escopo agora)**: AbacatePay para inscrição paga em cursos/mentorias, compra de livro com checkout, e cobrança recorrente via Pix/cartão. Não desenhar schema nem UI para isso agora — só citar como direção futura.

## 9. Área admin

- RBAC simples: papel único `admin` com acesso total ao CRUD de conteúdo das seções listadas em §4; ~3 pessoas usarão o painel. `student` existe só como valor reservado do enum de papel, sem tela nem permissão associada no MVP.
- Autenticação via Supabase Auth com **magic link** (sem senha) — o e-mail é a chave: um e-mail só entra se já existir uma linha correspondente na tabela `Admin`. O usuário do Supabase Auth é criado automaticamente no primeiro acesso (não precisa de convite manual pelo dashboard).
- Exatamente um admin nasce como **superAdmin** (via seed, FR-26) — só ele não pode ser removido. Qualquer admin logado pode cadastrar (por e-mail) ou remover outro admin comum pelo próprio painel; remover o superAdmin é bloqueado explicitamente. Isso é a única distinção de permissão entre admins — fora isso, todos têm acesso total ao CRUD de conteúdo (FR-25 continua valendo).
- Sem construtor visual, sem editor de blocos livres: cada seção tem seu próprio formulário com os campos definidos em §6.
- Toda alteração salva dispara revalidação sob demanda da página pública (FR-24).

## 10. Roadmap / milestones

- **Fase 0 — Fundação — ✅ CONCLUÍDA (2026-07-19)**: Prisma 7.8.0 instalado e configurado (schema completo, §6, com driver adapter `@prisma/adapter-pg` — Prisma 7 exige isso, ver `CLAUDE.md` §8), Supabase real conectado (projeto `landing-page-xurdir`, migrations aplicadas, RLS ligado nas 10 tabelas, bucket `media` com policies), login por magic link + `requireAdmin()`/`proxy.ts` (`CLAUDE.md` §7), seed com superAdmin + conteúdo placeholder, tokens do protótipo em `globals.css` + fontes no `layout.tsx` (verificado num browser real, não só build). Spec em `docs/superpowers/specs/2026-07-18-fase-0-fundacao-design.md`, plano executado (todas as tasks) em `docs/superpowers/plans/2026-07-18-fase-0-fundacao.md`. 3 advisories de segurança do Supabase ficaram registrados para decisão futura — ver §12.
- **Fase 1 — Landing pública (read-only, dados seed) — ✅ CONCLUÍDA (2026-07-19)**: todas as 7 seções públicas (§4.1–4.7) + navbar + rodapé, lendo dados reais do Postgres via `lib/content/` (Prisma + `unstable_cache`, tags por seção), seed expandido e idempotente (`prisma/seed.ts`, com casos de expiração de agenda pra FR-7). Gerador de payload Pix BR Code/EMV com CRC16 escrito à mão e testado por TDD (`lib/pix/`) — decisão de lib: QR renderizado com `react-qr-code`, resolvendo a questão em aberto §12.2. Fidelidade visual conferida contra o protótipo em desktop e mobile via Playwright, com uma rodada de correções pós-merge a partir de feedback visual direto (divisores entre seções, gradiente do hero, paridade entre os carrosséis de agenda/depoimentos, tipografia). Ícones: `lucide-react` foi removido do projeto e substituído inteiramente por `react-icons` (ver `CLAUDE.md` §2/§5). Spec em `docs/superpowers/specs/2026-07-19-fase-1-landing-publica-design.md`, plano em `docs/superpowers/plans/2026-07-19-fase-1-landing-publica.md` (STATUS: COMPLETE, com o resumo dos desvios encontrados na implementação).
- **Fase 2 — Admin — ✅ CONCLUÍDA (2026-07-20)**: painel `/admin` completo — login por magic link (`app/admin/login`, `app/auth/confirm/route.ts`), CRUD das 7 seções de conteúdo (§4.1–4.7) mais a tela de adicionar/remover admin (FR-26), upload de imagem direto do client pro Supabase Storage (`ImageUploadField`), revalidação sob demanda (`revalidateTag(tag, { expire: 0 })`) verificada seção por seção via Playwright contra o Supabase real (salvar no admin → conferir a home pública sem rebuild). Dois desvios do design original, descobertos só em runtime (não pegos por `tsc`/`build`):
  1. **Forms**: shadcn não tem bloco `form` pro style `base-nova` deste projeto — usado `@base-ui/react` `Form`/`Field` nativo + `zod` em vez de `react-hook-form` (ver `CLAUDE.md` §6).
  2. **RSC boundary**: passar uma closure (`() => action(id)`) de um Server Component pra prop de um Client Component quebra em runtime (`Event handlers cannot be passed to Client Component props`) — corrigido com `action.bind(null, id)`, o padrão documentado pra Server Action parcialmente aplicada (ver `CLAUDE.md` §6).
  Achado adicional do Supabase advisor corrigido nesta fase: policy `media public read` (SELECT amplo em `storage.objects`) removida — permitia listar o bucket inteiro, não só buscar por URL conhecida; `bucket.public = true` sozinho já serve `/object/public/...`. Spec em `docs/superpowers/specs/2026-07-19-fase-2-admin-design.md`, plano em `docs/superpowers/plans/2026-07-19-fase-2-admin.md` (com os achados de execução documentados inline nas tasks correspondentes).
- **Fase 3 — Polimento e lançamento**: SEO (metadata, OpenGraph), acessibilidade, revisão de conteúdo real com o pastor/admins, checklist de `shipping-and-launch`, revisão do SMTP/domínio do magic link pra produção (ver §12 item 2). Mesma ressalva: sem spec/plano ainda.
- **v2 (não iniciar agora)**: AbacatePay, construtor drag-n-drop, área do aluno, lembretes de lives/aulas.

## 11. Fora de escopo (v2 e além)

AbacatePay (inscrição em cursos/mentorias, compra de livros, cobrança recorrente Pix/cartão) · construtor de seções drag-n-drop (blocos de texto/imagem/carrossel livres) · área do aluno (cursos e aulas) · lembretes de lives e aulas · qualquer funcionalidade que dependa do papel `student`.

## 12. Questões em aberto

Decisões já tomadas nesta rodada (não são mais questões em aberto): itens de agenda expiram automaticamente por data (FR-7); 1 livro no lançamento (FR-10); login do admin por **magic link** com regra de `isSuperAdmin` protegido (FR-26, §9 — revisto após o brainstorm da Fase 0, substitui a decisão anterior de email+senha); Cache Components do Next 16 permanece **desligado** no MVP (modelo clássico `unstable_cache`/`revalidateTag`, já documentado em `CLAUDE.md`).

Resolvido durante a implementação da Fase 0 (detalhe em `CLAUDE.md` §8): Prisma 7.8.0 exige driver adapter (`@prisma/adapter-pg`) pro client de runtime — `schema.prisma` não aceita mais `url`/`directUrl`; conexão do CLI (migrate/seed) e a de runtime da aplicação são caminhos totalmente separados agora.

Resolvido durante a implementação da Fase 1:

- **Biblioteca de QR Code** (FR-16): `react-qr-code`, com o payload BR Code/EMV (CRC16) escrito à mão em `lib/pix/` e testado por TDD — não usa nenhuma lib pronta pra geração do payload, só pro desenho do QR em si.
- **Flags do `shadcn` CLI 4.13.1**: `bunx shadcn@latest add <componentes> --yes` roda sem nenhum prompt interativo — confirmado instalando `card badge avatar separator sheet carousel`.
- **Biblioteca de ícones**: `lucide-react` foi removido do projeto inteiro na Fase 1 (parou de exportar os ícones de marca usados no rodapé) e substituído por `react-icons` (`react-icons/lu` genérico, `react-icons/fa` pros 3 ícones de marca) — ver `CLAUDE.md` §2/§5.

Resolvido durante a implementação da Fase 2:

- **Cor de erro/estado destrutivo** (`--destructive`, item 2 antigo): validada contra tela real de formulário/`Dialog` de exclusão via Playwright — `#EC2030` lê bem no tema escuro, claramente distinto do laranja `--accent` de CTA. Nenhum ajuste necessário.
- **Bucket `media` permitia listagem pública** (item 3 antigo, achado do Supabase advisor na Fase 0): policy `media public read` removida (`drop policy`) — `bucket.public = true` já basta pra servir `/object/public/...`, a policy só habilitava listagem indevida. Confirmado via `get_advisors` que o achado `public_bucket_allows_listing` sumiu.
- **Forms sem `react-hook-form`**: shadcn não tem bloco `form` pro style `base-nova` — usado `@base-ui/react` `Form`/`Field` nativo + `zod`, ver `CLAUDE.md` §6.
- **RSC boundary com Server Actions parametrizadas**: `Action.bind(null, arg)`, não `() => Action(arg)`, ao passar uma Server Action de um Server Component pra prop de um Client Component — ver `CLAUDE.md` §6.
- **Magic link com e-mail real (achado pós-merge, 2026-07-20)**: o mailer padrão do Supabase (sem SMTP customizado) trava a edição do template de e-mail — nem o link com `{{ .TokenHash }}` nem OTP por código dá pra configurar sem isso. Some a isso: link de confirmação é um GET simples, vulnerável a pré-scan de segurança do Gmail (evidência nos logs de auth — link "clicado" 20s depois de enviado, tempo demais rápido pra ser humano), o que consome o token de uso único antes do clique real. Resolvido com SMTP customizado via **Resend** (`smtp.resend.com`, porta 465, usuário `resend`, senha = API key do Resend) configurado em Authentication → Emails → SMTP Settings — isso libera a edição do template, que foi trocado pra usar `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email` (mesmo formato que `app/auth/confirm/route.ts` já esperava desde a Fase 2, nenhuma mudança de código foi necessária). Login por magic link testado de ponta a ponta com e-mail de verdade (não só via `scripts/generate-magic-link.ts`) — confirmado funcionando. Corrigido junto: `lib/actions/auth.ts` engolia silenciosamente qualquer erro do `signInWithOtp` (ex.: rate limit do mailer padrão), sempre reportando sucesso — agora retorna erro genérico sem revelar rate-limit nem status de admin.
- **Build quebrada na Vercel (achado pós-deploy, 2026-07-20)**: `module not found: ./lib/generated/prisma/client`. `lib/generated/prisma` é saída gerada do Prisma, corretamente no `.gitignore` — mas o script `build` (`next build`) nunca chamava `prisma generate`, então um checkout limpo (Vercel) nunca tinha esse diretório; só funcionava localmente porque alguém já tinha rodado `bunx prisma generate` manualmente em algum momento e o diretório ficou no disco. Corrigido com `"postinstall": "prisma generate"` em `package.json` — roda depois de todo `bun install`, na Vercel e localmente. Verificado apagando `lib/generated/` e rodando `bun install && bun run build` do zero, reproduzindo exatamente o que a Vercel faz.
- **`Field.Error` do `@base-ui/react/field` ignora `children` (achado 2026-07-21)**: todo form do admin usava `{fieldErrors.x && <Field.Error>{fieldErrors.x[0]}</Field.Error>}` — mas `Field.Error` **descarta qualquer children** e renderiza só a própria mensagem interna, vinda do prop `errors` do `Form` (`Record<string, string | string[]>`, casado pelo `name` do `Field.Root`) ou de validação nativa — nunca do que passamos como filho. Resultado: campo ficava com borda vermelha (`invalid` prop funciona à parte) mas **nenhuma mensagem de erro aparecia, em lugar nenhum do admin**, incluindo o login (onde não existe toast de fallback). Corrigido em todos os forms: `<Form errors={fieldErrors}>` (o mecanismo real da lib) + `<Field.Error />` sem children — `invalid` manual removido dos `Field.Root` (agora automático via `errors`). Único caso à parte: `ImageUploadField` tinha dois erros diferentes no mesmo campo (erro local de upload/crop vs erro de validação do form) — o local virou `<p>` simples (não pode usar o mecanismo do Form, não é uma entrada do `fieldErrors`), o de validação do form continua via `<Field.Error />` normal.
- **Domínio próprio + SMTP do Resend, resolvido de vez (2026-07-21)**: domínio `pastorxurdir.com.br` comprado (registro.br), verificado no Resend (SPF/DKIM/MX) e adicionado como domínio de produção na Vercel (`www.pastorxurdir.com.br`, DNS confirmado propagado externamente via `dig @8.8.8.8`). Sender do Supabase trocado de `onboarding@resend.dev` pra `noreply@pastorxurdir.com.br`. Mesmo com tudo certo (DNS propagado, domínio "Verified" no dashboard do Resend, sender correto), o envio continuou recusando por >20min com `550 "The pastorxurdir.com.br domain is not verified"` — **mensagem de erro enganosa**: a causa real era a **senha do SMTP** (API key do Resend) desatualizada em Authentication → Emails → SMTP Settings, não o domínio em si. Corrigindo a senha resolveu na hora. Fica registrado porque essa mensagem de erro específica do Resend não indica o problema real — se aparecer nível "domain not verified" com um domínio que já está genuinamente verificado, conferir a senha/API key antes de mexer em DNS de novo. `Site URL`/`Redirect URLs` no Supabase e `NEXT_PUBLIC_SITE_URL` na Vercel também atualizados pro domínio novo.

Ainda em aberto:

1. **context7 nunca conectou em nenhuma sessão até agora** (Fase 0, 1 nem 2) — toda versão/comportamento de API foi verificado lendo `node_modules/` direto e testando contra o Supabase/browser real. Ainda falta confirmar assim que houver uma sessão com o MCP disponível: se isso é uma limitação do ambiente ou só não foi conectado.
2. **Preview em tempo real no admin (pedido em 2026-07-20, não implementado nesta rodada)**: ideia é um painel lateral em cada tela de edição que reusa o componente público real da seção (ex.: `HeroSection`, `AgendaSection` card, `BookCard`, `TestimonialCard`, `OffersSection`, `Footer`) renderizado client-side com os `values` do formulário em tempo real — sem tocar no banco, só pra o editor ver o resultado antes de salvar. Escopo pedido foi "todas as 8 seções", mas isso significa adaptar 8 formulários pra reusar 6+ componentes públicos diferentes (cada um exige mapear o shape do form draft pro shape de prop que o componente público espera — ex.: preço como string no form vs `number`/`Decimal` no componente, data como string `yyyy-mm-dd` vs `Date`), o que é trabalho substancial e arriscado de fazer numa rodada de ajustes pontuais. Adiado pra uma spec própria (brainstorm → plano) numa sessão futura, não é um "TODO" de uma linha só.

## 13. Critérios de aceite por feature

Cada critério abaixo deve virar teste automatizado (unitário/integração) ou passo de verificação manual explícito no plano do Superpowers.

- **Sobre**: dado que o admin salvou headline/foto/3 pilares, a home exibe exatamente esse conteúdo (sem cache stale) e a comparação lado a lado com `design/landing-pastor-standalone.html#sobre` não mostra diferença perceptível de layout/tipografia/cor.
- **Agenda**: cards renderizam selo correto por `type` (Presencial = laranja sólido, Online = escuro translúcido); item com `isPublished=false` não aparece na home; carrossel navega via setas prev/next e por swipe/touch; largura de card e gap batem com o protótipo (~340px / 24px).
- **Livros**: card exibe preço formatado em `R$`; botão "Comprar agora" abre `buyUrl` em nova aba; livro despublicado some da home.
- **Vídeo**: bloco exibe thumbnail, duração, título, descrição e CTA do `VideoHighlight` atual; editar no admin atualiza a home sem rebuild.
- **Depoimentos**: grid responsivo reflui corretamente em mobile/desktop; avatar mostra iniciais quando não há foto; ordem respeita o campo `order`.
- **Ofertas**: QR renderizado no cliente decodifica para um payload BR Code válido contendo a chave/nome/cidade cadastrados (teste automatizado do parser/gerador do payload); botão "Copiar" coloca a chave Pix na área de transferência; os 3 cards exibem exatamente os campos de `OfferingSettings`; nenhuma chamada de rede busca/serve uma "imagem de QR" — é gerado localmente.
- **Rodapé**: CNPJ, endereço, links de navegação e ícones sociais refletem `FooterSettings`; os 3 ícones sociais linkam para as URLs cadastradas.
- **Admin**: usuário sem registro em `Admin` é redirecionado ao tentar acessar qualquer rota `/admin/**`; toda Server Action de mutação re-verifica sessão + papel no servidor (não confia só no `proxy.ts`); salvar qualquer seção revalida a página pública correspondente em até uma requisição (sem precisar de F5 duplo/hard refresh); upload de imagem no admin resulta num arquivo no bucket do Supabase Storage e numa URL pública válida gravada no registro correspondente.
- **Fidelidade visual (transversal a todas as features)**: para cada seção implementada, captura de tela do resultado comparada lado a lado com o frame equivalente em `design/screenshots/` (desktop e mobile) ou com `design/landing-pastor-standalone.html` aberto no navegador — cor, tipografia, espaçamento e breakpoint de 860px da navbar devem bater; qualquer diferença precisa ser um desvio justificado e documentado em `CLAUDE.md` §5, não uma inconsistência silenciosa.
