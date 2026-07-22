import { useState, useEffect, useCallback } from 'react';
import * as bookingsApi from '../api/bookings.api';
import { useEventTypes } from '../hooks/useEventTypes';
import EventTypeForm from '../components/eventTypes/EventTypeForm';
import EventTypeList from '../components/eventTypes/EventTypeList';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import { utcToLocalLabel } from '../utils/timezone';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [upcoming, setUpcoming] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { eventTypes, loading: eventTypesLoading, create, remove } = useEventTypes();
  const [bookingsLoading, setBookingsLoading] = useState(true);

  const reload = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const data = await bookingsApi.listBookings({ upcoming });
      setBookings(data.bookings);
    } finally {
      setBookingsLoading(false);
    }
  }, [upcoming]);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Bookings</h1>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Event types</h2>
          <Button variant="ghost" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Close' : '+ New event type'}
          </Button>
        </div>
        {showForm && (
          <div className="mb-6">
            <EventTypeForm
              onCreate={async (payload) => {
                await create(payload);
                setShowForm(false);
              }}
            />
          </div>
        )}
        <EventTypeList eventTypes={eventTypes} onRemove={remove} loading={eventTypesLoading} />
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Your bookings</h2>
          <div className="flex gap-2">
            <Button variant={upcoming ? 'primary' : 'ghost'} onClick={() => setUpcoming(true)}>
              Upcoming
            </Button>
            <Button variant={!upcoming ? 'primary' : 'ghost'} onClick={() => setUpcoming(false)}>
              Past
            </Button>
          </div>
        </div>

        {bookingsLoading ? (
          <Spinner label="Loading bookings..." />
        ) : bookings.length === 0 && (
          <p className="text-gray-500 text-sm">{upcoming ? 'No upcoming bookings.' : 'No past bookings.'}</p>
        )}

        <ul className="space-y-3">
          {bookings.map((b) => (
            <li
              key={b.id}
              className="border border-gray-100 bg-gray-50 rounded-xl p-4 hover:shadow-sm transition-shadow"
            >
              <div className="text-gray-800">
                <strong>{b.eventTypeName}</strong> — {utcToLocalLabel(b.slotStartUTC)}
              </div>
              <div className="text-gray-500 text-sm">
                {b.visitorName} ({b.visitorEmail})
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await bookingsApi.setNoShow(b.id, !b.noShow);
                    reload();
                  }}
                >
                  {b.noShow ? 'Unmark no-show' : 'Mark no-show'}
                </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    await bookingsApi.cancelBooking(b.id);
                    reload();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
