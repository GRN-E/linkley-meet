import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Auth from "./pages/Auth.jsx";
import Browse from "./pages/Browse.jsx";
import Profile from "./pages/Profile.jsx";
import Points from "./pages/Points.jsx";
import DashboardClient from "./pages/DashboardClient.jsx";
import DashboardExpert from "./pages/DashboardExpert.jsx";
import Call from "./pages/Call.jsx";
import Certificate from "./pages/Certificate.jsx";
import About from "./pages/About.jsx";
import Projects from "./pages/Projects.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";
import ProjectNew from "./pages/ProjectNew.jsx";
import ExpertProfileEdit from "./pages/ExpertProfileEdit.jsx";
import Messages from "./pages/Messages.jsx";
import ExpertOnboarding from "./components/ExpertOnboarding.jsx";
import { useAuth } from "./lib/AuthContext.jsx";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<About />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/expert/profile" element={<RequireAuth><ExpertProfileEdit /></RequireAuth>} />
          <Route path="/expert/:id" element={<Profile />} />
          <Route path="/points" element={<Points />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<RequireAuth><ProjectNew /></RequireAuth>} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
          <Route path="/messages/:id" element={<RequireAuth><Messages /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><DashboardRouter /></RequireAuth>} />
          <Route path="/call/:bookingId" element={<RequireAuth><Call /></RequireAuth>} />
          <Route path="/certificate/:id" element={<RequireAuth><Certificate /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
      <ExpertOnboarding />
    </>
  );
}

function DashboardRouter() {
  const { profile } = useAuth();
  return profile?.role === "expert" ? <DashboardExpert /> : <DashboardClient />;
}
