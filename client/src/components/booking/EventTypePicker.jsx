import { Link } from 'react-router-dom';
import Spinner from '../common/Spinner';

export default function EventTypePicker({ slug, eventTypes, loading = false }) {
  if (loading) return <Spinner label="Loading booking options..." />;
  if (eventTypes.length === 0) {
    return <p className="text-gray-500 text-sm mt-4">No booking options available right now.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 mt-4">
      {eventTypes.map((et) => (
        <li
          key={et.id}
          className="border border-gray-100 bg-gray-50 rounded-xl p-3 hover:shadow-sm hover:border-brand/40 transition-shadow"
        >
          <Link to={`/${slug}/${et.slug}`} className="no-underline text-gray-800">
            <strong>{et.name}</strong>
            <span className="text-gray-600"> — {et.durationMinutes} min</span>
            {et.description && <p className="text-gray-500 text-sm mt-1">{et.description}</p>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
