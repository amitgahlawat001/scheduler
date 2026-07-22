import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import * as publicApi from '../api/public.api';
import EventTypePicker from '../components/booking/EventTypePicker';
import Spinner from '../components/common/Spinner';
import NotFoundPage from './NotFoundPage';

export default function PublicProfilePage() {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi
      .getPublicProfile(slug)
      .then(setProfile)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (notFound) return <NotFoundPage />;
  if (loading) return <Spinner full label="Loading profile..." />;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-brand-light/20 via-blue-50 to-brand/5 px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-cardIn">
        {profile.photoUrl && (
          <img src={profile.photoUrl} alt={profile.hostDisplayName} className="w-20 h-20 rounded-full object-cover" />
        )}
        <h2 className="text-xl font-semibold text-gray-800 mt-3">{profile.hostDisplayName}</h2>
        {profile.bio && <p className="text-gray-500 mt-1">{profile.bio}</p>}
        <EventTypePicker slug={slug} eventTypes={profile.eventTypes} loading={loading} />
      </div>
    </div>
  );
}
