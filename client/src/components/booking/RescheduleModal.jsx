import { useState } from 'react';
import Button from '../common/Button';
import DatePicker from './DatePicker';
import TimeChipGrid from './TimeChipGrid';
import { useBookingSlots } from '../../hooks/useBookingSlots';

export default function RescheduleModal({ slug, eventTypeSlug, onConfirm, onClose }) {
  const { dates, selectedDate, slots, loading, loadSlots } = useBookingSlots(slug, eventTypeSlug);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pick = async (slot) => {
    setError('');
    setSubmitting(true);
    try {
      await onConfirm(slot);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not reschedule.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 w-full max-w-md flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-gray-800">Pick a new time</h3>
        <DatePicker dates={dates} selectedDate={selectedDate} onSelect={loadSlots} loading={loading && dates.length === 0} />
        <TimeChipGrid slots={slots} onSelect={pick} loading={(loading && dates.length > 0) || submitting} />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button variant="ghost" onClick={onClose} disabled={submitting}>
          Close
        </Button>
      </div>
    </div>
  );
}
