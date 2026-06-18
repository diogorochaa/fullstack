const CATEGORY_FALLBACKS: Record<string, string[]> = {
  tenis: [
    'Escolha o tamanho ideal com folga de meia.',
    'Use em superfícies adequadas para preservar o solado.',
    'Limpe com pano úmido e deixe secar à sombra.',
  ],
  eletronicos: [
    'Carregue completamente antes do primeiro uso.',
    'Configure pelo app ou manual do fabricante.',
    'Mantenha longe de umidade e calor excessivo.',
  ],
  roupas: [
    'Confira a tabela de medidas antes de comprar.',
    'Lave conforme instruções da etiqueta.',
    'Passe com temperatura adequada ao tecido.',
  ],
  acessorios: [
    'Ajuste tamanho ou posição conforme o modelo.',
    'Guarde em local seco quando não estiver em uso.',
    'Limpe periodicamente com produto neutro.',
  ],
}

function extractNumberedSteps(text: string): string[] {
  const matches = text.match(/(?:^|\s)\d+[\.)]\s+[^.\n]+/g)
  if (!matches || matches.length < 2) return []
  return matches.map((item) => item.replace(/^\s*\d+[\.)]\s+/, '').trim())
}

function extractBulletSteps(text: string): string[] {
  const lines = text.split('\n').map((line) => line.trim())
  const bullets = lines
    .filter((line) => /^[-•*]\s+/.test(line))
    .map((line) => line.replace(/^[-•*]\s+/, '').trim())
  return bullets.length >= 2 ? bullets : []
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 20)
}

export function parseUsageSteps(
  description: string,
  categorySlug?: string,
): string[] {
  const numbered = extractNumberedSteps(description)
  if (numbered.length >= 2) return numbered.slice(0, 6)

  const bullets = extractBulletSteps(description)
  if (bullets.length >= 2) return bullets.slice(0, 6)

  const sentences = splitSentences(description)
  if (sentences.length >= 2) {
    return sentences.slice(0, Math.min(5, sentences.length))
  }

  const fallback = categorySlug ? CATEGORY_FALLBACKS[categorySlug] : undefined

  if (fallback) return fallback

  return [
    'Confira as especificações do produto na descrição.',
    'Siga as orientações de uso do fabricante.',
    'Em caso de dúvida, fale com o assistente shopmax.',
  ]
}
