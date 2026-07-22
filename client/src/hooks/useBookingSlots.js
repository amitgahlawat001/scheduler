import { useState, useEffect, useCallback } from 'react';
import * as publicApi from '../api/public.api';

export function useBookingSlots(slug, eventTypeSlug) {
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug || !eventTypeSlug) return;
    setLoading(true);
    publicApi
      .getAvailableDates(slug, eventTypeSlug)
      .then((d) => {
        setDates(d);
        if (d.length > 0) setSelectedDate(d[0]);
      })
      .finally(() => setLoading(false));
  }, [slug, eventTypeSlug]);

  const loadSlots = useCallback(
    async (date) => {
      setSelectedDate(date);
      setLoading(true);
      try {
        setSlots(await publicApi.getAvailableChips(slug, eventTypeSlug, date));
      } finally {
        setLoading(false);
      }
    },
    [slug, eventTypeSlug]
  );

  useEffect(() => {
    if (selectedDate) loadSlots(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  return { dates, selectedDate, slots, loading, loadSlots };
}
