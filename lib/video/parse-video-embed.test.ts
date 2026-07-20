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
