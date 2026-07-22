import { useState, useEffect, useCallback } from 'react';
import * as availabilityApi from '../api/availability.api';

export function useAvailability() {
  const [rules, setRules] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [r, o] = await Promise.all([availabilityApi.listRules(), availabilityApi.listOverrides()]);
      setRules(r);
      setOverrides(o);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const addRule = async (payload) => {
    await availabilityApi.createRule(payload);
    await reload();
  };

  const removeRule = async (id) => {
    await availabilityApi.deleteRule(id);
    await reload();
  };

  const addOverride = async (payload) => {
    await availabilityApi.createOverride(payload);
    await reload();
  };

  const removeOverride = async (id) => {
    await availabilityApi.deleteOverride(id);
    await reload();
  };

  return { rules, overrides, loading, addRule, removeRule, addOverride, removeOverride, reload };
}
