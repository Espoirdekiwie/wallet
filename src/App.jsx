import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ErrorBoundary, Loading } from './components';

// Lazy Loaded Page Components for Maximum Performance
const Home = lazy(() => import('./pages/Home'));
const CreatePassword = lazy(() => import('./pages/CreatePassword'));
const RecoveryPhrase = lazy(() => import('./pages/RecoveryPhrase'));
const ImportWallet = lazy(() => import('./pages/ImportWallet'));
const Unlock = lazy(() => import('./pages/Unlock'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Send = lazy(() => import('./pages/Send'));
const Receive = lazy(() => import('./pages/Receive'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

// ScrollToTop on Route Change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={<Loading text="Loading EtherVault..." fullScreen />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create-password" element={<CreatePassword />} />
          <Route path="/recovery-phrase" element={<RecoveryPhrase />} />
          <Route path="/import" element={<ImportWallet />} />
          <Route path="/import-wallet" element={<ImportWallet />} />
          <Route path="/unlock" element={<Unlock />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/send" element={<Send />} />
          <Route path="/receive" element={<Receive />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {/* Global Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </ErrorBoundary>
  );
}

export default App;
