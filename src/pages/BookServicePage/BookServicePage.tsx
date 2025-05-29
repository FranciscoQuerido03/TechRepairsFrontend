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
  const [busyTimes, setBusyTimes] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_APP_BACKEND}store/get_repair_by_id/${serviceId}/`, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(data => setRepairName(data.name))
      .catch(() => alert('Erro ao carregar serviço'));
  }, [serviceId]);

  const generateTimeSlots = () => {
    const slots: string[] = [];
    let [hour, minute] = workStart.split(':').map(Number);
    const [endHour, endMinute] = workEnd.split(':').map(Number);

    while (hour < endHour || (hour === endHour && minute <= endMinute)) {
      const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      slots.push(time);
      minute += 30;
      if (minute >= 60) {
        hour += 1;
        minute = 0;
      }
    }

    return slots;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const selectedDate = new Date(value);

    if (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) {
      alert("Fins de semana não são permitidos.");
      e.target.value = "";
      setFormData({ ...formData, date: "", time: "" });
      setAvailableSlots([]);
      return;
    }

    setFormData({ ...formData, date: value, time: "" });

    fetch(`${import.meta.env.VITE_APP_BACKEND}store/get_bookings_for_date/?date=${value}`)
      .then(res => res.json())
      .then(data => {
        const booked = data.map((b: any) => b.appointment_time.slice(0, 5));
        setBusyTimes(booked);

        const now = new Date();
        const allSlots = generateTimeSlots();
        const available = allSlots.filter(slot => {
          const isBusy = booked.includes(slot);
          const isPastToday =
            selectedDate.toDateString() === now.toDateString() &&
            slot <= now.toTimeString().slice(0, 5);
          return !isBusy && !isPastToday;
        });

        setAvailableSlots(available);
      })
      .catch(() => alert("Erro ao carregar horários ocupados."));
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
            <select
              name="time"
              required
              disabled={!formData.date || availableSlots.length === 0}
              value={formData.time}
              onChange={e => setFormData({ ...formData, time: e.target.value })}
            >
              <option value="">Selecione uma hora</option>
              {generateTimeSlots().map(time => (
                <option key={time} value={time} disabled={busyTimes.includes(time)}>
                  {time}
                </option>
              ))}
            </select>
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
