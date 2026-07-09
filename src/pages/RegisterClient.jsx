�import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, Gift, Copy, Check, AlertCircle, X } from 'lucide-react';

import { SettingsContext } from "../context/SettingsContext";

const RegisterClient = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();
  const { settings } = useContext(SettingsContext);

  const welcomeCode = settings?.welcomeCouponCode || "BEMVINDO10";
  const welcomeDiscount = settings?.welcomeCouponDiscount || 10;

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirm: ""
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const onFinish = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao registrar");
      }

      setModalVisible(true);
    } catch (err) {
      setError(err.message || "Erro ao registrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    navigate("/login");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(welcomeCode);
    alert("Código copiado!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gray-900 px-8 py-6 text-center">
          <h2 className="text-3xl font-extrabold text-white">Criar Conta</h2>
          <p className="text-gray-400 mt-2">Junte-se a nós e aproveite ofertas exclusivas</p>
        </div>

        <div className="p-8">
          <form onSubmit={onFinish} className="space-y-5">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome de Usuário</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-gray-400" size={18} />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Ex: joaosilva"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="******"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Check className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="password"
                    name="confirm"
                    value={formData.confirm}
                    onChange={handleChange}
                    placeholder="Repita"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 mt-4"
            >
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : "Registrar Conta"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-800">
              Faça Login
            </Link>
          </div>
        </div>
      </div>

      {/* WELCOME MODAL */}
      {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center relative shadow-2xl transform transition-all scale-100">
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                <Gift className="text-yellow-500" size={40} />
              </div>
            </div>

            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Bem-vindo à Lumo!</h2>
            <p className="text-gray-500 mb-6">
              Obrigado por se registrar. Como presente de boas-vindas, preparemos um presente especial para sua primeira compra:
            </p>

            <div className="bg-yellow-50 border-2 border-dashed border-yellow-300 rounded-xl p-6 mb-8 relative group">
              <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest block mb-2">Seu Cupom Exclusivo</span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-black text-gray-900 tracking-wider font-mono">{welcomeCode}</span>
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-yellow-200 rounded-lg transition-colors text-yellow-700"
                  title="Copiar código"
                >
                  <Copy size={20} />
                </button>
              </div>
              <p className="text-sm text-yellow-700 mt-2 font-medium">{welcomeDiscount}% de Desconto Extra</p>
            </div>

            <button
              onClick={handleModalClose}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
            >
              Ir para Login e Aproveitar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterClient;
