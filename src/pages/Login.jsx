import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

import { AuthContext } from "../context/Authcontext";
import { SettingsContext } from "../context/SettingsContext";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { loginUser, loginAdmin } = useContext(AuthContext);
  const { settings } = useContext(SettingsContext);

  const [formData, setFormData] = useState({ login: "", password: "" });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.login || !formData.password) {
      setError("Preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/auth/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.login.trim(), password: formData.password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha no login');
      }

      const data = await response.json();
      const { token, name, email, role, userId, vendorInfo } = data;

      if (role === "admin") {
        loginAdmin({ id: userId, name, email, token, role });
        localStorage.setItem("adminToken", token);
        localStorage.setItem("token", token);
        navigate("/admin/dashboard");
      } else if (role === "vendor") {
        loginUser({ id: userId, name, email, token, role, vendorInfo });
        localStorage.setItem("userToken", token);
        localStorage.setItem("token", token);
        navigate("/vendor/dashboard");
      } else {
        loginUser({ id: userId, name, email, token, role });
        localStorage.setItem("userToken", token);
        localStorage.setItem("token", token);
        navigate("/");
      }

    } catch (err) {
      console.error(err);
      // Check if account is blocked
      if (err.message && (err.message.includes('bloqueada') || err.message.includes('blocked') || err.message.includes('suspensa'))) {
        setError('ACCOUNT_BLOCKED');
      } else {
        setError(err.message || "Erro ao fazer login. Verifique suas credenciais.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 px-8 py-6 text-center">
          <h2 className="text-3xl font-extrabold text-white">Bem-vindo</h2>
          <p className="text-blue-100 mt-2">FaÃ§a login para continuar</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error === 'ACCOUNT_BLOCKED' ? (
              <div className="bg-red-600 text-white p-6 rounded-xl border-4 border-red-700 shadow-2xl">
                <div className="flex items-start gap-4">
                  <div className="bg-white rounded-full p-3">
                    <AlertCircle className="text-red-600" size={32} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-extrabold mb-2">ðŸš« CONTA BLOQUEADA</h3>
                    <p className="text-red-100 mb-4 leading-relaxed">
                      Sua conta foi suspensa ou bloqueada. VocÃª nÃ£o pode fazer login no momento.
                    </p>
                    <div className="bg-red-700 p-4 rounded-lg">
                      <p className="font-bold mb-2">ðŸ“ž Entre em contato com o suporte:</p>
                      <div className="space-y-1 text-sm">
                        {settings?.contactEmail && (
                          <p>âœ‰ï¸ Email: <a href={`mailto:${settings.contactEmail} `} className="underline font-semibold">{settings.contactEmail}</a></p>
                        )}
                        {settings?.contactPhone && (
                          <p>ðŸ“± Telefone: <a href={`tel:${settings.contactPhone} `} className="underline font-semibold">{settings.contactPhone}</a></p>
                        )}
                        {!settings?.contactEmail && !settings?.contactPhone && (
                          <p className="text-red-100">Por favor, entre em contato atravÃ©s da pÃ¡gina de Contato.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3">
                <AlertCircle className="text-red-500" size={20} />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email ou UsuÃ¡rio</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input
                  type="text"
                  name="login"
                  value={formData.login}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="exemplo@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400" size={20} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" class="text-sm font-medium text-blue-600 hover:text-blue-800">
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><LogIn size={20} /> Entrar</>}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            NÃ£o tem uma conta?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-800">
              Registre-se grÃ¡tis
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
