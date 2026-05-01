"use client"

import * as React from "react"

type Theme = "dark"

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeProviderState = {
  theme: Theme
}

const initialState: ThemeProviderState = {
  theme: "dark",
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light")
    root.classList.add("dark")
  }, [])

  const value = {
    theme: "dark" as const,
  }

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
