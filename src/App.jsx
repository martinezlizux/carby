import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Splash from './pages/Splash.jsx';
import Language from './pages/Language.jsx';
import Onboarding from './pages/Onboarding.jsx';
import NameAge from './pages/NameAge.jsx';
import Gender from './pages/Gender.jsx';
import HeightWeight from './pages/HeightWeight.jsx';
import Insuline from './pages/Insuline.jsx';
import Thanks from './pages/Thanks.jsx';
import Chat from './pages/Chat.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Goals from './pages/Goals.jsx';
import Settings from './pages/Settings.jsx';
import EditProfile from './pages/EditProfile.jsx';
import AppLayout from './components/AppLayout.jsx';
import { WizardProvider } from './contexts/WizardContext.jsx';

function App() {
  return (
    <WizardProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/language" element={<Language />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/name-age" element={<NameAge />} />
          <Route path="/gender" element={<Gender />} />
          <Route path="/height-weight" element={<HeightWeight />} />
          <Route path="/insuline" element={<Insuline />} />
          <Route path="/thanks" element={<Thanks />} />

          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="/profile/edit" element={<EditProfile />} />
        </Routes>
      </BrowserRouter>
    </WizardProvider>
  );
}

export default App;
