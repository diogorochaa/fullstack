import type { LucideIcon } from "lucide-react"
import {
  Archive,
  File,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Presentation,
} from "lucide-react"

export type AttachmentKind =
  | "image"
  | "pdf"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "code"
  | "archive"
  | "audio"
  | "video"
  | "file"

export const MAX_ATTACHMENTS = 8
export const MAX_VISION_IMAGES = 4
export const MAX_FILE_BYTES = 8 * 1024 * 1024
export const MAX_TEXT_EXTRACT_BYTES = 48_000

/** Input `accept` — formatos comuns para chat e indexação. */
export const CHAT_FILE_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  ".pdf",
  "application/pdf",
  ".txt",
  ".md",
  ".csv",
  ".json",
  ".xml",
  ".html",
  ".htm",
  ".doc",
  ".docx",
  ".odt",
  ".rtf",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".zip",
  ".mp3",
  ".wav",
  ".mp4",
  ".webm",
  ".js",
  ".ts",
  ".tsx",
  ".jsx",
  ".py",
  ".java",
  ".c",
  ".cpp",
  ".cs",
  ".go",
  ".rs",
  ".yaml",
  ".yml",
].join(",")

const EXT_KIND: Record<string, AttachmentKind> = {
  pdf: "pdf",
  txt: "document",
  md: "document",
  markdown: "document",
  rtf: "document",
  doc: "document",
  docx: "document",
  odt: "document",
  csv: "spreadsheet",
  xls: "spreadsheet",
  xlsx: "spreadsheet",
  ppt: "presentation",
  pptx: "presentation",
  zip: "archive",
  rar: "archive",
  "7z": "archive",
  mp3: "audio",
  wav: "audio",
  ogg: "audio",
  mp4: "video",
  webm: "video",
  mov: "video",
  js: "code",
  ts: "code",
  tsx: "code",
  jsx: "code",
  py: "code",
  java: "code",
  c: "code",
  cpp: "code",
  cs: "code",
  go: "code",
  rs: "code",
  json: "code",
  xml: "code",
  html: "code",
  htm: "code",
  yaml: "code",
  yml: "code",
}

const KIND_META: Record<
  AttachmentKind,
  { label: string; icon: LucideIcon; chipClass: string; iconWrapClass: string }
> = {
  image: {
    label: "Imagem",
    icon: FileImage,
    chipClass: "bg-sky-500/10 text-sky-100 ring-sky-500/25",
    iconWrapClass: "bg-sky-600/30",
  },
  pdf: {
    label: "PDF",
    icon: FileText,
    chipClass: "bg-red-500/10 text-red-200 ring-red-500/20",
    iconWrapClass: "bg-red-600/30",
  },
  document: {
    label: "Documento",
    icon: FileText,
    chipClass: "bg-violet-500/10 text-violet-100 ring-violet-500/25",
    iconWrapClass: "bg-violet-600/30",
  },
  spreadsheet: {
    label: "Planilha",
    icon: FileSpreadsheet,
    chipClass: "bg-emerald-500/10 text-emerald-100 ring-emerald-500/25",
    iconWrapClass: "bg-emerald-600/30",
  },
  presentation: {
    label: "Apresentação",
    icon: Presentation,
    chipClass: "bg-amber-500/10 text-amber-100 ring-amber-500/25",
    iconWrapClass: "bg-amber-600/30",
  },
  code: {
    label: "Código",
    icon: FileCode,
    chipClass: "bg-cyan-500/10 text-cyan-100 ring-cyan-500/25",
    iconWrapClass: "bg-cyan-600/30",
  },
  archive: {
    label: "Arquivo compactado",
    icon: Archive,
    chipClass: "bg-orange-500/10 text-orange-100 ring-orange-500/25",
    iconWrapClass: "bg-orange-600/30",
  },
  audio: {
    label: "Áudio",
    icon: FileAudio,
    chipClass: "bg-pink-500/10 text-pink-100 ring-pink-500/25",
    iconWrapClass: "bg-pink-600/30",
  },
  video: {
    label: "Vídeo",
    icon: FileVideo,
    chipClass: "bg-indigo-500/10 text-indigo-100 ring-indigo-500/25",
    iconWrapClass: "bg-indigo-600/30",
  },
  file: {
    label: "Arquivo",
    icon: File,
    chipClass: "bg-muted text-muted-foreground ring-border",
    iconWrapClass: "bg-muted",
  },
}

export function getFileKind(file: File): AttachmentKind {
  if (file.type.startsWith("image/")) return "image"
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return "pdf"
  }
  if (file.type.startsWith("audio/")) return "audio"
  if (file.type.startsWith("video/")) return "video"

  const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
  return EXT_KIND[ext] ?? "file"
}

export function getAttachmentMeta(kind: AttachmentKind) {
  return KIND_META[kind]
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function attachmentA11yLabel(name: string, kind: AttachmentKind, size?: number): string {
  const meta = getAttachmentMeta(kind)
  const sizePart = size !== undefined ? `, ${formatFileSize(size)}` : ""
  return `${meta.label}: ${name}${sizePart}`
}

export function isIndexablePdf(file: File): boolean {
  return getFileKind(file) === "pdf"
}

export function isVisionImage(file: File): boolean {
  return getFileKind(file) === "image"
}

export function isTextExtractable(file: File): boolean {
  const kind = getFileKind(file)
  if (kind === "code" || kind === "document") {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? ""
    return ["txt", "md", "markdown", "csv", "json", "xml", "html", "htm", "yaml", "yml"].includes(
      ext,
    )
  }
  return kind === "spreadsheet" && file.name.toLowerCase().endsWith(".csv")
}
