import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

export function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <div className={`toast ${toast.type}`}>
      {toast.type === 'success'
        ? <CheckCircle size={18} />
        : <XCircle size={18} />}
      {toast.message}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  return { toast, showToast };
}
