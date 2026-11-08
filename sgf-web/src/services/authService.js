// src/services/authService.js
import apiService from "./apiService";
import apiConfig from "../config/apiConfig";

// Função de login
const login = async (username, password) => {
  try {
    const data = { email: username, password: password };
    const response = await apiService(apiConfig.LOGIN_URL, 'POST', data);
    
    // Salve o token no localStorage (ou cookie)
    localStorage.setItem("authToken", response.token);

    return response;  // Retorne a resposta para possíveis usos
  } catch (error) {
    throw error;  // Lidar com erros no componente
  }
};

// Função para obter o token armazenado
const getToken = () => {
  return localStorage.getItem("authToken");
};

// Função para logout (remover o token)
const logout = () => {
  localStorage.removeItem("authToken");
};

export { login, getToken, logout };
