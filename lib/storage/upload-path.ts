function slugifyFilename(filename: string): string {
  return filename
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildUploadPath(section: string, filename: string, id: string): string {
  return `${section}/${id}-${slugifyFilename(filename)}`
}
