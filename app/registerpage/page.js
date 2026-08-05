"use client"
import React from 'react'
import { useState,useEffect } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
const page = () => {
     const [form, setform] = useState({
        email:"",
        username:""
     })
    const handlechange=async (e) => {
        setform({...form, [e.target.name]:e.target.value})
    }
    const handlesubmit=async (e) => {
        e.preventDefault()
        await signIn("credentials",{
          email:form.email,
          username:form.username,
          redirect:true,
          callbackUrl:"/"
        })
       

    }

    return (
        <div className='flex items-center'>
            <form action="" className='bg-slate-200 rounded-xl p-4 absolute left-1/3 top-24  flex flex-col gap-5 items-center w-1/3'>
             <h1 className='font-bold text-3xl '>Devhub</h1>
              
                 <h1 className='font-bold text-xl'>Login Into Your Account</h1>
                <input type="email" name="email" id="" className='border border-black w-full rounded-md h-9 px-4 ' placeholder='Email' onChange={handlechange} value={form.email} />
                
                 
                <input type="text" name="username" id=""  className='border border-black w-full rounded-md h-9 px-4 ' placeholder='Username' onChange={handlechange} value={form.username}/>
                 
                
             
                <button onClick={handlesubmit} disabled={form?.email?.length<5||form?.username?.length<5} className='disabled:bg-blue-500 w-full h-9 bg-black text-white font-bold rounded-md'>Login</button>
                <p className='text-sm text-gray-500'>Don't have an account <Link href={"/loginpage"} className='underline'> Register here</Link> </p>
            </form>
        </div>
    )
}

export default page
