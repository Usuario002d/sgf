// src/services/apiService.js
import axios from "axios";
import apiConfig from "../config/apiConfig";

// Função genérica para chamadas à API
const apiService = (endpoint, method = 'GET', data = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    url: endpoint,
    method: method,
    headers: headers,
    data: data,
  };

  return axios(config)
    .then(response => response.data)
    .catch(error => {
      throw error.response ? error.response.data : new Error("Erro de conexão com a API");
    });
};

export default apiService;
