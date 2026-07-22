import { useState, useEffect, useCallback } from 'react';
import * as eventTypesApi from '../api/eventTypes.api';

export function useEventTypes() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setEventTypes(await eventTypesApi.listEventTypes());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = async (payload) => {
    await eventTypesApi.createEventType(payload);
    await reload();
  };

  const update = async (id, payload) => {
    await eventTypesApi.updateEventType(id, payload);
    await reload();
  };

  const remove = async (id) => {
    await eventTypesApi.deleteEventType(id);
    await reload();
  };

  return { eventTypes, loading, create, update, remove, reload };
}
