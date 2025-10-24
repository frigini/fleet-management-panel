import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Truck, Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';

type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password';

interface AuthPageProps {
  resetToken?: string;
}

export const AuthPage: React.FC<AuthPageProps> = ({ resetToken }) => {
  const [mode, setMode] = useState<AuthMode>(resetToken ? 'reset-password' : 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { login, register, forgotPassword, resetPassword, isLoading, error } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setLocalError(null);
  };

  const validateForm = (): boolean => {
    if (mode === 'login') {
      if (!formData.email || !formData.password) {
        setLocalError('E-mail e senha são obrigatórios');
        return false;
      }
    } else if (mode === 'register') {
      if (!formData.email || !formData.password || !formData.name) {
        setLocalError('Todos os campos são obrigatórios');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setLocalError('As senhas não coincidem');
        return false;
      }
      if (formData.password.length < 6) {
        setLocalError('A senha deve ter pelo menos 6 caracteres');
        return false;
      }
    } else if (mode === 'forgot-password') {
      if (!formData.email) {
        setLocalError('E-mail é obrigatório');
        return false;
      }
    } else if (mode === 'reset-password') {
      if (!formData.password || !formData.confirmPassword) {
        setLocalError('Senha e confirmação são obrigatórias');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setLocalError('As senhas não coincidem');
        return false;
      }
      if (formData.password.length < 6) {
        setLocalError('A senha deve ter pelo menos 6 caracteres');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    try {
      if (mode === 'login') {
        await login({ email: formData.email, password: formData.password });
      } else if (mode === 'register') {
        await register({ 
          email: formData.email, 
          password: formData.password, 
          name: formData.name 
        });
      } else if (mode === 'forgot-password') {
        await forgotPassword(formData.email);
        setSuccessMessage('Se o e-mail existir, um link de redefinição foi enviado');
      } else if (mode === 'reset-password' && resetToken) {
        await resetPassword(resetToken, formData.password);
        setSuccessMessage('Senha redefinida com sucesso. Agora você pode fazer login.');
        setTimeout(() => setMode('login'), 2000);
      }
    } catch (error) {
      // Error is handled by the auth context
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Entrar no Sistema de Frota';
      case 'register': return 'Criar Sua Conta';
      case 'forgot-password': return 'Redefinir Sua Senha';
      case 'reset-password': return 'Definir Nova Senha';
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case 'login': return 'Entrar';
      case 'register': return 'Criar Conta';
      case 'forgot-password': return 'Enviar Link de Redefinição';
      case 'reset-password': return 'Redefinir Senha';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Truck className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{getTitle()}</h1>
          <p className="text-gray-600">
            {mode === 'login' && 'Bem-vindo de volta! Faça login para continuar.'}
            {mode === 'register' && 'Junte-se a nós para gerenciar sua frota com eficiência.'}
            {mode === 'forgot-password' && 'Digite seu e-mail para receber um link de redefinição.'}
            {mode === 'reset-password' && 'Digite sua nova senha abaixo.'}
          </p>
        </div>

        {/* Error/Success Messages */}
        {(error || localError) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error || localError}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {successMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name field (register only) */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>
            </div>
          )}

          {/* Email field */}
          {mode !== 'reset-password' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço de E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite seu e-mail"
                  required
                />
              </div>
            </div>
          )}

          {/* Password field */}
          {mode !== 'forgot-password' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mode === 'reset-password' ? 'Nova Senha' : 'Senha'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Confirm Password field */}
          {(mode === 'register' || mode === 'reset-password') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirme sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{getButtonText()}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-2">
          {mode === 'login' && (
            <>
              <button
                onClick={() => setMode('forgot-password')}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                Esqueceu sua senha?
              </button>
              <div className="text-gray-600 text-sm">
                Não tem uma conta?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Cadastre-se
                </button>
              </div>
            </>
          )}

          {mode === 'register' && (
            <div className="text-gray-600 text-sm">
              Já tem uma conta?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Entrar
              </button>
            </div>
          )}

          {(mode === 'forgot-password' || mode === 'reset-password') && (
            <button
              onClick={() => setMode('login')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Voltar ao login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
