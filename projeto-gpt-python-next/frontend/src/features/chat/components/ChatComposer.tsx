import { Button, FileInput, Group, Input, Stack, Text } from "@mantine/core";
import { FileUp } from "lucide-react";

type ChatComposerProps = {
  input: string;
  selectedFile: File | null;
  loading: boolean;
  feedbackMessage: string | null;
  onInputChange: (value: string) => void;
  onFileChange: (file: File | null) => void;
  onSendMessage: () => Promise<void> | void;
};

export function ChatComposer({
  input,
  selectedFile,
  loading,
  feedbackMessage,
  onInputChange,
  onFileChange,
  onSendMessage,
}: ChatComposerProps) {
  return (
    <Stack mt="md" gap={6}>
      <Group gap="sm" align="center" wrap="nowrap">
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
            if (event.key === "Enter") {
              onSendMessage();
            }
          }}
        />

        <Button onClick={onSendMessage} variant="filled" loading={loading}>
          Enviar
        </Button>
      </Group>

      {feedbackMessage && (
        <Text size="sm" c="red.4" role="alert">
          {feedbackMessage}
        </Text>
      )}
    </Stack>
  );
}
