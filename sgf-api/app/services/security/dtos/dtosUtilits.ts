import { LifeclicleState } from "#models/utility/Enums";
import { DateTime } from "luxon";

/*
 * Model que representa um 'DTO do utilizador'
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
interface DomainDTO {
  id: number;
  createdAt: DateTime | undefined; // A data de criação pode ser indefinida
  updatedAt: DateTime;            // A data de atualização deve sempre existir
}

export interface AuthDTO {
  email: string;
  password: string;
}

export interface OrganicDTO extends DomainDTO {
  code: string;
  description: string;
}

export interface AccessProfileDTO extends DomainDTO {
  code: string;
  description: string;
}

export interface PermissionsDTO {
  planoOrcamento: boolean;
  requisoesFundos: boolean;
  contasReceberPagar: boolean;
  disponivel: boolean;
  reconBancaria: boolean;
  relatoriosGlobais: boolean;
}
export interface UserDTO {
  id: number;
  fullName: string;
  name: string;
  email: string;
  password: string;
  organicId: number; // Alterado para number
  profile: number;
  state: LifeclicleState.ACTIVE; // Restringido para ACTIVE
  isActive: boolean;
  isTech: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  permissions: string;
}

// export interface UserDTO extends DomainDTO {
//   fullName: string;                // Nome completo do usuário
//   email: string;                   // E-mail do usuário
//   password: string;                // Senha do usuário
//   organicId: number | null;        // ID do órgão relacionado (opcional)
//   accessProfileId: number;        // ID do perfil de acesso
//   state: number;                   // Estado do usuário (0 - inativo, 1 - ativo)
//   createdBy: DateTime | null;      // Quem criou o usuário (timestamp opcional)
//   updatedBy: DateTime | null;      // Quem atualizou o usuário (timestamp opcional)
//   isActive: number;   // Alterado de boolean para number
//   isTech: number;     // Alterado de boolean para number
//   isAdmin: number;    // Alterado de boolean para number
//   isSuperAdmin: number; // Alterado de boolean para number       // Se o usuário é superadministrador
//   permissions: PermissionsDTO;     // Permissões associadas ao usuário
//   organic: OrganicDTO;             // Dados relacionados ao órgão
//   accessProfile: AccessProfileDTO; // Dados do perfil de acesso
// }
