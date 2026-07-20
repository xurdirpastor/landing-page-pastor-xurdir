# Ajustes pós-Fase 2 — upload com crop, vídeo em lightbox, logo editável: design

Data: 2026-07-20. Relacionado: [`PRD.md`](../../../PRD.md) FR-11/12 (vídeo), FR-23 (upload), §6 (modelo de dados), [`CLAUDE.md`](../../../CLAUDE.md) §5 (design tokens), [`2026-07-19-fase-2-admin-design.md`](./2026-07-19-fase-2-admin-design.md) (`ImageUploadField` original). Pré-requisito: Fase 2 concluída e mergeada em `main`.

## Objetivo

Três ajustes pedidos depois da Fase 2 estar no ar:

1. `ImageUploadField` aceita drag'n'drop além do "Choose File", e abre um editor de recorte (crop) com proporção fixa por campo antes de subir a imagem.
2. Vídeo em destaque na home pública toca inline num lightbox ao clicar, em vez de abrir link externo (isso reverte a decisão original de FR-11/12 — "link externo" — por pedido explícito nesta sessão).
3. Logo do site (hoje um "SL" fixo, duplicado no navbar e rodapé) passa a ser editável pelo admin, com fallback pro "SL" quando não configurado.

## 1. Decisões desta fase (resumo)

- **Proporção de crop por campo, não livre** — cada `ImageUploadField` ganha uma prop `aspectRatio` fixa, extraída do que a seção pública já renderiza de verdade (não inventado):
  | Campo | `aspectRatio` | Confirmado em |
  |---|---|---|
  | Sobre → foto hero | `16/9` (padrão de enquadramento; render público é `fill` sem proporção fixa) | `components/about/hero-section.tsx` |
  | Sobre → foto família | `4/3` | `components/about/about-section.tsx:30` |
  | Vídeo → thumbnail | `16/9` | `components/video/video-section.tsx` (`aspect-video`) |
  | Agenda → foto | `4/3` | `components/agenda/agenda-card.tsx:10` |
  | Livros → capa | `11/16` | `components/books/book-card.tsx:10` |
  | Rodapé → logo (novo) | `1/1` | renderizado em círculo (`rounded-full`) no navbar/rodapé |
- **Crop obrigatório**: seleção (clique ou drop) sempre abre o editor antes de confirmar — nunca sobe a imagem original sem passar pelo corte.
- **Lib de crop**: `react-easy-crop` (zoom + arraste, API pronta pra devolver o retângulo de corte em pixels via `onCropComplete`). Nova dependência — nenhuma alternativa já instalada resolve isso.
- **Corte acontece no client, antes do upload**: `canvas` desenha a área cortada, gera um `Blob`, e é esse Blob (não o arquivo original) que sobe pro Storage. `buildUploadPath` continua recebendo o nome do arquivo original (só pro slug do path).
- **Vídeo**: função pura nova `getVideoEmbed(url)` decide entre YouTube (`youtube.com/watch?v=`, `youtu.be/`, `youtube.com/embed/`, `youtube.com/shorts/`), Vimeo (`vimeo.com/<id>`), ou trata como arquivo direto (`<video>` nativo) caso não bata com nenhum padrão — testada por TDD. `VideoSection` passa a ser `'use client'` (já recebia dado 100% resolvido do servidor via prop, não perde nada) pra guardar o estado do `Dialog`.
- **Logo**: campo novo `FooterSettings.logoUrl` (nullable — sem valor = mostra o "SL" de sempre). Escolhido `FooterSettings` por já ser o singleton de "identidade/marca do site" (CNPJ, endereço, redes sociais, copyright) — não abre tabela nova só por um campo. Componente `components/brand/logo-mark.tsx` novo, compartilhado entre `Navbar` e `Footer` (hoje os dois têm o `<span>` do "SL" duplicado, idêntico).
- **`Navbar` ganha prop `logoUrl?: string | null`** — hoje não recebia nenhuma prop; `app/page.tsx` passa `footer.logoUrl`.

## 2. Estrutura de arquivos

```
lib/
  image/
    crop-image.ts          # getCroppedImageBlob(imageSrc, cropPixels): Promise<Blob> — usa Canvas, sem TDD
                            # (API de browser, não lógica pura — sem jsdom/canvas configurado no bun:test)
  video/
    parse-video-embed.ts    # getVideoEmbed(url) — função pura, testada por TDD
    parse-video-embed.test.ts
components/
  brand/
    logo-mark.tsx           # <LogoMark logoUrl? /> — Image se houver, senão o "SL" gradiente de sempre
  admin/
    image-upload-field.tsx  # reescrito: + drag'n'drop, + Dialog de crop (react-easy-crop), + prop aspectRatio
    about-form.tsx           # + aspectRatio nos 2 ImageUploadField existentes
    agenda-item-form.tsx     # + aspectRatio
    book-form.tsx            # + aspectRatio
    video-highlight-form.tsx # + aspectRatio
    footer-settings-form.tsx # + campo de logo (ImageUploadField aspectRatio=1/1)
  video/
    video-section.tsx        # 'use client', substitui os <a href target=_blank> por Dialog + botões
  navbar/
    navbar.tsx                # + prop logoUrl, usa <LogoMark>
  footer/
    footer.tsx                 # usa <LogoMark logoUrl={settings.logoUrl}>
app/
  page.tsx                    # passa <Navbar logoUrl={footer.logoUrl} />
lib/schemas/footer-settings.ts # + logoUrl: url opcional (string vazia = sem logo)
prisma/schema.prisma           # FooterSettings.logoUrl String? (nova migration)
```

## 3. Fora de escopo

Crop não é reaplicável a uma imagem já salva sem trocar o arquivo (trocar = novo crop do zero) · sem opção de pular o crop · vídeo continua sem suporte a playlist/múltiplos vídeos (segue sendo singleton, FR-12 não muda nisso) · logo não afeta o favicon/metadata da aba do navegador (fora de escopo, ver Fase 3/SEO).

## 4. Critérios de aceite

- Arrastar um arquivo de imagem pra dentro do campo de upload sobe a imagem, igual clicar em "Choose File".
- Selecionar/soltar uma imagem sempre abre o editor de corte antes de qualquer upload acontecer; cancelar não sobe nada.
- A proporção do corte bate com a listada na tabela acima, por campo.
- Clicar na thumbnail ou no botão "Assistir agora" do vídeo em destaque abre um player tocando dentro da página (YouTube, Vimeo ou arquivo direto, dependendo da URL cadastrada) — nenhuma nova aba abre.
- Admin consegue subir um logo em Rodapé; navbar e rodapé da home pública passam a mostrar esse logo. Sem logo cadastrado, os dois continuam mostrando o "SL" de sempre.
