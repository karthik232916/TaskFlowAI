export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

export const loginUser = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  const response = await fetch(
    'http://localhost:5109/api/auth/login',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    }
  );

  if (!response.ok) {
    throw new Error('Invalid email or password');
  }

  return response.json();
};