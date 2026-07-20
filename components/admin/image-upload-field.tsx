'use client'

import { useState, type ChangeEvent } from 'react'
import Image from 'next/image'
import { Field } from '@base-ui/react/field'
import { createClient } from '@/lib/supabase/client'
import { buildUploadPath } from '@/lib/storage/upload-path'

type ImageUploadFieldProps = {
  name: string
  label: string
  section: string
  value: string
  onValueChange: (url: string) => void
  error?: string
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024

export function ImageUploadField({
  name,
  label,
  section,
  value,
  onValueChange,
  error,
}: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setUploadError('Selecione um arquivo de imagem.')
      return
    }
    if (file.size > MAX_SIZE_BYTES) {
      setUploadError('Imagem maior que 5MB.')
      return
    }

    setUploadError(null)
    setIsUploading(true)

    const supabase = createClient()
    const path = buildUploadPath(section, file.name, crypto.randomUUID())
    const { error: uploadErr } = await supabase.storage.from('media').upload(path, file)

    if (uploadErr) {
      setUploadError(`Falha no upload: ${uploadErr.message}`)
      setIsUploading(false)
      return
    }

    const { data } = supabase.storage.from('media').getPublicUrl(path)
    onValueChange(data.publicUrl)
    setIsUploading(false)
  }

  return (
    <Field.Root name={name} invalid={!!error || !!uploadError}>
      <Field.Label>{label}</Field.Label>
      {value && (
        <div className="relative size-40 overflow-hidden rounded-md">
          <Image src={value} alt="" fill sizes="160px" className="object-cover" />
        </div>
      )}
      <input type="file" accept="image/*" onChange={handleFileChange} disabled={isUploading} />
      <input type="hidden" name={name} value={value} />
      {isUploading && <p className="text-sm text-muted-foreground">Enviando imagem...</p>}
      {uploadError && <Field.Error>{uploadError}</Field.Error>}
      {!uploadError && error && <Field.Error>{error}</Field.Error>}
    </Field.Root>
  )
}
