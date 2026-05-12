'use client'

import {
  Anchor,
  Button,
  Center,
  Container,
  Divider,
  Loader,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { registerAction } from '@/features/auth/actions'
import { useAuth } from '@/features/auth/context'

export default function RegisterPage() {
  const router = useRouter()
  const { setSession, session, ready } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (ready && session) {
      router.replace('/')
    }
  }, [ready, session, router])

  if (!ready) {
    return (
      <Center mih="100vh" bg="#09090b">
        <Loader color="gray" />
      </Center>
    )
  }

  if (ready && session) {
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas nao coincidem.')
      return
    }
    setLoading(true)
    try {
      const data = await registerAction(email, password)
      setSession({ accessToken: data.accessToken, email: data.email })
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Center mih="100vh" bg="#09090b" p="md">
      <Container size={420} w="100%">
        <Paper radius="lg" p="xl" withBorder shadow="md" bg="dark.8" style={{ borderColor: '#27272a' }}>
          <Stack gap="lg">
            <div>
              <Title order={2} c="gray.0" fw={700}>
                Criar conta
              </Title>
              <Text size="sm" c="dimmed" mt={4}>
                Cadastre-se para usar o DocMind
              </Text>
            </div>

            <form onSubmit={handleSubmit}>
              <Stack gap="md">
                {error && (
                  <Text size="sm" c="red.4" role="alert">
                    {error}
                  </Text>
                )}
                <TextInput
                  label="E-mail"
                  placeholder="voce@empresa.com"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <PasswordInput
                  label="Senha"
                  placeholder="Minimo 8 caracteres"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <PasswordInput
                  label="Confirmar senha"
                  placeholder="Repita a senha"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  disabled={loading}
                />
                <Button type="submit" fullWidth loading={loading} mt="xs">
                  Cadastrar
                </Button>
              </Stack>
            </form>

            <Divider label="ou" labelPosition="center" />

            <Text size="sm" ta="center" c="dimmed">
              Ja tem conta?{' '}
              <Anchor component={Link} href="/login" fw={600}>
                Entrar
              </Anchor>
            </Text>
          </Stack>
        </Paper>
      </Container>
    </Center>
  )
}
