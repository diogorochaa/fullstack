import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  getAvatarColor,
  getInitials,
} from '@/features/account/lib/avatar-color'
import { cn } from '@/lib/utils'
import type { User } from '@/types/auth'

type UserAvatarProps = {
  user: Pick<User, 'id' | 'name'>
  className?: string
  size?: 'sm' | 'md'
}

export function UserAvatar({ user, className, size = 'md' }: UserAvatarProps) {
  const sizeClass = size === 'sm' ? 'size-8 text-xs' : 'size-9 text-sm'

  return (
    <Avatar className={cn(sizeClass, className)}>
      <AvatarFallback
        className={cn('font-semibold', getAvatarColor(user.id))}
        aria-hidden
      >
        {getInitials(user.name)}
      </AvatarFallback>
    </Avatar>
  )
}
