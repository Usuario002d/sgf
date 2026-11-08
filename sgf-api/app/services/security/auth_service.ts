import User from "#models/security/user";
import { Secret } from "@adonisjs/core/helpers";
import jwt from 'jsonwebtoken';  // Importando jsonwebtoken corretamente
import env from '#start/env';  // Importando a configuração de ambiente

export default class AuthService {

    public static async authenticate(email: string, password: string) {
        /**
        * Verifica as credenciais do usuário
        */
        const user = await User.verifyCredentials(email, password);
        /**
        * Agora faz login do usuário ou cria um token para ele
        */
        const token = await User.accessTokens.create(user);
        console.log("Credenciais", user);

        // Aqui usamos a chave secreta do APP_KEY para assinar o token
        const appKey = env.get('APP_KEY');  // Obtém o APP_KEY do arquivo .env

        // Criando o token JWT
        const jwtToken = jwt.sign({ userId: user.id }, appKey, { expiresIn: '1h' });
        console.log("Credenciais do token", jwtToken);

        return {
            type: 'bearer',
            value: jwtToken,  // Retorna o token assinado com APP_KEY
        };
    }

    /**
     * Verifica o token e retorna o id do usuário
     */
    public static async verifyToken(token: string) {
        if (!token) {
            throw new Error('Token não fornecido');
        }
      
        console.log("Token recebido:", token);
      
        try {
            // Remover o prefixo 'Bearer' se estiver presente
            const tokenWithoutBearer = token.startsWith('Bearer ')
                ? token.slice(7).trim()
                : token;
      
            console.log("Token sem Bearer:", tokenWithoutBearer);
      
            // Decodifica o token sem validar a assinatura
            const decoded = jwt.decode(tokenWithoutBearer);
            console.log("Token decodificado:", decoded, decoded);

            const userId = decoded.userId;
            console.log("User ID:", userId);

      
            if (!decoded) {
                throw new Error('Token inválido ou malformado');
            }
      
            // Retorna o userId extraído do token
            return decoded.userId;
        } catch (error) {
            console.error("Erro ao decodificar o token:", error.message);
            throw new Error('Token inválido ou expirado');
        }
    }
}
