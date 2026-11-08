// app/Controllers/Http/MenuController.js

import Menu from '../../models/security/menu.js';

export default class MenuController {
  // Método para buscar os menus de um usuário baseado no seu papel ou permissões
  async getMenus({ request, response }) {
    console.log("chegou");
    try {
      const userId = request.input('userId') || request.qs().userId;
      console.log("userId", userId);
  
      if (!userId) {
        return response.status(400).json({
          message: 'ID do usuário é obrigatório',
        });
      }
  
      // 1. Buscar todos os menus filhos associados ao usuário
      const childMenus = await Menu.query()
        .whereNotNull('parent_id')
        .whereHas('users', (query) => {
          query.where('user_id', userId);
        });
  
      // 2. Obter IDs únicos dos pais desses filhos
      const parentIds = [...new Set(childMenus.map(menu => menu.parentId))];
  
      // 3. Buscar os menus pais com base nesses IDs
      const parentMenus = await Menu.query()
        .whereIn('id', parentIds)
        .preload('children', (childQuery) => {
          childQuery.whereHas('users', (query) => {
            query.where('user_id', userId);
          });
        });
  
      // 4. Estruturar o retorno: pai + filhos autorizados
      const structuredMenus = parentMenus.map(parent => ({
        name: parent.name,
        path: parent.path,
        icon: parent.icon,
        children: parent.children.map(child => ({
          name: child.name,
          path: child.path,
          icon: child.icon,
        })),
      }));
  
      return response.status(200).json(structuredMenus);
    } catch (error) {
      console.error(error);
      return response.status(500).json({
        message: 'Erro ao buscar menus',
        error: error.message,
      });
    }
  }
  
  
  

  // Método para buscar todos os menus (sem restrições de autenticação)
  async getAllMenus({ response }) {
    try {
      const menus = await Menu.query().exec(); // Buscar todos os menus

      return response.status(200).json(menus);
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao buscar menus',
        error: error.message,
      });
    }
  }
}
