import { useState } from 'react';
import Button from '../common/Button';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const inputClass = 'border border-gray-300 rounded-md px-2 py-1.5 text-sm';

export default function WeeklyRuleEditor({ rules, onAdd, onRemove }) {
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTimeUTC, setStartTimeUTC] = useState('09:00');
  const [endTimeUTC, setEndTimeUTC] = useState('17:00');
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!startTimeUTC || !endTimeUTC) {
      setError('Start and end time are required.');
      return;
    }
    if (endTimeUTC <= startTimeUTC) {
      setError('End time must be after start time.');
      return;
    }

    try {
      await onAdd({ dayOfWeek: Number(dayOfWeek), startTimeUTC, endTimeUTC });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to add rule.');
    }
  };

  return (
    <div>
      <h3 className="font-medium text-gray-700 mb-2">Recurring weekly availability (UTC)</h3>
      <form onSubmit={submit} noValidate className="flex gap-2 items-center mb-3 flex-wrap">
        <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} className={inputClass}>
          {DAYS.map((d, i) => (
            <option key={i} value={i}>
              {d}
            </option>
          ))}
        </select>
        <input type="time" value={startTimeUTC} onChange={(e) => setStartTimeUTC(e.target.value)} className={inputClass} />
        <span className="text-gray-500">to</span>
        <input type="time" value={endTimeUTC} onChange={(e) => setEndTimeUTC(e.target.value)} className={inputClass} />
        <Button type="submit">Add</Button>
      </form>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {rules.length === 0 && <p className="text-gray-500 text-sm mb-2">No recurring availability set yet.</p>}

      <div className="flex flex-wrap gap-3">
        {rules.map((rule) => (
          <div
            key={rule._id}
            className="relative flex items-center bg-white border border-gray-200 rounded-full pl-4 pr-3 py-2 text-sm text-gray-700 shadow-sm"
          >
            {DAYS[rule.dayOfWeek]}: {rule.startTimeUTC}–{rule.endTimeUTC} UTC
            <button
              onClick={() => onRemove(rule._id)}
              aria-label="Remove rule"
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
