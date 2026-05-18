import { Routes, Route, Navigate } from "react-router-dom";
import GridPage from "./pages/GridPage";
import CellPage from "./pages/CellPage";
import InterviewPage from "./pages/InterviewPage";
import SynthesisPage from "./pages/SynthesisPage";
import SettingsPage from "./pages/SettingsPage";
import { useCloudSync } from "./lib/sync";

export default function App() {
  useCloudSync();
  return (
    <Routes>
      <Route path="/" element={<GridPage />} />
      <Route path="/cell/:cellId" element={<CellPage />} />
      <Route path="/interview" element={<InterviewPage />} />
      <Route path="/interview/:informantId" element={<InterviewPage />} />
      <Route path="/synthesis" element={<SynthesisPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
