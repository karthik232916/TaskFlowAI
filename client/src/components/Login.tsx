import { useState, type FormEvent } from 'react';
import { useDispatch } from 'react-redux';

import { loginUser } from '../services/authService';
import { login } from '../store/authSlice';
import type { AppDispatch } from '../store/store';

function Login() {
  const dispatch = useDispatch<AppDispatch>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await loginUser({
        email,
        password,
      });

      const payload = JSON.parse(
        atob(response.token.split('.')[1])
      );

      dispatch(
        login({
          token: response.token,
          user: {
            id: Number(
              payload[
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
              ]
            ),
            email:
              payload[
                'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
              ],
            role:
              payload[
                'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
              ],
          },
        })
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Login failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>TaskFlow AI</h1>

      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;