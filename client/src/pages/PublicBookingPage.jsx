import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as publicApi from '../api/public.api';
import { useWeekSlots } from '../hooks/useWeekSlots';
import WeekSlotGrid from '../components/booking/WeekSlotGrid';
import BookingConfirmModal from '../components/booking/BookingConfirmModal';
import Spinner from '../components/common/Spinner';
import NotFoundPage from './NotFoundPage';

export default function PublicBookingPage() {
  const { slug, eventTypeSlug } = useParams();
  const [eventType, setEventType] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [dates, setDates] = useState([]);
  const [datesLoading, setDatesLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmed, setConfirmed] = useState(null);

  const { windowDates, slotsByDate, loading, next, prev, hasNext, hasPrev } = useWeekSlots(slug, eventTypeSlug, dates);

  useEffect(() => {
    publicApi
      .getEventTypeDetail(slug, eventTypeSlug)
      .then(setEventType)
      .catch(() => setNotFound(true));
    publicApi.getAvailableDates(slug, eventTypeSlug).then(setDates).finally(() => setDatesLoading(false));
  }, [slug, eventTypeSlug]);

  if (notFound) return <NotFoundPage />;
  if (!eventType) return <Spinner />;

  if (confirmed) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gradient-to-br from-brand-light/30 via-blue-50 to-brand/10 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center space-y-3 animate-cardIn">
          <h2 className="text-xl font-semibold text-gray-800">Booking confirmed</h2>
          <p className="text-gray-600">You're all set for {new Date(confirmed.slotStartUTC).toLocaleString()}.</p>
          {confirmed.location?.value && <p className="text-gray-600">{confirmed.location.type}: {confirmed.location.value}</p>}
          <Link to={`/bookings/${confirmed.cancelToken}`} className="text-brand underline">
            Manage this booking
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-brand-light/20 via-blue-50 to-brand/5 px-4 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-6 animate-cardIn">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{eventType.name}</h2>
          <p className="text-gray-500">{eventType.durationMinutes} min</p>
          {eventType.description && <p className="text-gray-600 mt-1">{eventType.description}</p>}
        </div>

        <div>
          <h3 className="font-medium text-gray-700 mb-2">Pick a time</h3>
          <WeekSlotGrid
            dates={windowDates}
            slotsByDate={slotsByDate}
            loading={loading || datesLoading}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={prev}
            onNext={next}
            selectedSlot={selectedSlot}
            onSelect={setSelectedSlot}
          />
        </div>
      </div>

      {selectedSlot && (
        <BookingConfirmModal
          slot={selectedSlot}
          eventType={eventType}
          onClose={() => setSelectedSlot(null)}
          onConfirm={async (payload) => {
            const booking = await publicApi.createBooking(slug, eventTypeSlug, payload);
            setConfirmed(booking);
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
}
