import React from 'react';
import './NavBar.scss';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NavBar: React.FC = () => {
  const { logout } = useAuth();
  const isLoggedIn = !!localStorage.getItem('userId');
  const isAdmin = localStorage.getItem('isStaff') === 'true';

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">TechRepairs</Link>
      </div>
      <ul className="navLinks">
        <li><Link to="/services">Serviços</Link></li>
        {!isLoggedIn ? (
          <li><Link to="/login">Login</Link></li>
        ) : (
          <>
            {isAdmin ? (
              <li><Link to="/admin">Admin Painel</Link></li>
            ) : (
              <li><Link to="/myorders">Minhas Encomendas</Link></li>
            )}
            <li>
              <button onClick={() => logout()} className="logout-button" type="button">
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default NavBar;
