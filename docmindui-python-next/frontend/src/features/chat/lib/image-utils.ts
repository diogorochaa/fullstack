const MAX_IMAGE_DIMENSION = 1280
const MAX_FILE_BYTES = 4 * 1024 * 1024
const JPEG_QUALITY = 0.85

export type PreparedChatImage = {
  dataUrl: string
  base64: string
  mimeType: string
  name: string
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Não foi possível carregar a imagem."))
    }
    img.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Falha ao processar a imagem."))
          return
        }
        resolve(blob)
      },
      mimeType,
      JPEG_QUALITY,
    )
  })
}

export async function prepareImageForChat(file: File): Promise<PreparedChatImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem válido.")
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("A imagem deve ter no máximo 4 MB.")
  }

  const img = await loadImageElement(file)
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.width, img.height))
  const width = Math.max(1, Math.round(img.width * scale))
  const height = Math.max(1, Math.round(img.height * scale))

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    throw new Error("Seu navegador não suporta processamento de imagem.")
  }
  ctx.drawImage(img, 0, 0, width, height)

  const outputMime = file.type === "image/png" ? "image/png" : "image/jpeg"
  const blob = await canvasToBlob(canvas, outputMime)

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Falha ao ler a imagem."))
    reader.readAsDataURL(blob)
  })

  const base64 = dataUrl.split(",")[1] ?? ""
  if (!base64) {
    throw new Error("Imagem inválida.")
  }

  return {
    dataUrl,
    base64,
    mimeType: outputMime,
    name: file.name,
  }
}
