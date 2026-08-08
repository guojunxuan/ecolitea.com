'use client'

import React, { createContext, use } from 'react'

import type { Theme, ThemePreferenceContextType } from './types'

const defaultTheme: Theme = 'light'

const initialContext: ThemePreferenceContextType = {
  theme: defaultTheme,
}

const ThemePreferenceContext = createContext(initialContext)

export const ThemePreferenceProvider: React.FC<{
  children?: React.ReactNode
}> = ({ children }) => {
  return <ThemePreferenceContext value={initialContext}>{children}</ThemePreferenceContext>
}

export const useThemePreference = (): ThemePreferenceContextType => use(ThemePreferenceContext)
