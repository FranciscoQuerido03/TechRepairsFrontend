// /src/pages/LandingPage/LandingPage.tsx
import './LandingPage.scss';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleRedirect = (path: string) => {
    navigate(path);
  };

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const headerHeight = document.querySelector('.header')?.clientHeight || 0;
      setIsScrolled(window.scrollY > headerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (location.hash === '#about') {
      const aboutSection = document.querySelector('#about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash]);

  return (

    <div className="landing-page">
      <div>
        <NavBar />
      </div>
      <div className="landing-header">
        <h1>TechRepairs</h1>
        <p>Reparações rápidas e confiáveis para todos os seus dispositivos tecnológicos</p>
      </div>

      <div className="services-section">
        <h1>Os nossos serviços</h1>
        <p>Conheça todos os serviços que temos para lhe oferecer</p>
        <div className='content'>
          <div className="services">
            <div className="service-card">
              <h3>Reparação de Smartphones</h3>
              <p>Resolvemos problemas de ecrã, bateria, software e muito mais.</p>
            </div>
            <div className="service-card">
              <h3>Reparação de Computadores</h3>
              <p>Assistência técnica para hardware e software.</p>
            </div>
            <div className="service-card">
              <h3>Manutenção de Tablets</h3>
              <p>Diagnóstico e reparação de problemas técnicos.</p>
            </div>
            <div className="service-card">
              <h3>Reparação de Consolas</h3>
              <p>Reparamos consolas de todas as marcas, efetuamos substiuição de peças.</p>
            </div>
          </div>
          <div className='more-services'>
            <button className="cta-button" onClick={() => handleRedirect('/services')}>Ver todos os serviços</button>
          </div>
        </div>
      </div>

      <div className="about-section" id="about">
        <h1>Sobre nós</h1>
        <p>
          Na TechRepairs, temos uma equipa de especialistas dedicados a oferecer o melhor serviço de reparação para os seus dispositivos.
          Garantimos qualidade, rapidez e preços acessíveis.
        </p>
      </div>

      <div className="landing-footer">
        <p>&copy; {new Date().getFullYear()} TechRepairs. Todos os direitos reservados.</p>
      </div>
    </div>
  );
};

export default LandingPage;