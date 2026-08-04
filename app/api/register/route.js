import { NextResponse } from "next/server";
import connectDb from "@/db/connectDb";
import user from "@/app/models/user";

export async function POST(req) {
    await connectDb()
    const {email,username,profilepic}=await req.json()
    const emailexists=await user.findOne({email:email})
    if(emailexists){
        return NextResponse.json({
            message:"account is already there"},
            {status:400}
        )
    }
}