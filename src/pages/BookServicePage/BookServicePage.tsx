import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './BookServicePage.scss';
import NavBar from '../../components/NavBar/NavBar';

const BookService: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const auth = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const workStart = "09:00";
  const workEnd = "18:00";

  const [formData, setFormData] = useState({ date: '', time: '', type: 'standard' });
  const [repairName, setRepairName] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.VITE_APP_BACKEND}store/get_repair_by_id/${serviceId}/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(data => setRepairName(data.name))
      .catch(() => alert('Erro ao carregar serviço'));
  }, [serviceId]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const selectedDate = new Date(value);
    if (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) {
      alert("Fins de semana não são permitidos.");
      e.target.value = "";
      setFormData({ ...formData, date: "", time: "" });
      return;
    }
    setFormData({ ...formData, date: value, time: "" });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedTime = e.target.value;
    const now = new Date();
    const selectedDate = new Date(formData.date);

    // Só validar se data e hora preenchidas
    if (!formData.date) {
      alert("Por favor, selecione primeiro uma data válida.");
      e.target.value = "";
      setFormData({ ...formData, time: "" });
      return;
    }

    // Limitar ao horário expediente
    if (selectedTime < workStart || selectedTime > workEnd) {
      alert(`Hora deve estar entre ${workStart} e ${workEnd}.`);
      e.target.value = "";
      setFormData({ ...formData, time: "" });
      return;
    }

    // Se data é hoje, não permitir horas passadas
    if (selectedDate.toDateString() === now.toDateString() && selectedTime <= now.toTimeString().slice(0,5)) {
      alert("Não pode selecionar horas já passadas hoje.");
      e.target.value = "";
      setFormData({ ...formData, time: "" });
      return;
    }

    setFormData({ ...formData, time: selectedTime });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.accessToken) {
      localStorage.setItem('pendingBooking', JSON.stringify({ ...formData, repair: serviceId }));
      alert('Para prosseguir, deve fazer login.');
      navigate(`/login?returnUrl=/serviceStatus/${serviceId}`);
      return;
    }

    const bookingData = {
      repair: serviceId,
      date: formData.date,
      time: formData.time,
      type: formData.type,
    };

    fetch(`${import.meta.env.VITE_APP_BACKEND}store/create_booking/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.accessToken}`,
      },
      body: JSON.stringify(bookingData),
    })
      .then(response => {
        if (!response.ok) throw new Error('Erro ao efetuar a marcação.');
        return response.json();
      })
      .then(() => {
        alert('Marcação efetuada com sucesso!');
        navigate(`/serviceStatus/${serviceId}`);
      })
      .catch(() => alert('Erro ao efetuar a marcação. Tente novamente mais tarde.'));
  };

  return (
    <>
      <div className="header"><NavBar /></div>
      <div className="book-page">
        <h1>Marcar: {repairName}</h1>
        <form className="book-form" onSubmit={handleSubmit}>
          <label>Data:
            <input
              type="date"
              name="date"
              required
              min={today}
              onChange={handleDateChange}
            />
          </label>
          <label>Hora:
            <input
              type="time"
              name="time"
              required
              min={workStart}
              max={workEnd}
              onChange={handleTimeChange}
              value={formData.time}
              disabled={!formData.date}
            />
          </label>
          <label>Tipo de Serviço:
            <select
              name="type"
              required
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="standard">Normal</option>
              <option value="urgent">Urgente (+€20)</option>
            </select>
          </label>
          <button type="submit">Confirmar Marcação</button>
        </form>
      </div>
    </>
  );
};

export default BookService;
