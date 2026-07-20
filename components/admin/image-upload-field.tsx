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
              {isUploading ? 'Enviando...' : 'Confirmar corte'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Field.Root>
  )
}
