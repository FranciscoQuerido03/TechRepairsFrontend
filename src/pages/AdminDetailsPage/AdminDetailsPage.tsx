// AdminDetails.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NavBar from '../../components/NavBar/NavBar';
import './AdminDetailsPage.scss';

const AdminDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [repair, setRepair] = useState<any>(null);
  const [status, setStatus] = useState('');
  const [extraService, setExtraService] = useState('');
  const [extraPrice, setExtraPrice] = useState('');
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_APP_BACKEND}store/get_booking_by_id/${id}/`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
    })
      .then(res => res.json())
      .then(data => {
        setRepair(data);
        setStatus(data.status);
        setExtraService(data.extra_service || '');
        setExtraPrice(data.extra_price || '');
      })
      .catch(() => alert('Erro ao carregar os detalhes.'));
  }, [id, auth.accessToken]);

  const handleStatusChange = () => {
    let acao = 'update';

    if (status === 'aguarda pagamento') {
      if (!extraService.trim() || !extraPrice.trim()) {
        alert('Preenche o serviço extra e o valor.');
        return;
      }
      acao = 'extra';
    }

    fetch(`${import.meta.env.VITE_APP_BACKEND}store/update_booking/${id}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.accessToken}`,
      },
      body: JSON.stringify({
        acao,
        status,
        extra_service: status === 'aguarda pagamento' ? extraService : undefined,
        extra_price: status === 'aguarda pagamento' ? parseFloat(extraPrice) : undefined,
      }),
    })
      .then(res => {
        if (!res.ok) throw new Error();
        alert('Estado atualizado com sucesso!');
        navigate('/admin');
      })
      .catch(() => alert('Erro ao atualizar estado.'));
  };

  if (!repair) return <p>A carregar...</p>;

  return (
    <>
      <div className="header"><NavBar /></div>
      <div className="admin-details-container">
        <h2>Detalhes da Reparação #{repair.id}</h2>
        <div className="info-line"><strong>Nome:</strong> {repair.repair.name}</div>
        <div className="info-line"><strong>Cliente:</strong> {repair.user.email}</div>
        <div className="info-line"><strong>Data:</strong> {repair.appointment_date}</div>
        <div className="info-line"><strong>Hora:</strong> {repair.appointment_time}</div>
        <div className="info-line"><strong>Tipo:</strong> <span className="capitalize">{repair.type}</span></div>
        <div className="info-line"><strong>Estado Atual:</strong> <span className="status-label">{repair.status}</span></div>

        <div className="status-update">
          <label>Alterar Estado:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="pendente">Pendente</option>
            <option value="aguarda pagamento">Aguarda Pagamento</option>
            <option value="em reparação">Em Reparação</option>
            <option value="concluído">Concluído</option>
          </select>

          {status === 'aguarda pagamento' && (
            <div className="extra-service-input">
              <label>Descrição do Serviço Extra:</label>
              <textarea
                value={extraService}
                onChange={(e) => setExtraService(e.target.value)}
                placeholder="Ex: Substituição de bateria..."
              />
              <label>Valor (€):</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={extraPrice}
                onChange={(e) => setExtraPrice(e.target.value)}
                placeholder="Ex: 30.00"
              />
            </div>
          )}

          <button onClick={handleStatusChange}>Atualizar Estado</button>
        </div>
      </div>
    </>
  );
};

export default AdminDetails;
