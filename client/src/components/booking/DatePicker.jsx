export default function DatePicker({ dates, selectedDate, onSelect }) {
  if (dates.length === 0) return <p className="text-gray-500 text-sm">No available dates in the booking window.</p>;

  return (
    <div className="flex gap-2 flex-wrap">
      {dates.map((date) => (
        <button
          key={date}
          onClick={() => onSelect(date)}
          className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
            date === selectedDate
              ? 'border-brand bg-brand text-white shadow-sm'
              : 'border-gray-200 bg-white text-gray-700 hover:border-brand hover:text-brand'
          }`}
        >
          {date}
        </button>
      ))}
    </div>
  );
}
