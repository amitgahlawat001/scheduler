import { useState, useEffect } from 'react';
import * as analyticsApi from '../api/analytics.api';
import StatsSummary from '../components/analytics/StatsSummary';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    analyticsApi.getStats({}).then(setStats);
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">Analytics (last 30 days)</h2>
      <StatsSummary stats={stats} />
    </div>
  );
}
