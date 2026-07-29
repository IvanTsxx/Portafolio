import * as React from 'react'
import { Mail } from 'lucide-react'
import { Github } from '@/components/ui/svgs/github'
import { Linkedin } from '@/components/ui/svgs/linkedin'
import { X } from '@/components/ui/svgs/x'
import { IDENTITY } from '@/content/identity'

const LINKS = [
  {
    id: 'github',
    href: IDENTITY.socials.github,
    label: 'GitHub',
    Icon: Github,
  },
  {
    id: 'x',
    href: IDENTITY.socials.twitter,
    label: 'X',
    Icon: X,
  },
  {
    id: 'linkedin',
    href: IDENTITY.socials.linkedin,
    label: 'LinkedIn',
    Icon: Linkedin,
  },
  {
    id: 'email',
    href: `mailto:${IDENTITY.email}`,
    label: 'Email',
    Icon: Mail,
  },
] as const

export function SocialLinks({ className }: { className?: string }) {
  return (
    <nav className={className ?? 'portal-socials'} aria-label="Social links">
      {LINKS.map(({ id, href, label, Icon }) => (
        <a
          key={id}
          href={href}
          className="portal-social"
          target={id === 'email' ? undefined : '_blank'}
          rel={id === 'email' ? undefined : 'noreferrer'}
          aria-label={label}
        >
          <Icon aria-hidden className="portal-social-svg" />
        </a>
      ))}
    </nav>
  )
}
