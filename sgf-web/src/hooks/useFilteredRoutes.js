import { useSelector } from 'react-redux';
import { filterRoutes } from '../routes/dashboardRoutes';

const useFilteredRoutes = () => {
  const { user } = useSelector(state => state.auth);
  
  if (!user) return [];
  
  return filterRoutes(dashboardRoutes, {
    ...user,
    permissions: {
      disponivel: false,
      reconBancaria: user.permissions?.reconBancaria || false,
      planoOrcamento: user.permissions?.planoOrcamento || false,
      requisoesFundos: user.permissions?.requisoesFundos || false,
      relatoriosGlobais: user.permissions?.relatoriosGlobais || false,
      contasReceberPagar: user.permissions?.contasReceberPagar || false
    },
    isAdmin: user.isAdmin || false
  });
};

export default useFilteredRoutes;