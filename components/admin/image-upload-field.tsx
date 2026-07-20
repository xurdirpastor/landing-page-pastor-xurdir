'use client'

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import Image from 'next/image'
import Cropper, { type Area } from 'react-easy-crop'
import { Field } from '@base-ui/react/field'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [pendingSource, setPendingSource] = useState<{ objectUrl: string; file: File | null } | null>(
    null
  )
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)

  function openCropFor(source: { objectUrl: string; file: File | null }) {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedArea(null)
    setPendingSource(source)
  }

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
    openCropFor({ file, objectUrl: URL.createObjectURL(file) })
  }

  function handleEditExisting() {
    if (!value) return
    setUploadError(null)
    openCropFor({ file: null, objectUrl: value })
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
    if (pendingSource?.file) URL.revokeObjectURL(pendingSource.objectUrl)
    setPendingSource(null)
  }

  async function confirmCrop() {
    if (!pendingSource || !croppedArea) return
    setIsUploading(true)

    try {
      const blob = await getCroppedImageBlob(pendingSource.objectUrl, croppedArea)
      const supabase = createClient()
      const path = buildUploadPath(
        section,
        pendingSource.file?.name ?? 'imagem.jpg',
        crypto.randomUUID()
      )
      const { error: uploadErr } = await supabase.storage
        .from('media')
        .upload(path, blob, { contentType: blob.type })

      if (uploadErr) {
        setUploadError(`Falha no upload: ${uploadErr.message}`)
        return
      }

      const { data } = supabase.storage.from('media').getPublicUrl(path)
      onValueChange(data.publicUrl)
      if (pendingSource.file) URL.revokeObjectURL(pendingSource.objectUrl)
      setPendingSource(null)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Field.Root name={name} invalid={!!error || !!uploadError}>
      <Field.Label>{label}</Field.Label>

      {value && (
        <button
          type="button"
          onClick={handleEditExisting}
          className="group relative w-40 overflow-hidden rounded-md ring-1 ring-border"
          style={{ aspectRatio }}
        >
          <Image src={value} alt="" fill sizes="160px" className="object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-center text-xs font-semibold text-transparent transition-colors group-hover:bg-black/60 group-hover:text-white">
            Clique para editar
          </span>
        </button>
      )}

      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDraggingOver(true)
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center gap-3 rounded-md border border-dashed p-5 text-center text-sm text-muted-foreground ${
          isDraggingOver ? 'border-ring bg-secondary/30' : 'border-border'
        }`}
      >
        <p>Arraste uma imagem aqui, ou</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          Escolher arquivo
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          disabled={isUploading}
          className="hidden"
        />
      </div>

      <input type="hidden" name={name} value={value} />
      {isUploading && <p className="text-sm text-muted-foreground">Enviando imagem...</p>}
      {uploadError && <Field.Error>{uploadError}</Field.Error>}
      {!uploadError && error && <Field.Error>{error}</Field.Error>}

      <Dialog
        open={!!pendingSource}
        onOpenChange={(open) => {
          if (!open) cancelCrop()
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Recortar imagem</DialogTitle>
            <DialogDescription>
              Ajuste o enquadramento pra área destacada — é assim que a imagem vai aparecer no
              site.
            </DialogDescription>
          </DialogHeader>
          {pendingSource && (
            <div className="relative h-80 w-full bg-black">
              <Cropper
                image={pendingSource.objectUrl}
                crop={crop}
                zoom={zoom}
                rotation={0}
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
              {isUploading ? 'Enviando...' : 'Salvar recorte'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Field.Root>
  )
}
