import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NavBar from '../../components/NavBar/NavBar';
import '../AdminDetailsPage/AdminDetailsPage.scss'; // Reutiliza o estilo visual

const ServiceStatus: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [repair, setRepair] = useState<any>(null);
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_APP_BACKEND}store/get_booking_by_id/${id}/`, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    })
      .then(res => res.json())
      .then(data => setRepair(data))
      .catch(() => alert('Erro ao carregar os detalhes.'));
  }, [id, auth.accessToken]);

  const handleAction = (action: 'pagar' | 'rejeitar') => {
    if (action === 'rejeitar') {
      const confirmar = window.confirm('Tem a certeza que quer rejeitar? Isto irá cancelar a reparação.');
      if (!confirmar) return;
    } else if (action === 'pagar') {
      const confirmar = window.confirm('Tem a certeza que quer pagar e prosseguir com a encomenda?');
      if (!confirmar) return;
    }

    const newStatus = action === 'pagar' ? 'em reparação' : 'cancelada';

    fetch(`${import.meta.env.VITE_APP_BACKEND}store/update_booking/${id}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.accessToken}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then(res => {
        if (!res.ok) throw new Error();
        if (action === 'pagar') {
          alert('Pagamento confirmado. A sua reparação será iniciada em breve.');
        } else {
          alert('Reparação cancelada com sucesso. Pode vir buscar o seu dispositivo.');
        }
        navigate('/');
      })
      .catch(() => alert('Erro ao atualizar o estado.'));
  };

  if (!repair) return <p>A carregar...</p>;

  return (
    <>
      <div className="header"><NavBar /></div>
      <div className="admin-details-container">
        <h2>{repair.repair.name} #{repair.id}</h2>
        <div className="info-line"><strong>Nome:</strong> {repair.repair?.name || 'N/D'}</div>
        <div className="info-line"><strong>Data:</strong> {repair.appointment_date}</div>
        <div className="info-line"><strong>Hora:</strong> {repair.appointment_time}</div>
        <div className="info-line"><strong>Tipo:</strong> <span className="capitalize">{repair.type}</span></div>
        <div className="info-line"><strong>Estado Atual:</strong> <span className="status-label">{repair.status}</span></div>


        {repair.status.toLowerCase() === 'aguarda pagamento' && (
          <>
            <div className="info-line"><strong>Info:</strong> {repair.extra_service}</div>
            <div className="status-update">
              <button onClick={() => handleAction('pagar')}>Pagar</button>
              <button onClick={() => handleAction('rejeitar')}>Rejeitar</button>
            </div>
          </>
        )}

      </div>
    </>
  );
};

export default ServiceStatus;
