import { type Socket, io } from 'socket.io-client'
import { env } from './env'

let socket: Socket | null = null

export function getSocket(namespace = '/events') {
  if (!socket) {
    socket = io(`${env.VITE_SOCKET_URL}${namespace}`, {
      autoConnect: false,
    })
  }

  return socket
}
