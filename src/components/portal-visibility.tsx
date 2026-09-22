'use client'

import { createContext, useContext } from 'react'

const Visibility = createContext({ wellness: true, activities: true })
export const PortalVisibilityProvider = Visibility.Provider
export const usePortalVisibility = () => useContext(Visibility)
