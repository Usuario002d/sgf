import User from "#models/security/user";
import { UserDTO } from "./dtos/dtosUtilits.js";


export default class UserService {

    public async create(userDTO: UserDTO) {
        const user = await User.create(userDTO);
        console.log(user.$isPersisted) // true
        return user.serialize();
    }

    public async update(userDTO: UserDTO) {
        const foundUser = await User.findOrFail(userDTO.id);
        return await foundUser.merge(userDTO).save();
    }

    public async inactive(userDTO: UserDTO) {
        const foundUser = await User.findOrFail(userDTO.id);
        return await foundUser.merge({ active: false }).save();
    }

    public async active(userDTO: UserDTO) {
        const foundUser = await User.findOrFail(userDTO.id);
        return await foundUser.merge({ active: true }).save();
    }

    public static async findAll() {
        return await User.all();
    }

    public async findById(id: number) {
        return await User.findOrFail(id);
    }
    public async deactivateUser(id: number) {
        try {
          const foundUser = await User.findOrFail(id); // Busca o usuário pelo id
        //   foundUser.active = false; // Atualiza o campo active para false
          await foundUser.save(); // Salva as alterações
          return foundUser; // Retorna o usuário inativado
        } catch (error) {
          throw new Error(`Erro ao inativar o usuário: ${error.message}`);
        }
      }
    
      // Método para atualizar o usuário
      public async updateUser(id: number, userDTO: UserDTO) {
        try {
          const foundUser = await User.findOrFail(id); // Busca o usuário pelo id
          // Mescla os dados passados com os existentes
          foundUser.merge(userDTO);
          await foundUser.save(); // Salva as alterações
          return foundUser; // Retorna o usuário atualizado
        } catch (error) {
          throw new Error(`Erro ao atualizar o usuário: ${error.message}`);
        }
      }
    // Função para criar um usuário
    public async createUser(userDTO: UserDTO, permissions: number[]) {
      try {
        // Criação do usuário (sem campo "permissions")
        const newUser = await User.create({
          fullName: userDTO.name,
          email: userDTO.email,
          password: userDTO.password,
          organicId: userDTO.organicId,
          accessProfileId: userDTO.profile,
          state: userDTO.state,
          isActive: userDTO.isActive,
          isTech: userDTO.isTech,
          isAdmin: userDTO.isAdmin,
          isSuperAdmin: userDTO.isSuperAdmin,
        });
    
        // Associando os menus (permissões) na tabela pivot
        if (permissions && permissions.length > 0) {
          await newUser.related('menus').attach(permissions);
        }
    
        console.log("User created:", newUser);
        return newUser.serialize();
      } catch (error) {
        console.error("Erro ao criar o usuário:", error);
        throw new Error('Erro ao criar o usuário.');
      }
    }
    
  }    
