import { Component } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import FeedPage from "./pages/FeedPage";
import MessagesPage from "./pages/MessagesPage";
import ProfilePage from "./pages/ProfilePage";

function Loader() {
  return <div className="grid min-h-screen place-items-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-lavender/20 border-t-lavender" /></div>;
}
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/auth" replace />;
}
function Public({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? <Navigate to="/" replace /> : children;
}

class PageErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <div className="grid min-h-screen place-items-center bg-cream p-5"><div className="max-w-md rounded-[26px] border border-rose-100 bg-white p-7 text-center shadow-soft"><p className="font-serif text-2xl font-bold text-ink">This page needs a quick refresh.</p><p className="mt-3 text-sm leading-6 text-slate-500">ConnectSphere caught an unexpected screen error instead of leaving you with a blank page.</p><button onClick={() => window.location.reload()} className="mt-5 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-white">Refresh page</button><p className="mt-4 break-words text-xs text-rose-500">{this.state.error.message}</p></div></div>;
    }
    return this.props.children;
  }
}

export default function App() {
  return <Routes>
    <Route path="/auth" element={<Public><AuthPage /></Public>} />
    <Route path="/" element={<Protected><FeedPage /></Protected>} />
    <Route path="/messages" element={<Protected><PageErrorBoundary><MessagesPage /></PageErrorBoundary></Protected>} />
    <Route path="/profile/:username" element={<Protected><ProfilePage /></Protected>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
