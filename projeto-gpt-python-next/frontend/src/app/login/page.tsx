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

import { loginAction } from '@/features/auth/actions'
import { useAuth } from '@/features/auth/context'

export default function LoginPage() {
  const router = useRouter()
  const { setSession, session, ready } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    setLoading(true)
    try {
      const data = await loginAction(email, password)
      setSession({ accessToken: data.accessToken, email: data.email })
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar.')
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
                Entrar
              </Title>
              <Text size="sm" c="dimmed" mt={4}>
                Acesse o DocMind com sua conta
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
                  placeholder="Sua senha"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <Button type="submit" fullWidth loading={loading} mt="xs">
                  Entrar
                </Button>
              </Stack>
            </form>

            <Divider label="ou" labelPosition="center" />

            <Text size="sm" ta="center" c="dimmed">
              Ainda nao tem conta?{' '}
              <Anchor component={Link} href="/register" fw={600}>
                Criar conta
              </Anchor>
            </Text>
          </Stack>
        </Paper>
      </Container>
    </Center>
  )
}
