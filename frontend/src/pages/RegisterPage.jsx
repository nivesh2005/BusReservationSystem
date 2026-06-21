import { useState } from 'react';
import { registerUser } from '../services/api';

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    address: '',
    gender: '',
  });
  const [message, setMessage] = useState('');

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    try {
      await registerUser(form);
      setMessage('Registration successful. You may now login.');
      setForm({ firstName: '', lastName: '', email: '', password: '', phone: '', dob: '', address: '', gender: '' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Registration failed');
    }
  }

  return (
    <div className="page-card form-card">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label>First Name</label>
        <input value={form.firstName} onChange={(e) => updateField('firstName', e.target.value)} required />
        <label>Last Name</label>
        <input value={form.lastName} onChange={(e) => updateField('lastName', e.target.value)} required />
        <label>Email</label>
        <input value={form.email} onChange={(e) => updateField('email', e.target.value)} type="email" required />
        <label>Password</label>
        <input value={form.password} onChange={(e) => updateField('password', e.target.value)} type="password" required />
        <label>Phone</label>
        <input value={form.phone} onChange={(e) => updateField('phone', e.target.value)} required />
        <label>Date of Birth</label>
        <input value={form.dob} onChange={(e) => updateField('dob', e.target.value)} type="date" required />
        <label>Address</label>
        <input value={form.address} onChange={(e) => updateField('address', e.target.value)} required />
        <label>Gender</label>
        <select value={form.gender} onChange={(e) => updateField('gender', e.target.value)}>
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <button type="submit" className="cta">Register</button>
        {message && <div className="info">{message}</div>}
      </form>
    </div>
  );
}
