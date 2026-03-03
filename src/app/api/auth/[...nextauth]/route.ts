import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import * as bcrypt from "bcryptjs";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email et mot de passe requis");
                }

                const user = await (prisma as any).utilisateur.findUnique({
                    where: { email: credentials.email }
                });

                if (user && user.password) {
                    const isValid = await bcrypt.compare(credentials.password, user.password);

                    if (isValid) {
                        return {
                            id: user.id.toString(),
                            name: `${user.prenom} ${user.nom}`,
                            email: user.email,
                            profil: user.profil,
                        };
                    }
                }

                return null;
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
                token.profil = user.profil;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.profil = token.profil;
            }
            return session;
        }
    },
    debug: process.env.NODE_ENV === "development",
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
