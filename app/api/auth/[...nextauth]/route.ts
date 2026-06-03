import {prisma} from "../../../lib/prisma"
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
const handler=NextAuth({
    pages: {
    signIn: "/signin",
  },
    session:{
        strategy:'jwt'
    },
    providers:[
       CredentialsProvider({
        name:"Email",
        credentials:{
            email:{
                label:"email",type:"text",placeholder:"example@gmail.com"
            },
            password:{
                label:"password",type:"password"
            }
        },
        async authorize(credentials, req) {
              const email=credentials?.email;
            const password=credentials?.password;
           if(!email || !password)return null;
            const user=await prisma.user.findUnique({
                where:{
                    email:email,
                }
            })
            if(!user){
                return null;
            }
            if(!user.password)return null;
            const isValid=await bcrypt.compare(password,user.password)
            if(!isValid)return null
            return {
                id:user.id.toString(),
                name:user.name,
                email:user.email
            }
        }
        
       }),
       Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!
  })
       
    ],
    callbacks:{
        async jwt({token,user}){
            if(user){
                token.id=user.id
            }
            return token
        },
       async session({session,token}){
        if(session.user){
            session.user.id=token.id as string
        }
        return session;
       }
    }
})
export { handler as GET, handler as POST };