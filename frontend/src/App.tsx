import { Routes, Route } from 'react-router-dom';
import Login from './routes/Login';
import Register from './routes/Register';
import RequestReset from './routes/RequestReset';
import ResetPassword from './routes/ResetPassword';
import Profile from './routes/Profile';
import AdminLogin from './routes/AdminLogin';
import Backoffice from './routes/Backoffice';
import Home from './routes/Home';
import Setting from './routes/Setting';
import { Navigate } from 'react-router-dom';

// let user = localStorage.getItem('user');
// let userData = JSON.parse(user);
// let id = userData.id;


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<RequestReset />} />
      <Route path="/reset-password/new" element={<ResetPassword />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/profile/:username" element={<Profile />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Setting />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/backoffice" element={<Backoffice />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}

export default App;


