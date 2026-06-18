import { describe, expect, it } from 'vitest'
import { getClipboardImageFile, readImageFile } from './image-upload'

function createClipboardEvent(
  items: Array<{ type: string; file?: File | null }>,
) {
  return {
    clipboardData: {
      items: items.map(({ type, file = null }) => ({
        type,
        getAsFile: () => file,
      })),
    },
  }
}

describe('getClipboardImageFile', () => {
  it('returns null when clipboard has no image', () => {
    const event = createClipboardEvent([{ type: 'text/plain' }])

    expect(
      getClipboardImageFile(
        event as unknown as Pick<ClipboardEvent, 'clipboardData'>,
      ),
    ).toBeNull()
  })

  it('extracts the first image file from clipboard items', () => {
    const file = new File(['png'], 'print.png', { type: 'image/png' })
    const event = createClipboardEvent([
      { type: 'text/plain' },
      { type: 'image/png', file },
    ])

    expect(
      getClipboardImageFile(
        event as unknown as Pick<ClipboardEvent, 'clipboardData'>,
      ),
    ).toBe(file)
  })
})

describe('readImageFile', () => {
  it('rejects unsupported mime types', async () => {
    const file = new File(['gif'], 'product.gif', { type: 'image/gif' })

    await expect(readImageFile(file)).rejects.toThrow(
      'Formato inválido. Use JPEG, PNG ou WebP.',
    )
  })

  it('rejects files larger than 4 MB', async () => {
    const file = new File([new Uint8Array(4 * 1024 * 1024 + 1)], 'large.jpg', {
      type: 'image/jpeg',
    })

    await expect(readImageFile(file)).rejects.toThrow(
      'Imagem muito grande. Use um arquivo de até 4 MB.',
    )
  })
})
