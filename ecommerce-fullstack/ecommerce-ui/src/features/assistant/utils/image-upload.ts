const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_FILE_BYTES = 4 * 1024 * 1024
const MAX_DIMENSION = 1920

export type PreparedChatImage = {
  data: string
  mime_type: string
  previewUrl: string
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }
      reject(new Error('Não foi possível ler a imagem.'))
    }
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Imagem inválida.'))
    image.src = src
  })
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality = 0.85,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Não foi possível processar a imagem.'))
          return
        }
        resolve(blob)
      },
      mimeType,
      quality,
    )
  })
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Não foi possível processar a imagem.'))
        return
      }
      const [, base64 = ''] = reader.result.split(',')
      if (!base64) {
        reject(new Error('Não foi possível processar a imagem.'))
        return
      }
      resolve(base64)
    }
    reader.onerror = () =>
      reject(new Error('Não foi possível processar a imagem.'))
    reader.readAsDataURL(blob)
  })
}

async function resizeImageIfNeeded(
  file: File,
  dataUrl: string,
): Promise<{ data: string; mime_type: string; previewUrl: string }> {
  const mimeType = file.type
  const image = await loadImage(dataUrl)
  const largestSide = Math.max(image.width, image.height)

  if (largestSide <= MAX_DIMENSION && file.size <= MAX_FILE_BYTES) {
    const [, base64 = ''] = dataUrl.split(',')
    return {
      data: base64,
      mime_type: mimeType,
      previewUrl: dataUrl,
    }
  }

  const scale = Math.min(1, MAX_DIMENSION / largestSide)
  const width = Math.round(image.width * scale)
  const height = Math.round(image.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Não foi possível processar a imagem.')
  }

  context.drawImage(image, 0, 0, width, height)
  const blob = await canvasToBlob(canvas, mimeType)
  if (blob.size > MAX_FILE_BYTES) {
    throw new Error('Imagem muito grande. Use um arquivo de até 4 MB.')
  }

  const resizedDataUrl = await readFileAsDataUrl(
    new File([blob], file.name, { type: mimeType }),
  )
  const data = await blobToBase64(blob)

  return {
    data,
    mime_type: mimeType,
    previewUrl: resizedDataUrl,
  }
}

export function getClipboardImageFile(
  event: Pick<ClipboardEvent, 'clipboardData'>,
): File | null {
  const items = event.clipboardData?.items
  if (!items) return null

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index]
    if (!item?.type.startsWith('image/')) continue
    const file = item.getAsFile()
    if (file) return file
  }

  return null
}

export async function readImageFromClipboard(
  event: Pick<ClipboardEvent, 'clipboardData'>,
): Promise<PreparedChatImage | null> {
  const file = getClipboardImageFile(event)
  if (!file) return null
  return readImageFile(file)
}

export async function readImageFile(file: File): Promise<PreparedChatImage> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new Error('Formato inválido. Use JPEG, PNG ou WebP.')
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new Error('Imagem muito grande. Use um arquivo de até 4 MB.')
  }

  const dataUrl = await readFileAsDataUrl(file)
  return resizeImageIfNeeded(file, dataUrl)
}
