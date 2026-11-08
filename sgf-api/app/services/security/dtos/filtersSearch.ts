import { DateTime } from "luxon";

/*
* Model que representa um 'DTO do utilizador'
* Gautchi R. Chambe (chambegautchi@gmail.com)
*/
export interface UserFilters{
  username: String,
  fullName: string,
  email: string,
  createdAt: DateTime,
  updatedAt: DateTime
}