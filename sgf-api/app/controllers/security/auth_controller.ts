import type { HttpContext } from '@adonisjs/core/http'
import AuthService from '../../services/security/auth_service.js'
import { loginValidator } from '../../validators/security/auth.js';
import User from '#models/security/user';


/**
 * Gautchi Rogério Chambe
 */
export class AuthController {

  async login({ request }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator);
    //const { email, password } = request.only(['email', 'password'])
    return AuthService.authenticate(email, password);
  }

  async logout({ auth }: HttpContext) {

    const user = auth.user!;
    const acessToken = user.currentAccessToken;

    if (acessToken != undefined) {
      await User.accessTokens.delete(user, acessToken.identifier);
      return ({ message: 'sussess' })
    }

    return ({ message: 'error' })

  }

  async isAuthenticated({ auth }: HttpContext) {
    await auth.check()
    return { user: auth.user }
  }

  /*
  async resetPassword({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
   // response.accepted(AuthService.resetPassword(email, password));
  }
  */
}