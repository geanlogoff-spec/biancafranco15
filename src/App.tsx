import { MotionConfig } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { FloatingControls } from './components/FloatingControls';
import { JourneyGuide } from './components/JourneyGuide';
import { Scene1Portal } from './components/scenes/Scene1Portal';
import { Scene2Debutante } from './components/scenes/Scene2Debutante';
import { Scene3Invitation } from './components/scenes/Scene3Invitation';
import { Scene4DateTime } from './components/scenes/Scene4DateTime';
import { Scene5Location } from './components/scenes/Scene5Location';
import { Scene6Rsvp } from './components/scenes/Scene6Rsvp';
import { Scene7Closing } from './components/scenes/Scene7Closing';
import { SceneGiftHints } from './components/scenes/SceneGiftHints';
import { invitation } from './config/invitation.config';
import { getAdminSessionInfo } from './lib/supabase';

const AdminDashboard = lazy(() =>
  import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
);
const AdminLogin = lazy(() =>
  import('./components/admin/AdminLogin').then((m) => ({ default: m.AdminLogin })),
);

const adminLoadingScreen = (
  <div className="admin-page-shell flex min-h-[100dvh] flex-col items-center justify-center text-[var(--color-text-muted)]">
    <Loader2 className="mb-3 animate-spin" size={28} />
    <p className="font-mono text-xs uppercase tracking-[0.1em]">Verificando sessão...</p>
  </div>
);

function isAdminLocation(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin';
}

export default function App() {
  const [opened, setOpened] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [adminRoute, setAdminRoute] = useState(isAdminLocation);
  const [authStatus, setAuthStatus] = useState<'checking' | 'guest' | 'admin'>('checking');
  const [adminEmail, setAdminEmail] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const syncRoute = () => setAdminRoute(isAdminLocation());
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, []);

  useEffect(() => {
    if (adminRoute) {
      document.body.classList.remove('locked');
      audioRef.current?.pause();
    } else {
      document.body.classList.toggle('locked', !opened);
    }
  }, [adminRoute, opened]);

  const refreshSession = useCallback(() => {
    setAuthStatus('checking');
    return getAdminSessionInfo()
      .then((info) => {
        setAdminEmail(info.email);
        setAuthStatus(info.isAdmin ? 'admin' : 'guest');
      })
      .catch(() => {
        setAdminEmail('');
        setAuthStatus('guest');
      });
  }, []);

  useEffect(() => {
    if (!adminRoute) return;
    refreshSession();
  }, [adminRoute, refreshSession]);

  useEffect(() => {
    if (!invitation.audio.musicUrl) return;
    const a = new Audio(invitation.audio.musicUrl);
    a.loop = true;
    a.volume = 0.45;
    a.onplay = () => setPlaying(true);
    a.onpause = () => setPlaying(false);
    audioRef.current = a;
    return () => a.pause();
  }, []);

  const toggleMusic = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().catch(() => setPlaying(false));
    else a.pause();
  };

  const handleOpen = () => {
    setOpened(true);
    window.scrollTo({ top: 0 });
    // O clique no botão é um gesto do usuário: o navegador permite iniciar a música
    audioRef.current?.play().catch(() => setPlaying(false));
  };

  const goToInvite = useCallback(() => {
    if (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
      window.history.pushState(null, '', '/');
    }
    setAdminRoute(false);
    window.scrollTo({ top: 0 });
  }, []);

  if (adminRoute) {
    return (
      <MotionConfig reducedMotion="user">
        {authStatus === 'checking' ? (
          adminLoadingScreen
        ) : (
          <Suspense fallback={adminLoadingScreen}>
            {authStatus === 'admin' ? (
              <AdminDashboard
                adminEmail={adminEmail}
                onSignedOut={() => {
                  setAdminEmail('');
                  setAuthStatus('guest');
                }}
                onGoToInvite={goToInvite}
              />
            ) : (
              <AdminLogin onSuccess={refreshSession} onBack={goToInvite} />
            )}
          </Suspense>
        )}
      </MotionConfig>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      {!opened ? (
        <Scene1Portal onOpen={handleOpen} />
      ) : (
        <>
          <main>
            <Scene2Debutante />
            <Scene3Invitation />
            <Scene4DateTime />
            <Scene5Location />
            <SceneGiftHints />
            <Scene6Rsvp />
            <Scene7Closing />
          </main>
          <JourneyGuide />
          <FloatingControls playing={playing} onToggleMusic={toggleMusic} />
        </>
      )}
    </MotionConfig>
  );
}
