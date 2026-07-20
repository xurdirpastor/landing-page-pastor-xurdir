# Ajustes pós-Fase 2 Implementation Plan

> **For agentic workers:** Execute via `superpowers:executing-plans`, direto em `main` (sem worktree — mesmo padrão da rodada de correções pós-merge da Fase 1). Steps usam `- [ ]`.

**Goal:** `ImageUploadField` com drag'n'drop + crop obrigatório por proporção fixa; vídeo em destaque tocando em lightbox; logo do site editável.

**Architecture:** Crop client-side via `react-easy-crop` + Canvas antes do upload (Blob cortado, não o arquivo original); vídeo via `Dialog` + iframe/`<video>` decidido por uma função pura que parseia a URL; logo é um campo novo em `FooterSettings`, exibido por um componente compartilhado com fallback pro "SL" fixo.

**Tech Stack:** `react-easy-crop` (novo), Canvas API, `@base-ui/react` `Dialog` (já instalado), Prisma migration.

## Global Constraints

(mesmas do `CLAUDE.md` §6/§7 já em vigor — Bun, oxlint, TDD pra lógica pura, `requireAdmin()` inalterado, `revalidateTag(tag, { expire: 0 })`.)

---

## Task 1: `getVideoEmbed` (TDD)

**Files:**
- Create: `lib/video/parse-video-embed.ts`
- Test: `lib/video/parse-video-embed.test.ts`

- [ ] **Step 1: Teste que falha**

```ts
// lib/video/parse-video-embed.test.ts
import { describe, expect, test } from 'bun:test'
import { getVideoEmbed } from './parse-video-embed'

describe('getVideoEmbed', () => {
  test('YouTube watch URL', () => {
    expect(getVideoEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toEqual({
      type: 'youtube',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
    })
  })

  test('YouTube short URL (youtu.be)', () => {
    expect(getVideoEmbed('https://youtu.be/dQw4w9WgXcQ')).toEqual({
      type: 'youtube',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
    })
  })

  test('Vimeo URL', () => {
    expect(getVideoEmbed('https://vimeo.com/76979871')).toEqual({
      type: 'vimeo',
      embedUrl: 'https://player.vimeo.com/video/76979871?autoplay=1',
    })
  })

  test('direct file URL falls back to file type', () => {
    expect(getVideoEmbed('https://example.org/videos/sermon.mp4')).toEqual({
      type: 'file',
      src: 'https://example.org/videos/sermon.mp4',
    })
  })
})
```

- [ ] **Step 2: Rodar e confirmar falha**

```bash
bun test lib/video/parse-video-embed.test.ts
```

Expected: FAIL — módulo não existe.

- [ ] **Step 3: Implementar**

