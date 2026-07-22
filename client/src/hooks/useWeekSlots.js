import { useState, useEffect, useMemo, useCallback } from 'react';
import * as publicApi from '../api/public.api';

const WINDOW_SIZE = 5;

export function useWeekSlots(slug, eventTypeSlug, dates) {
  const [weekStart, setWeekStart] = useState(0);
  const [slotsByDate, setSlotsByDate] = useState({});
  const [loading, setLoading] = useState(false);

  const windowDates = useMemo(() => dates.slice(weekStart, weekStart + WINDOW_SIZE), [dates, weekStart]);
  const windowKey = windowDates.join(',');

  useEffect(() => {
    if (!slug || !eventTypeSlug || windowDates.length === 0) return;
    setLoading(true);
    Promise.all(
      windowDates.map((date) => publicApi.getAvailableChips(slug, eventTypeSlug, date).then((slots) => [date, slots]))
    )
      .then((entries) => {
        setSlotsByDate((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, eventTypeSlug, windowKey]);

  const next = useCallback(() => {
    setWeekStart((w) => Math.min(w + WINDOW_SIZE, Math.max(dates.length - WINDOW_SIZE, 0)));
  }, [dates.length]);

  const prev = useCallback(() => {
    setWeekStart((w) => Math.max(w - WINDOW_SIZE, 0));
  }, []);

  return {
    windowDates,
    slotsByDate,
    loading,
    next,
    prev,
    hasPrev: weekStart > 0,
    hasNext: weekStart + WINDOW_SIZE < dates.length
  };
}
