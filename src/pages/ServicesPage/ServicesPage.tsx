import React, { useEffect, useState } from 'react';
import './ServicesPage.scss';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/NavBar/NavBar';

const Services: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    fetch(import.meta.env.VITE_APP_BACKEND + 'store/get_all_repairs/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => setServices(data))
      .catch(err => {
        console.error('Erro ao carregar serviços:', err);
        alert('Erro ao carregar serviços');
      });
  }, []);

  return (
    <>
      <div className="header">
        <NavBar />
      </div>
      <div className="services-page">
        <h1>Serviços Disponíveis</h1>
        <ul className="services-list">
          {services.map(service => (
            <li key={service.id}>
              <div className="service-item">
                <h3>{service.name}</h3>
                <p>Estimativa: {service.cost} €</p>
                <button onClick={() => navigate(`/bookService/${service.id}`)}>Marcar</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Services;
