import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../api/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const r = user.role || user.roles?.[0]?.name;
      if (r === 'admin') navigate('/admin');
      else if (r === 'teacher') navigate('/teacher');
    }
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const resp = await loginUser({ email, password });
      console.log('Login API Response:', resp);
      const ok = resp?.status === 'success' && resp?.data;
      if (!ok) { setError(resp?.message || 'Login failed'); return; }
      const userData = resp.data.user;
      const tokenValue = resp.data.token;
      if (userData?.roles?.length) userData.role = userData.roles[0].name;
      login(userData, tokenValue);
      if (userData.role === 'admin') navigate('/admin');
      else if (userData.role === 'teacher') navigate('/teacher');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Network error');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {error && <div className="text-red-600 mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm">Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm">Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <button className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
          </div>
        </form>
      </div>
    </div>
  );
}
