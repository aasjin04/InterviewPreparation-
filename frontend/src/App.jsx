import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ResumeBuilder from "./pages/ResumeBuilder";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import MockInterview from "./pages/MockInterview";
import ATSChecker from "./pages/ATSChecker";
import PublicRoute from "./components/PublicRoute";
import AIInterview from "./pages/AIInterview";
import AptitudePrep from "./pages/AptitudePrep";
 
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
export default function App() {
  return (
    <Routes>
 
      <Route path="/" element={<Home />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {" "}
            <Dashboard />{" "}
          </ProtectedRoute>
        }
      />
      <Route
        path="/ats-checker"
        element={
          <ProtectedRoute>
            <ATSChecker />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analyzer"
        element={
          <ProtectedRoute>
            <ResumeAnalyzer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/builder"
        element={
          <ProtectedRoute>
            <ResumeBuilder />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mock-interview"
        element={
          <ProtectedRoute>
            <MockInterview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ai-interview"
        element={
          <ProtectedRoute>
            <AIInterview />
          </ProtectedRoute>
        }
      />

      <Route
        path="/aptitude-prep"
        element={
          <ProtectedRoute>
            <AptitudePrep />
          </ProtectedRoute>
        }
      />

      

      

      <Route
  path="/login"
  element={
    <PublicRoute>
      <Login />
    </PublicRoute>
  }
/>

<Route
  path="/signup"
  element={
    <PublicRoute>
      <Signup />
    </PublicRoute>
  }
/>
    </Routes>
  );
}
