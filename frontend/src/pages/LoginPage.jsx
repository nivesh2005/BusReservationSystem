import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, saveToken } from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    try {
      const response = await loginUser({ email, password });
      saveToken(response.data.token);
      navigate('/booking');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="page-card form-card">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        <label>Password</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
        <button type="submit" className="cta">Login</button>
        {message && <div className="error">{message}</div>}
      </form>
    </div>
  );
}
