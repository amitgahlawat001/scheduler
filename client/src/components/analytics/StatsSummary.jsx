import Spinner from '../common/Spinner';

export default function StatsSummary({ stats, loading = false }) {
  if (loading) return <Spinner label="Loading analytics..." />;
  if (!stats) return null;

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
        <div className="text-gray-500 text-sm mt-1">Total bookings</div>
      </div>
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <div className="text-3xl font-bold text-gray-800">{Math.round(stats.noShowRate * 100)}%</div>
        <div className="text-gray-500 text-sm mt-1">No-show rate</div>
      </div>
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 sm:col-span-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">By event type</h4>
        {stats.byEventType.length === 0 ? (
          <p className="text-gray-500 text-sm">No bookings yet.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {stats.byEventType.map((e) => (
              <li key={e.eventTypeId} className="flex justify-between text-sm text-gray-600">
                <span>{e.name}</span>
                <span className="font-medium text-gray-800">{e.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
