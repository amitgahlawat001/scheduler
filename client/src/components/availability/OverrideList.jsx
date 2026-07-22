import { useState } from 'react';
import Button from '../common/Button';

const inputClass = 'border border-gray-300 rounded-md px-2 py-1.5 text-sm';

export default function OverrideList({ overrides, onAdd, onRemove }) {
  const [date, setDate] = useState('');
  const [type, setType] = useState('unavailable');
  const [startTimeUTC, setStartTimeUTC] = useState('');
  const [endTimeUTC, setEndTimeUTC] = useState('');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!date) {
      setError('Date is required.');
      return;
    }
    if (type === 'extra_hours') {
      if (!startTimeUTC || !endTimeUTC) {
        setError('Start and end time are required.');
        return;
      }
      if (endTimeUTC <= startTimeUTC) {
        setError('End time must be after start time.');
        return;
      }
    }

    try {
      const payload = { date, type };
      if (type === 'extra_hours') {
        payload.startTimeUTC = new Date(`${date}T${startTimeUTC}:00.000Z`).toISOString();
        payload.endTimeUTC = new Date(`${date}T${endTimeUTC}:00.000Z`).toISOString();
      }
      await onAdd(payload);
      setDate('');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to add override.');
    }
  };

  return (
    <div className="mt-6">
      <h3 className="font-medium text-gray-700 mb-2">Date-specific overrides</h3>
      <form onSubmit={submit} noValidate className="flex gap-2 items-center mb-3 flex-wrap">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
        <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
          <option value="unavailable">Block this date</option>
          <option value="extra_hours">Add extra hours</option>
        </select>
        {type === 'extra_hours' && (
          <>
            <input type="time" value={startTimeUTC} onChange={(e) => setStartTimeUTC(e.target.value)} className={inputClass} />
            <span className="text-gray-500">to</span>
            <input type="time" value={endTimeUTC} onChange={(e) => setEndTimeUTC(e.target.value)} className={inputClass} />
          </>
        )}
        <Button type="submit">Add</Button>
      </form>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {overrides.length === 0 && <p className="text-gray-500 text-sm mb-2">No date-specific overrides yet.</p>}

      <div className="flex flex-wrap gap-3">
        {overrides.map((o) => (
          <div
            key={o._id}
            className="relative flex items-center bg-white border border-gray-200 rounded-full pl-4 pr-3 py-2 text-sm text-gray-700 shadow-sm"
          >
            {o.date}: {o.type === 'unavailable' ? 'Blocked' : 'Extra hours'}
            <button
              onClick={() => onRemove(o._id)}
              aria-label="Remove override"
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs leading-none flex items-center justify-center border-2 border-white hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
