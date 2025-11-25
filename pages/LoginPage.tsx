
import React, { useState, useEffect } from 'react';
import { User, OrganizationInfo } from '../types';
import { useTranslation } from '../LanguageContext';
import { OrgaFlowLogo } from '../components/icons';
import Footer from '../components/Footer';
import { useToast } from '../ToastContext';

interface LoginPageProps {
  users: User[];
  onLogin: (user: User) => void;
  organizationInfo: OrganizationInfo;
}

const LoginPage: React.FC<LoginPageProps> = ({ users, onLogin, organizationInfo }) => {
  const { t, language, toggleLanguage } = useTranslation();
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedCreds = localStorage.getItem('orgaFlow_creds');
    if (savedCreds) {
        try {
            const { username: savedUser, password: savedPass } = JSON.parse(savedCreds);
            setUsername(savedUser);
            setPassword(savedPass);
            setRememberMe(true);
        } catch (e) {
            console.error("Failed to parse saved credentials");
        }
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      if (rememberMe) {
        localStorage.setItem('orgaFlow_creds', JSON.stringify({ username, password }));
      } else {
        localStorage.removeItem('orgaFlow_creds');
      }
      onLogin(user);
    } else {
      showToast(t.login.error, 'error');
    }
  };
  
  const LanguageSwitcher: React.FC = () => (
    <div className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} flex items-center gap-1 bg-slate-100 p-1 rounded-lg z-10`}>
        <button 
            onClick={() => { if(language !== 'en') toggleLanguage() }} 
            className={`px-2 py-1 rounded-md text-sm font-bold transition-colors ${language === 'en' ? 'text-white bg-indigo-600' : 'text-slate-600 hover:bg-slate-200'}`}
        >
            EN
        </button>
        <button 
            onClick={() => { if(language !== 'ar') toggleLanguage() }} 
            className={`px-2 py-1 rounded-md text-sm font-bold transition-colors ${language === 'ar' ? 'text-white bg-indigo-600' : 'text-slate-600 hover:bg-slate-200'}`}
        >
            AR
        </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4">
      <main className="w-full flex-grow flex items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8 space-y-6 relative">
          <LanguageSwitcher />
          
          <div className="text-center">
             <div className="flex items-center justify-center mx-auto mb-4">
              <OrgaFlowLogo className="w-12 h-12" />
              <h1 className={`text-3xl font-extrabold text-slate-800 ${language === 'ar' ? 'mr-3' : 'ml-3'}`}>{t.appName}</h1>
            </div>
            <p className="text-slate-500 mt-2">{language === 'ar' ? organizationInfo.nameAr : organizationInfo.nameEn}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700">{t.login.username}</label>
              <div className="mt-1">
                <select
                    id="username"
                    name="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-slate-900"
                >
                    <option value="">{t.login.selectUser}</option>
                    {users.map(u => (
                        <option key={u.id} value={u.username}>{u.name}</option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">{t.login.password}</label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="flex items-center">
                <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className={`block text-sm text-gray-900 ${language === 'ar' ? 'mr-2' : 'ml-2'}`}>
                    {t.login.rememberMe}
                </label>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t.login.loginButton}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
