import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NavBar from '../../components/NavBar/NavBar';
import './AdminPage.scss';

interface RepairRequest {
  id: number;
  repair: {
    id: number;
    name: string;
  };
  status: string;
  appointment_date: string;
  appointment_time: string;
  type: string;
  user: {
    id: number;
    email: string;
  };
}

const AdminPage: React.FC = () => {
  const [repairs, setRepairs] = useState<RepairRequest[]>([]);
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_APP_BACKEND}store/get_all_bookings/`, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar reparações');
        return res.json();
      })
      .then(data => {
        console.log(data);
        const sorted = data.sort((a, b) => {
          if (a.status === 'concluído' && b.status !== 'concluído') return 1;
          if (a.status !== 'concluído' && b.status === 'concluído') return -1;
          return 0;
        });
        setRepairs(sorted);
      })
      .catch(err => {
        console.error(err);
        alert('Erro ao carregar reparações');
      });
  }, [auth.accessToken]);

  return (
    <>
    <div className="header"><NavBar /></div>
        <div className="admin-container">
        <h1>Admin - Lista de Reparações</h1>
        {repairs.length === 0 ? (
            <p>Sem reparações para mostrar.</p>
        ) : (
            <table className="admin-table">
            <thead>
                <tr>
                    <th>Reparação</th>
                    <th>Cliente</th>
                    <th>Data</th>
                    <th>Hora</th>
                    <th>Tipo</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {repairs.map((repair) => (
                <tr
                    key={repair.id}
                    onClick={() => navigate(`/details/${repair.id}`)}
                    className={repair.status === 'concluído' ? 'completed' : 'active'}
                >
                    <td>{repair.repair.name}</td>
                    <td>{repair.user.email}</td>
                    <td>{repair.appointment_date}</td>
                    <td>{repair.appointment_time}</td>
                    <td className="capitalize">{repair.type}</td>
                    <td className={repair.status === 'concluído' ? 'status-completed' : 'status-active'}>
                      {repair.status}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
        </div>
    </>
  );
};

export default AdminPage;
