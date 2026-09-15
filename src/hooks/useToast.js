import { useState } from 'react';

/**
 * Hook simples para o padrão Snackbar/Toast usado em vários componentes.
 */
export function useToast() {
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const showToast  = (message, severity = 'success') => setToast({ open: true, message, severity });
  const closeToast = () => setToast(t => ({ ...t, open: false }));
  return { toast, showToast, closeToast };
}
