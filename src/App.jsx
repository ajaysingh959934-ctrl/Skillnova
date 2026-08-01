// ----------------------------------------------------------------
//  App.jsx — Root component
//  Hydrates auth, mounts the right app (admin/mentor/intern)
//  based on the authenticated user's role. Mounts the global
//  AIAssistant widget so every logged-in user has access.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
import { useEffect } from 'react';
// ----------------------------------------------------------------
import { useEffect, useState } from 'react';
import { useAuthStore } from './lib/auth';
import { connectSocket, disconnectSocket } from './lib/socket';
import AuthGate from './AuthGate';
import UserApp from './user/App';
import AdminApp from './admin/App';
import MentorApp from './mentor/App';
import LoaderScreen from './shared/components/LoaderScreen';
import AIAssistant from './shared/components/AIAssistant';

const App = () => {
  const { user, step, hydrated, hydrate } = useAuthStore();
  const { user, step, accessToken, hydrated, hydrate } = useAuthStore();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (user?.id && step === 'authenticated') {
      connectSocket(accessToken);
      return;
    }

  if (!hydrated) return <LoaderScreen label="Initialising SkillNovaâ€¦" />;
    disconnectSocket();
  }, [accessToken, step, user?.id]);

  // Google OAuth callback — catch before AuthGate so no login flash
  if (window.location.pathname === '/auth/callback') {
    return <AuthCallback />;
  }

  if (!hydrated) return <LoaderScreen label="Initialising SkillNova…" />;
  if (!user || step !== 'authenticated') return <AuthGate />;

  return (
    <>
      {!online && (
        <div
          className="fixed top-0 left-0 right-0 z-[100] px-4 py-2 text-center text-sm font-medium text-white"
          style={{ background: '#dc2626' }}
        >
          ?? You are offline. Some features may be unavailable.
        </div>
      )}
      {user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? (
        <AdminApp />
      ) : user.role === 'MENTOR' ? (
        <MentorApp />
      ) : (
        <UserApp />
      )}
      <AIAssistant role={user.role} userName={user.name} />
    </>
  );
};

export default App;
