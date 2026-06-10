import { useState, useCallback } from 'react';

export function useGroq(asyncFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [data, setData]       = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn(...args);
      setData(result);
      return result;
    } catch (e) {
      const msg = e?.response?.data?.error?.message || e?.message || 'Unknown error';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [asyncFn]);

  return { loading, error, data, execute };
}
