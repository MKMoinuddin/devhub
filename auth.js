import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Facebook from "next-auth/providers/facebook";
import Twitter from "next-auth/providers/twitter";
import GitHub from "next-auth/providers/github";
import connectDb from "./db/connectDb";
import User from "./app/models/user";
import Credentials from "next-auth/providers/credentials";
console.log("AUTH_SECRET EXISTS:", !!process.env.AUTH_SECRET);
export const { handlers, signIn, signOut, auth } = NextAuth({
    secret: process.env.AUTH_SECRET,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),
        GitHub({

        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: {},
                username: {}
            },
            async authorize(credentials) {
                await connectDb()
                const user = await User.findOne({
                    email: credentials.email,
                    username:credentials.username
                });

                if (!user) {
                    return null;
                }
                
                
                return {
                    id: user._id.toString(),
                    email: user.email,
                    username: user.username,
                    profilepic: user.profilepic,
                };
            }
        })
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account.provider === "google") {

                

                await connectDb();
                const exists = await User.findOne({
                    email: user.email
                })
                if (!exists) {
                    await User.create({
                        username: user.name,
                        email: user.email,

                        profilepic: user.image,

                    });
                }
                return profile.email_verified && profile.email.endsWith("@gmail.com")
            }
            if (account.provider == "github") {
                

            }

            return true
        },
        async jwt({token,user,account}){
            if(user&&account?.provider=="credentials"){
                token.name=user.username
                token.image=user.profilepic
            }
            return token
        },
        async session({session,token}){
            if(token.name){
                session.user.name=token.name
            }
            if(token.image){
                session.user.image=token.image
            }
            return session
        }

    },
})