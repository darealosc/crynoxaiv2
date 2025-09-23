import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { TypeORMLegacyAdapter } from "@next-auth/typeorm-legacy-adapter";


export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const res = await fetch("http://localhost:3000/api/finduser", {
          method: "POST",
          body: JSON.stringify({ email: credentials?.email, password: credentials?.password }),
          headers: { "Content-Type": "application/json" }
        });
        const user = await res.json();
        if (user && user.id) {
          return user;
        }
        throw new Error(user.error || "Invalid credentials");
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
  ],
  adapter: TypeORMLegacyAdapter({
    type: "postgres",
    host: "81.0.219.54",
    port: 5432,
    username: "postgres",
    password: "darealosc",
    database: "userdb",
    synchronize: true,
  }),
  session: {
    strategy: "jwt" as const
  },
  pages: {
    signIn: "/login"
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };