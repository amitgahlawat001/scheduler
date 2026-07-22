import { useState, useMemo } from 'react';
import { utcToLocalTime, dateHeaderParts, monthYearLabel } from '../../utils/timezone';

const INITIAL_ROWS = 5;

export default function WeekSlotGrid({ dates, slotsByDate, loading, hasPrev, hasNext, onPrev, onNext, selectedSlot, onSelect }) {
  const [showAll, setShowAll] = useState(false);

  const timeRows = useMemo(() => {
    const set = new Set();
    dates.forEach((date) => (slotsByDate[date] || []).forEach((iso) => set.add(utcToLocalTime(iso))));
    return Array.from(set).sort();
  }, [dates, slotsByDate]);

  if (dates.length === 0) {
    return <p className="text-gray-500 text-sm py-6 text-center">No available dates in the booking window.</p>;
  }

  const visibleRows = showAll ? timeRows : timeRows.slice(0, INITIAL_ROWS);
  const gridCols = { gridTemplateColumns: `repeat(${dates.length}, minmax(0, 1fr))` };

  const findSlot = (date, timeLabel) => (slotsByDate[date] || []).find((iso) => utcToLocalTime(iso) === timeLabel);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="w-8 h-8 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:border-brand hover:text-brand disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-colors"
        >
          ‹
        </button>
        <span className="font-medium text-gray-700 text-sm">{monthYearLabel(dates[0])}</span>
        <button
          onClick={onNext}
          disabled={!hasNext}
          className="w-8 h-8 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center hover:border-brand hover:text-brand disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500 transition-colors"
        >
          ›
        </button>
      </div>

      <div className="grid gap-1" style={gridCols}>
        {dates.map((date) => {
          const { weekday, day } = dateHeaderParts(date);
          return (
            <div key={date} className="text-center pb-2 border-b border-gray-100">
              <div className="text-xs text-gray-400">{weekday}</div>
              <div className="text-sm font-semibold text-gray-700">{day}</div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm py-6 text-center">Loading times…</p>
      ) : timeRows.length === 0 ? (
        <p className="text-gray-500 text-sm py-6 text-center">No slots left in this window — try another week.</p>
      ) : (
        <div className="grid gap-1.5 mt-2" style={gridCols}>
          {visibleRows.flatMap((timeLabel) =>
            dates.map((date) => {
              const iso = findSlot(date, timeLabel);
              const isSelected = iso && iso === selectedSlot;
              return iso ? (
                <button
                  key={`${date}-${timeLabel}`}
                  onClick={() => onSelect(iso)}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                    isSelected
                      ? 'border-brand bg-brand text-white shadow-sm'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-brand hover:text-brand'
                  }`}
                >
                  {timeLabel}
                </button>
              ) : (
                <span
                  key={`${date}-${timeLabel}`}
                  className="px-2 py-1.5 rounded-md text-xs text-gray-300 border border-transparent text-center select-none"
                >
                  {timeLabel}
                </span>
              );
            })
          )}
        </div>
      )}

      {!showAll && timeRows.length > INITIAL_ROWS && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full text-center text-brand text-sm font-medium mt-4 hover:underline"
        >
          Show more times ⌄
        </button>
      )}
    </div>
  );
}
