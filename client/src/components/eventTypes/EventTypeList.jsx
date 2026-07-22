import Button from '../common/Button';
import Spinner from '../common/Spinner';

export default function EventTypeList({ eventTypes, onRemove, loading = false }) {
  if (loading) return <Spinner label="Loading event types..." />;
  if (eventTypes.length === 0) return <p className="text-gray-500 text-sm">No event types yet.</p>;

  return (
    <ul className="flex flex-col gap-2">
      {eventTypes.map((et) => (
        <li
          key={et._id}
          className="flex justify-between items-center gap-3 border border-gray-100 bg-gray-50 rounded-xl p-4"
        >
          <div className="min-w-0">
            <strong style={{ color: et.color }}>{et.name}</strong>
            <span className="text-gray-600"> — {et.durationMinutes} min</span>
            <div className="text-xs text-gray-500">/{et.slug}</div>
          </div>
          <Button variant="danger" onClick={() => onRemove(et._id)}>
            Delete
          </Button>
        </li>
      ))}
    </ul>
  );
}
