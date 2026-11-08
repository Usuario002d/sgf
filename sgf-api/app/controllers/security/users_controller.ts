import { inject } from '@adonisjs/core';
import { HttpContext } from '@adonisjs/core/http';
import UserService from '../../services/security/user_service.js';
import UserValidator from '#validators/security/user';
import AuthService from '../../services/security/auth_service.js'

/**
 * Controller de Usuários
 */
@inject()
export default class UsersController {

  constructor(
    private userService: UserService, // Injetando o serviço de usuário
    private authService: AuthService // Injetando o serviço de autenticação
  ) { }

  /**
   * Exibe a lista de todos os usuários
   */
  async index({ response }: HttpContext) {
    try {
      const users = await UserService.findAll(); // Chama o serviço para listar todos os usuários
      return response.ok(users);
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao listar usuários',
        error: error.message,
      });
    }
  }

  /**
   * Exibe um usuário específico pelo ID
   */
  async findBy({ request, response }: HttpContext) {
    const { id } = request.param('id'); // Pegando o ID do usuário da URL

    try {
      const user = await this.userService.findById(id); // Chama o serviço para encontrar o usuário
      return response.ok({ user });
    } catch (error) {
      return response.status(404).json({
        message: 'Usuário não encontrado.',
        error: error.message,
      });
    }
  }

  /**
   * Criação de um novo usuário
   */
  async createUser({ request, response }: HttpContext) {
    try {
      const data = await request.validateUsing(UserValidator.validateFields());
      const permissions = request.body().permissions || [];
  
      console.log("Dados validados:", data);
      console.log("Permissões recebidas:", permissions);
  
      const user = await this.userService.createUser(data, permissions);
  
      return response.created({
        message: 'Usuário criado com sucesso.',
        data: user,
      });
    } catch (error) {
      console.error("Erro ao criar o usuário:", error);
  
      // Verifica se o erro é de duplicação de email
      if (error.code === 'ER_DUP_ENTRY') {
        return response.status(400).json({
          message: 'Este e-mail já está em uso.',
          error: error.message,
        });
      }
  
      // Para outros erros, retorna uma mensagem genérica
      return response.status(500).json({
        message: 'Erro ao criar o usuário.',
        error: error.message,
      });
    }
  }
  
  


  /**
   * Atualização dos dados de um usuário
   */
  async updateUser({ request, response }: HttpContext) {
    const { id } = request.param('id'); // Pegando o ID do usuário da URL
    const data = request.body(); // Pegando os dados para atualização

    try {
      const updatedUser = await this.userService.updateUser(id, data); // Chama o serviço para atualizar o usuário
      return response.ok({
        message: 'Usuário atualizado com sucesso.',
        data: updatedUser,
      });
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao atualizar o usuário.',
        error: error.message,
      });
    }
  }

  /**
   * Inativação (delete lógico) de usuário
   */
  async deactivateUser({ request, response }: HttpContext) {
    const { id } = request.param('id'); // Pegando o ID do usuário

    try {
      const deactivatedUser = await this.userService.deactivateUser(id); // Chama o serviço para inativar o usuário
      return response.ok({
        message: 'Usuário inativado com sucesso.',
        data: deactivatedUser,
      });
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao inativar o usuário.',
        error: error.message,
      });
    }
  }



  public async getUser({ request, response }: HttpContext) {
    try {
      // Pega o token do cabeçalho da requisição
      const token = request.header('Authorization');

      console.log("Token", token)

      // Verifica o token e pega o userId
      const userId = await AuthService.verifyToken(token); // Verifica o token e obtém o userId

      // Busca os dados do usuário no banco
      const user = await this.userService.findById(userId); // Supondo que você tenha um método findById

      if (!user) {
        return response.status(404).json({
          message: 'Usuário não encontrado',
        });
      }

      return response.ok({ user }); // Retorna os dados do usuário
    } catch (error) {
      return response.status(401).json({
        message: 'Falha na autenticação.',
        error: error.message,
      });
    }
  }
}
