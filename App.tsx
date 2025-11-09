import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import MainScreen from './components/MainScreen';

export interface User {
  name: string;
  email: string;
  picture: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return <MainScreen onLogout={handleLogout} user={user} />;
};

export default App;
