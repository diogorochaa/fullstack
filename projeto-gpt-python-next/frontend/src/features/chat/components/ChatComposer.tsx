import { Button, FileInput, Group, Input } from '@mantine/core'
import { FileUp } from 'lucide-react'

type ChatComposerProps = {
  input: string
  selectedFile: File | null
  loading: boolean
  onInputChange: (value: string) => void
  onFileChange: (file: File | null) => void
  onSendMessage: () => Promise<void> | void
}

export function ChatComposer({
  input,
  selectedFile,
  loading,
  onInputChange,
  onFileChange,
  onSendMessage,
}: ChatComposerProps) {
  return (
    <Group mt="md" gap="sm" align="center" wrap="nowrap">
      <FileInput
        value={selectedFile}
        onChange={onFileChange}
        w={220}
        placeholder="Enviar arquivo"
        leftSection={<FileUp className="w-4 h-4 mr-2 text-gray-500" />}
        disabled={loading}
      />

      <Input
        value={input}
        onChange={(event) => onInputChange(event.target.value)}
        placeholder="Digite sua pergunta..."
        style={{ flex: 1 }}
        disabled={loading}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onSendMessage()
          }
        }}
      />

      <Button onClick={onSendMessage} variant="filled" loading={loading}>
        Enviar
      </Button>
    </Group>
  )
}
