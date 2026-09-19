import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import api, { errMsg } from '../services/api';

// Generic data loader: cancels stale requests on cleanup / re-run
export default function useFetch(url, params, deps = []) {
  const [state, setState] = useState({ data: null, pagination: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);
  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!url) { setState({ data: null, pagination: null, loading: false, error: '' }); return undefined; }
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: '' }));
    api.get(url, { params, signal: controller.signal })
      .then((r) => setState({ data: r.data.data, pagination: r.data.pagination || null, loading: false, error: '' }))
      .catch((err) => { if (!axios.isCancel(err)) setState({ data: null, pagination: null, loading: false, error: errMsg(err) }); });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, tick, ...deps]);

  return { ...state, refetch };
}
