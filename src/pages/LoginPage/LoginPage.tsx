import { useState } from 'react';
import './LoginPage.scss';
import { useAuth } from '../../contexts/AuthContext';
import React from 'react';
import FaceIDButton from '../../components/FaceIDButton/FaceIDButton';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const params = new URLSearchParams(location.search);
  const returnUrl = params.get('returnUrl') || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await auth.login(email, password);
      setLoginError('');

      const token = localStorage.getItem('accessToken');
      const pendingBooking = localStorage.getItem('pendingBooking');

      if (pendingBooking) {
        await fetch(import.meta.env.VITE_APP_BACKEND + 'store/create_booking/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: pendingBooking,
        })
        localStorage.removeItem('pendingBooking');
        alert('Marcação efetuada com sucesso!');
}
    } catch (error) {
      setLoginError('Email ou password inválida. Por favor tente outra vez.');
    }
  };

  return (
    <div className="login-page">
      <form className="login" onSubmit={handleLogin}>
        <h1>Login</h1>

        <input
          type="text"
          placeholder="Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {loginError && <div className="login-error">{loginError}</div>}

        <button type="submit">Login</button>
        <FaceIDButton />
      </form>
    </div>
  );
};

export default LoginPage;
