import User from "#models/security/user";
import jwt from 'jsonwebtoken';
import env from '#start/env';

export default class AuthService {

    public static async authenticate(email: string, password: string) {
        const user = await User.verifyCredentials(email, password);
        await User.accessTokens.create(user);

        const appKey = env.get('APP_KEY') || 'z8F7xK2mP9qR4vW1nL6jB3yT5cH0dG8s';
        const jwtToken = jwt.sign({ userId: user.id }, appKey, { expiresIn: '1h' });

        return {
            type: 'bearer',
            value: jwtToken,
        };
    }

    public static async verifyToken(token: string) {
        if (!token) {
            throw new Error('Token não fornecido');
        }
        try {
            const tokenWithoutBearer = token.startsWith('Bearer ')
                ? token.slice(7).trim()
                : token;
            const decoded: any = jwt.decode(tokenWithoutBearer);
            if (!decoded) {
                throw new Error('Token inválido ou malformado');
            }
            return decoded.userId;
        } catch (error: any) {
            console.error("Erro ao decodificar o token:", error.message);
            throw new Error('Token inválido ou expirado');
        }
    }
}
