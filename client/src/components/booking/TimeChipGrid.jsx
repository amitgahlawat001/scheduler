import { utcToLocalLabel } from '../../utils/timezone';

export default function TimeChipGrid({ slots, onSelect }) {
  if (slots.length === 0) return <p className="text-gray-500 text-sm">No slots left on this date — pick another.</p>;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => (
        <button
          key={slot}
          onClick={() => onSelect(slot)}
          className="px-2.5 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:border-brand hover:bg-brand/5 hover:text-brand transition-colors"
        >
          {utcToLocalLabel(slot)}
        </button>
      ))}
    </div>
  );
}
