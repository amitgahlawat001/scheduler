import { Outlet } from 'react-router-dom';
import Header from './Header';
import PageTransition from './PageTransition';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PageTransition>
        <Outlet />
      </PageTransition>
    </div>
  );
}
