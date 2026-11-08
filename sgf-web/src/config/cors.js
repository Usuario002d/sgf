const corsConfig = {
  enabled: true,
  origins: '*', // Ou substitua '*' com a URL do seu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Certifique-se de incluir 'GET'
  headers: ['Content-Type', 'Authorization'],
  maxAge: 90,
};

export default corsConfig;
