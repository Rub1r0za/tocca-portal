import { Home, Route, Sparkles, Compass, UtensilsCrossed, Flower2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** Single source of truth for the guest app sections. `key` maps to messages.mobileNav. */
export const navItems: { key: string; path: string; Icon: LucideIcon }[] = [
  { key: 'guestView', path: '/dashboard', Icon: Home },
  { key: 'timeline', path: '/timeline', Icon: Route },
  { key: 'journey', path: '/journey', Icon: Sparkles },
  { key: 'activities', path: '/activities', Icon: Compass },
  { key: 'meals', path: '/meals', Icon: UtensilsCrossed },
  { key: 'wellness', path: '/wellness', Icon: Flower2 },
]
