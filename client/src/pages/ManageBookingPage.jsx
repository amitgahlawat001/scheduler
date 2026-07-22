import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as publicApi from '../api/public.api';
import RescheduleModal from '../components/booking/RescheduleModal';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import NotFoundPage from './NotFoundPage';
import { utcToLocalLabel } from '../utils/timezone';

export default function ManageBookingPage() {
  const { cancelToken } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [message, setMessage] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const reload = () => {
    publicApi
      .getBookingByToken(cancelToken)
      .then(setBooking)
      .catch(() => setNotFound(true));
  };

  useEffect(reload, [cancelToken]);

  if (notFound) return <NotFoundPage />;
  if (!booking) return <Spinner full />;

  const cancel = async () => {
    setCancelling(true);
    try {
      await publicApi.cancelBookingByToken(cancelToken);
      setMessage('Booking cancelled.');
      reload();
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gradient-to-br from-brand-light/20 via-blue-50 to-brand/5 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-cardIn">
        <span className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-2xl mb-4">📅</span>

        <h2 className="text-xl font-semibold text-gray-800">{booking.eventTypeName}</h2>
        <p className="text-gray-600 mt-1">{utcToLocalLabel(booking.slotStartUTC)}</p>
        {booking.location?.value && (
          <p className="text-gray-500 text-sm mt-1">
            {booking.location.type}: {booking.location.value}
          </p>
        )}

        {message && (
          <p className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
            {message}
          </p>
        )}

        {booking.isCancelled ? (
          <p className="mt-6 text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 italic">
            This booking has been cancelled.
          </p>
        ) : (
          <div className="flex gap-2 mt-6">
            <Button onClick={() => setShowReschedule(true)}>Reschedule</Button>
            <Button variant="danger" onClick={cancel} disabled={cancelling}>
              {cancelling ? 'Cancelling...' : 'Cancel booking'}
            </Button>
          </div>
        )}
      </div>

      {showReschedule && (
        <RescheduleModal
          slug={booking.hostSlug}
          eventTypeSlug={booking.eventTypeSlug}
          onClose={() => setShowReschedule(false)}
          onConfirm={async (slot) => {
            const newBooking = await publicApi.rescheduleBooking(cancelToken, slot);
            navigate(`/bookings/${newBooking.cancelToken}`, { replace: true });
          }}
        />
      )}
    </div>
  );
}
