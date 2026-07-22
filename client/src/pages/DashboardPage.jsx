import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAvailability } from '../hooks/useAvailability';
import { useEventTypes } from '../hooks/useEventTypes';
import WeeklyRuleEditor from '../components/availability/WeeklyRuleEditor';
import OverrideList from '../components/availability/OverrideList';
import StatsSummary from '../components/analytics/StatsSummary';
import * as availabilityApi from '../api/availability.api';
import * as bookingsApi from '../api/bookings.api';
import * as analyticsApi from '../api/analytics.api';
import { utcToLocalLabel } from '../utils/timezone';

const EVENT_COLORS = ['bg-brand/10 text-brand', 'bg-emerald-50 text-emerald-600', 'bg-amber-50 text-amber-600'];

export default function DashboardPage() {
  const { user } = useAuth();
  const { rules, overrides, addRule, removeRule, addOverride, removeOverride } = useAvailability();
  const { eventTypes } = useEventTypes();
  const [bookingUrl, setBookingUrl] = useState('');
  const [upcoming, setUpcoming] = useState([]);
  const [stats, setStats] = useState(null);

  const loadUpcoming = useCallback(() => {
    bookingsApi.listBookings({ upcoming: true }).then((data) => setUpcoming(data.bookings.slice(0, 5)));
  }, []);

  useEffect(() => {
    loadUpcoming();
  }, [loadUpcoming]);

  useEffect(() => {
    analyticsApi.getStats({}).then(setStats);
  }, []);

  const handleGenerateLink = async () => {
    const data = await availabilityApi.generateLink();
    setBookingUrl(data.bookingUrl);
  };

  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div>
          <p className="text-gray-500 text-sm">Hi, {user?.name}</p>
          <h1 className="text-2xl font-semibold text-gray-800">Welcome Back</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateLink}
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-500 hover:border-brand hover:text-brand transition-colors"
          >
            🔗 Get your booking link
          </button>
          <div className="w-9 h-9 rounded-full bg-brand text-white flex items-center justify-center text-sm font-semibold shrink-0">
            {initials}
          </div>
        </div>
      </div>

      {bookingUrl && (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-3 mb-6 flex items-center gap-2 text-sm">
          <span className="text-gray-500 shrink-0">Your link:</span>
          <a href={bookingUrl} className="text-brand underline break-all">
            {bookingUrl}
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left / main column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Promo banner */}
          <div className="rounded-2xl bg-gradient-to-r from-brand-dark via-brand to-brand-light text-white p-8 shadow-md relative overflow-hidden">
            <h2 className="text-xl font-semibold max-w-xs">No need to chase people down for a time slot</h2>
            <p className="text-white/80 mt-2 max-w-xs">Share one link. Clients pick a time that works and book themselves in.</p>
            <span className="absolute right-6 bottom-4 text-6xl opacity-20">📅</span>
          </div>

          {/* Analytics */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Analytics (last 30 days)</h2>
            <StatsSummary stats={stats} />
          </section>

          {/* Availability */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Availability</h2>
            <WeeklyRuleEditor rules={rules} onAdd={addRule} onRemove={removeRule} />
            <OverrideList overrides={overrides} onAdd={addOverride} onRemove={removeOverride} />
          </section>
        </div>

        {/* Right column: upcoming appointments + event types */}
        <div className="flex flex-col gap-6">
          <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h2>
              <Link to="/bookings" className="text-sm text-emerald-600 font-medium hover:underline">
                View All →
              </Link>
            </div>
            {upcoming.length === 0 && <p className="text-gray-500 text-sm">Nothing scheduled yet.</p>}
            <ul className="flex flex-col gap-2">
              {upcoming.map((b, i) => {
                const d = new Date(b.slotStartUTC);
                const weekday = d.toLocaleDateString(undefined, { weekday: 'short' });
                const day = d.getDate();
                return (
                  <li
                    key={b.id}
                    className={`flex items-center gap-3 rounded-xl p-3 ${i === 0 ? 'bg-rose-50' : 'bg-gray-50'}`}
                  >
                    <div className="flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-white shadow-sm shrink-0">
                      <span className="text-[10px] text-gray-400 leading-none">{weekday}</span>
                      <span className="text-sm font-semibold text-gray-800 leading-none mt-0.5">{day}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{b.eventTypeName}</p>
                      <p className="text-xs text-gray-500">{utcToLocalLabel(b.slotStartUTC)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>

          {/* Event types overview */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Your event types</h2>
              <Link to="/bookings" className="text-sm text-emerald-600 font-medium hover:underline">
                Manage →
              </Link>
            </div>
            {eventTypes.length === 0 && (
              <p className="text-gray-500 text-sm">
                No event types yet.{' '}
                <Link to="/bookings" className="text-brand hover:underline">
                  Create one
                </Link>
                .
              </p>
            )}
            <div className="flex flex-col gap-3">
              {eventTypes.map((et, i) => (
                <div key={et._id} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
                  <span
                    className={`w-fit text-xs font-medium px-2 py-0.5 rounded-full ${EVENT_COLORS[i % EVENT_COLORS.length]}`}
                  >
                    {et.durationMinutes} min
                  </span>
                  <strong className="text-gray-800">{et.name}</strong>
                  <span className="text-xs text-gray-400">/{et.slug}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
