import { createContext, useContext } from 'react'

export const DialogContext = createContext(null)

export function useDialog() {
  const contexto = useContext(DialogContext)
  if (!contexto) throw new Error('useDialog deve ser usado dentro de DialogProvider')
  return contexto
}
