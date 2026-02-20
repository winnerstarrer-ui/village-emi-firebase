import { useState, useCallback } from 'react';

// ============================================================
// TOAST HOOK
// ============================================================
export const useToast = () => {
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const show = useCallback((msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2200);
  }, []);
  return { toast, showToast: show };
};
