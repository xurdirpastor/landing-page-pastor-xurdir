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