```ts
// lib/video/parse-video-embed.ts
export type VideoEmbed =
  | { type: 'youtube'; embedUrl: string }
  | { type: 'vimeo'; embedUrl: string }
  | { type: 'file'; src: string }

export function getVideoEmbed(url: string): VideoEmbed {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
  )
  if (youtubeMatch) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`,
    }
  }

  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeoMatch) {
    return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` }
  }

  return { type: 'file', src: url }
}
```

- [ ] **Step 4: Rodar e confirmar passa**

```bash
bun test lib/video/parse-video-embed.test.ts
```

Expected: PASS, 4 testes.

- [ ] **Step 5: Commit**

```bash
git add lib/video/parse-video-embed.ts lib/video/parse-video-embed.test.ts
git commit -m "feat: add pure video URL embed parser (YouTube/Vimeo/file)"
```

---

## Task 2: `VideoSection` — lightbox em vez de link externo

**Files:**
- Modify: `components/video/video-section.tsx`

**Interfaces:**
- Consumes: `getVideoEmbed` (Task 1), `Dialog`/`DialogContent` (existentes).

- [ ] **Step 1: Reescrever**

```tsx
// components/video/video-section.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { LuPlay } from 'react-icons/lu'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { getVideoEmbed } from '@/lib/video/parse-video-embed'
import type { VideoHighlight } from '@/lib/generated/prisma/client'

export function VideoSection({ video }: { video: VideoHighlight }) {
  const [open, setOpen] = useState(false)
  const embed = getVideoEmbed(video.videoUrl)

  return (
    <section id="video" className="bg-popover">
      <div className="divider-glow" />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-[88px] nav:grid-cols-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group relative block aspect-video w-full overflow-hidden rounded-lg shadow-md"
        >
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(min-width: 860px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
            <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-background">
              <LuPlay className="size-6 fill-current" />
            </span>
          </div>
          <span className="absolute right-4 bottom-4 rounded-md bg-background/80 px-2.5 py-1 text-xs font-semibold text-foreground">
            {video.durationLabel}
          </span>
        </button>

        <div>
          <p className="text-sm font-bold tracking-[1.3px] text-blue-accent-text uppercase nav:text-xl">
            {video.eyebrow}
          </p>
          <h2 className="mt-3 font-heading text-[clamp(32px,4.2vw,46px)] font-semibold text-foreground">
            {video.title}
          </h2>
          <p className="mt-4 max-w-lg text-base leading-[1.7] text-text-secondary">
            {video.description}
          </p>
          <Button
            type="button"
            onClick={() => setOpen(true)}
            className="mt-6 h-12 rounded-full px-7 text-[15px] font-bold"
          >
            {video.ctaLabel}
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-3xl">
          <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
            {open && embed.type === 'file' && (
              <video src={embed.src} controls autoPlay className="size-full" />
            )}
            {open && embed.type !== 'file' && (
              <iframe
                src={embed.embedUrl}
                title={video.title}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                className="size-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}
```

- [ ] **Step 2: Verificar**

```bash
bunx tsc --noEmit && bunx oxlint
```

Expected: sem erros.

- [ ] **Step 3: Verificação Playwright**

Com `bun run dev`: abrir `/`, clicar na thumbnail do vídeo — `Dialog` abre com o player tocando (autoplay), sem nova aba. Fechar o dialog (X ou clique fora) — player para (desmonta, `open && ...` garante isso). Clicar no botão "Assistir agora" abre o mesmo dialog.

- [ ] **Step 4: Commit**

```bash
git add components/video/video-section.tsx
git commit -m "feat: play featured video in a lightbox instead of external link"
```

---

## Task 3: `getCroppedImageBlob` (sem TDD — API de Canvas/browser)

**Files:**
- Create: `lib/image/crop-image.ts`

Não recebe teste unitário: depende de `HTMLCanvasElement`/`Image` do browser, que não existem em `bun:test` sem um polyfill de DOM que este projeto não tem configurado — a verificação real é o Playwright do Task 5.

- [ ] **Step 1: Implementar**

```ts
// lib/image/crop-image.ts
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = url
  })
}

export type CropPixels = { x: number; y: number; width: number; height: number }

export async function getCroppedImageBlob(
  imageSrc: string,
  crop: CropPixels
): Promise<Blob> {
  const image = await loadImage(imageSrc)
  const canvas = document.createElement('canvas')
  canvas.width = crop.width
  canvas.height = crop.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas context indisponível')

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar imagem cortada'))),
      'image/jpeg',
      0.92
    )
  })
}
```

- [ ] **Step 2: Verificar**

```bash
bunx tsc --noEmit && bunx oxlint
```

- [ ] **Step 3: Commit**

```bash
git add lib/image/crop-image.ts
git commit -m "feat: add canvas-based image crop helper"
```

---

## Task 4: `ImageUploadField` — drag'n'drop + crop obrigatório

**Files:**
- Modify: `components/admin/image-upload-field.tsx`
- Modify: `package.json`, `bun.lock` (via `bun add react-easy-crop`)

**Interfaces:**
- Consumes: `getCroppedImageBlob` (Task 3), `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle`/`DialogFooter` (existentes).
- Produces: `<ImageUploadField name label section aspectRatio value onValueChange error />` — **prop nova obrigatória `aspectRatio: number`**, todo call site precisa ser atualizado (Task 5).

- [ ] **Step 1: Instalar `react-easy-crop`**

```bash
bun add react-easy-crop
```

- [ ] **Step 2: Reescrever**

```tsx
// components/admin/image-upload-field.tsx
'use client'

import { useState, type ChangeEvent, type DragEvent } from 'react'
import Image from 'next/image'
import Cropper, { type Area } from 'react-easy-crop'
import { Field } from '@base-ui/react/field'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { buildUploadPath } from '@/lib/storage/upload-path'
import { getCroppedImageBlob } from '@/lib/image/crop-image'

type ImageUploadFieldProps = {
  name: string
  label: string
  section: string
  aspectRatio: number
  value: string
  onValueChange: (url: string) => void
  error?: string
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024

export function ImageUploadField({
  name,
  label,
  section,
  aspectRatio,
  value,
  onValueChange,
  error,
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [pendingFile, setPendingFile] = useState<{ file: File; objectUrl: string } | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setUploadError('Selecione um arquivo de imagem.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError('Imagem maior que 5MB.')
      return
    }
    setUploadError(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedArea(null)
    setPendingFile({ file, objectUrl: URL.createObjectURL(file) })
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) handleFile(file)
    event.target.value = ''
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDraggingOver(false)
    const file = event.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function cancelCrop() {
    if (pendingFile) URL.revokeObjectURL(pendingFile.objectUrl)
    setPendingFile(null)
  }

  async function confirmCrop() {
    if (!pendingFile || !croppedArea) return
    setIsUploading(true)

    try {
      const blob = await getCroppedImageBlob(pendingFile.objectUrl, croppedArea)
      const supabase = createClient()
      const path = buildUploadPath(section, pendingFile.file.name, crypto.randomUUID())
      const { error: uploadErr } = await supabase.storage
        .from('media')
        .upload(path, blob, { contentType: blob.type })

      if (uploadErr) {
        setUploadError(`Falha no upload: ${uploadErr.message}`)
        return
      }

      const { data } = supabase.storage.from('media').getPublicUrl(path)
      onValueChange(data.publicUrl)
      URL.revokeObjectURL(pendingFile.objectUrl)
      setPendingFile(null)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Field.Root name={name} invalid={!!error || !!uploadError}>
      <Field.Label>{label}</Field.Label>

      {value && (
        <div className="relative size-40 overflow-hidden rounded-md">
          <Image src={value} alt="" fill sizes="160px" className="object-cover" />
        </div>
      )}

      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDraggingOver(true)
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center gap-2 rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground ${
          isDraggingOver ? 'border-ring bg-secondary/30' : 'border-border'
        }`}
      >
        <p>Arraste uma imagem aqui ou</p>
        <input type="file" accept="image/*" onChange={handleInputChange} disabled={isUploading} />
      </div>

      <input type="hidden" name={name} value={value} />
      {isUploading && <p className="text-sm text-muted-foreground">Enviando imagem...</p>}
      {uploadError && <Field.Error>{uploadError}</Field.Error>}
      {!uploadError && error && <Field.Error>{error}</Field.Error>}

      <Dialog
        open={!!pendingFile}
        onOpenChange={(open) => {
          if (!open) cancelCrop()
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajustar recorte</DialogTitle>
          </DialogHeader>
          {pendingFile && (
            <div className="relative h-80 w-full bg-black">
              <Cropper
                image={pendingFile.objectUrl}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, area) => setCroppedArea(area)}
              />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={cancelCrop}>
              Cancelar
            </Button>
            <Button type="button" disabled={isUploading} onClick={confirmCrop}>
              {isUploading ? 'Enviando...' : 'Confirmar corte'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Field.Root>
  )
}
```

- [ ] **Step 3: Verificar**

```bash
bunx tsc --noEmit
```

Expected: erros nos 4 call sites existentes (faltando a prop `aspectRatio`, agora obrigatória) — corrigidos no Task 5. `bunx oxlint` deve passar sem erro (lint não sabe de props faltando).

- [ ] **Step 4: Commit**

```bash
git add components/admin/image-upload-field.tsx package.json bun.lock
git commit -m "feat: add drag'n'drop and mandatory crop to ImageUploadField"
```

---

## Task 5: Atualizar os 4 call sites existentes com `aspectRatio`

**Files:**
- Modify: `components/admin/about-form.tsx` (2 usos: `heroPhotoUrl`, `familyPhotoUrl`)
- Modify: `components/admin/agenda-item-form.tsx` (`imageUrl`)
- Modify: `components/admin/book-form.tsx` (`coverImageUrl`)
- Modify: `components/admin/video-highlight-form.tsx` (`thumbnailUrl`)

- [ ] **Step 1: `about-form.tsx`**

Na `ImageUploadField` de `heroPhotoUrl`, adicionar `aspectRatio={16 / 9}`. Na de `familyPhotoUrl`, adicionar `aspectRatio={4 / 3}`.

- [ ] **Step 2: `agenda-item-form.tsx`**

Na `ImageUploadField` de `imageUrl`, adicionar `aspectRatio={4 / 3}`.

- [ ] **Step 3: `book-form.tsx`**

Na `ImageUploadField` de `coverImageUrl`, adicionar `aspectRatio={11 / 16}`.

- [ ] **Step 4: `video-highlight-form.tsx`**

Na `ImageUploadField` de `thumbnailUrl`, adicionar `aspectRatio={16 / 9}`.

- [ ] **Step 5: Verificar**

```bash
bunx tsc --noEmit && bunx oxlint
```

Expected: sem erros — os 4 usos agora satisfazem a prop obrigatória.

- [ ] **Step 6: Commit**

```bash
git add components/admin/about-form.tsx components/admin/agenda-item-form.tsx components/admin/book-form.tsx components/admin/video-highlight-form.tsx
git commit -m "feat: set fixed crop aspect ratio per image field"
```

---

## Task 6: Logo — schema, migration, action, form

**Files:**
- Modify: `prisma/schema.prisma` (`FooterSettings.logoUrl String?`)
- Modify: `lib/schemas/footer-settings.ts`
- Modify: `components/admin/footer-settings-form.tsx`

**Interfaces:**
- Produces: `FooterSettings.logoUrl: string | null` — consumido pelo Task 7 (`Footer`) e Task 8 (`Navbar` via `app/page.tsx`).

- [ ] **Step 1: Schema Prisma**

Em `prisma/schema.prisma`, no model `FooterSettings`, adicionar como primeiro campo depois de `id`:

```prisma
model FooterSettings {
  id            String  @id @default("singleton")
  logoUrl       String?
  cnpj          String
  address       String
  instagramUrl  String
  youtubeUrl    String
  whatsappUrl   String
  copyrightText String
}
```

- [ ] **Step 2: Migration**

```bash
bunx prisma migrate dev --name add_footer_logo
bunx prisma generate
```

Expected: migration criada em `prisma/migrations/`, client regenerado sem erro.

- [ ] **Step 3: zod schema**

Em `lib/schemas/footer-settings.ts`, adicionar `logoUrl` (opcional — string vazia significa "sem logo"):

```ts
// lib/schemas/footer-settings.ts
import { z } from 'zod'

export const footerSettingsSchema = z.object({
  logoUrl: z.union([z.string().url(), z.literal('')]),
  cnpj: z.string().min(1, 'Obrigatório'),
  address: z.string().min(1, 'Obrigatório'),
  instagramUrl: z.string().url('URL inválida'),
  youtubeUrl: z.string().url('URL inválida'),
  whatsappUrl: z.string().url('URL inválida'),
  copyrightText: z.string().min(1, 'Obrigatório'),
})

export type FooterSettingsInput = z.infer<typeof footerSettingsSchema>
```

- [ ] **Step 4: Form**

Em `components/admin/footer-settings-form.tsx`, adicionar o campo de logo antes do loop de `fields` (usa `ImageUploadField`, não o padrão `Field.Root`/`Input` dos outros campos):

```tsx
// dentro do <Form>, antes de `{fields.map(...)}`
<ImageUploadField
  name="logoUrl"
  label="Logo do site (usado no cabeçalho e no rodapé)"
  section="profile"
  aspectRatio={1}
  value={values.logoUrl}
  onValueChange={(url) => setValues((v) => ({ ...v, logoUrl: url }))}
  error={fieldErrors.logoUrl?.[0]}
/>
```

Adicionar o import: `import { ImageUploadField } from '@/components/admin/image-upload-field'`.

- [ ] **Step 5: Página admin — passar `logoUrl` no `initialValues`**

Em `app/admin/(dashboard)/rodape/page.tsx`, adicionar `logoUrl: settings.logoUrl ?? ''` no objeto `initialValues`.

- [ ] **Step 6: Verificar**

```bash
bunx tsc --noEmit && bunx oxlint
```

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/migrations lib/schemas/footer-settings.ts components/admin/footer-settings-form.tsx "app/admin/(dashboard)/rodape/page.tsx"
git commit -m "feat: add editable site logo to Rodapé settings"
```

---

## Task 7: `LogoMark` compartilhado + `Navbar`/`Footer`

**Files:**
- Create: `components/brand/logo-mark.tsx`
- Modify: `components/navbar/navbar.tsx`
- Modify: `components/footer/footer.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: `LogoMark`**

```tsx
// components/brand/logo-mark.tsx
import Image from 'next/image'

export function LogoMark({ logoUrl }: { logoUrl?: string | null }) {
  if (logoUrl) {
    return (
      <span className="relative block size-9 shrink-0 overflow-hidden rounded-full">
        <Image src={logoUrl} alt="Seja Livre" fill sizes="36px" className="object-cover" />
      </span>
    )
  }

  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-primary text-sm font-bold text-primary-foreground">
      SL
    </span>
  )
}
```

- [ ] **Step 2: `Navbar`**

Adicionar prop e usar `LogoMark` no lugar do `<span>` "SL" hardcoded:

```tsx
// components/navbar/navbar.tsx — trecho relevante
import { LogoMark } from '@/components/brand/logo-mark'
// ...
export function Navbar({ logoUrl }: { logoUrl?: string | null }) {
  return (
    // ...
        <a href="#hero" className="flex items-center gap-2">
          <LogoMark logoUrl={logoUrl} />
          <span className="font-heading text-lg font-semibold text-foreground">Seja Livre</span>
        </a>
    // ...
  )
}
```

- [ ] **Step 3: `Footer`**

Trocar o `<span>` "SL" hardcoded por `<LogoMark logoUrl={settings.logoUrl} />` (mesmo import).

- [ ] **Step 4: `app/page.tsx`**

Trocar `<Navbar />` por `<Navbar logoUrl={footer.logoUrl} />`.

- [ ] **Step 5: Verificar**

```bash
bunx tsc --noEmit && bunx oxlint
```

- [ ] **Step 6: Commit**

```bash
git add components/brand/logo-mark.tsx components/navbar/navbar.tsx components/footer/footer.tsx app/page.tsx
git commit -m "feat: render editable site logo in navbar and footer"
```

---

## Task 8: Verificação completa + Playwright + docs

**Files:**
- Modify: `PRD.md` (FR-11/12 — vídeo agora toca inline, não link externo)

- [ ] **Step 1: Suite completa**

```bash
bunx oxlint
bunx tsc --noEmit
bun test
bun run build
```

Expected: tudo limpo.

- [ ] **Step 2: Playwright — crop + drag'n'drop**

Com `bun run dev` e logado: em `/admin/livros/novo` (ou editar o livro existente), soltar um arquivo de imagem na área de drop do campo "Capa" — confirmar que o editor de corte abre com proporção de livro (retrato). Testar também clicando em "Choose File" com o mesmo resultado. Confirmar o corte, salvar, e checar no Storage/DB que a URL final foi salva.

- [ ] **Step 3: Playwright — logo**

Em `/admin/rodape`, subir um logo (corte 1:1), salvar. Navegar pra `/` e confirmar que o navbar e o rodapé mostram a imagem em vez do "SL".

- [ ] **Step 4: Atualizar `PRD.md`**

No FR-11/FR-12 (§4.4), atualizar o texto de "link externo" pra refletir que o vídeo agora toca num lightbox na própria página — anotar a data e o motivo da mudança (pedido explícito, não é mais a decisão original da Fase 1).

- [ ] **Step 5: Commit**

```bash
git add PRD.md
git commit -m "docs: update FR-11/12 — featured video now plays in an inline lightbox"
```
