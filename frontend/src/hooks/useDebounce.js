import { useState, useEffect } from 'react';

export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Memasang timer (menahan perubahan)
    const handler = setTimeout(() => {
      setDebouncedValue(value);
}, delay);

    // Membersihkan timer jika value berubah lagi (user masih ngetik)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
