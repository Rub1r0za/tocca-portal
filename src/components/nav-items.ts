import { Home, Route, Sparkles, Compass, UtensilsCrossed, Flower2, Luggage, Languages } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { MEALS_ENABLED, TIMELINE_ENABLED } from '@/lib/features'

export type NavItem = { key: string; path: string; Icon: LucideIcon }

/**
 * Las secciones del portal. `key` apunta a messages.mobileNav.
 *
 * La barra de abajo se queda con las cuatro principales; el resto vive en el
 * menú lateral para no apretar los iconos.
 */
export const navItems: NavItem[] = [
  { key: 'guestView', path: '/dashboard', Icon: Home },
  ...(TIMELINE_ENABLED ? [{ key: 'timeline', path: '/timeline', Icon: Route }] : []),
  { key: 'journey', path: '/journey', Icon: Sparkles },
  { key: 'activities', path: '/activities', Icon: Compass },
  ...(MEALS_ENABLED ? [{ key: 'meals', path: '/meals', Icon: UtensilsCrossed }] : []),
  { key: 'wellness', path: '/wellness', Icon: Flower2 },
]

/** La barra de abajo más lo que solo se consulta de vez en cuando. */
export const menuItems: NavItem[] = [
  ...navItems,
  { key: 'beforeYouGo', path: '/before-you-go', Icon: Luggage },
  { key: 'phrases', path: '/phrases', Icon: Languages },
]
