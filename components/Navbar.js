"use client"
import React from 'react'
import Link from 'next/link'
 
import { signOut, useSession } from 'next-auth/react'
const Navbar = () => {
    const { data: session } = useSession()
   
    const signout = async () => {
    await signOut({
        callbackUrl: "/login",
    });
};
    

    return (
        <div>
            <nav className='h-16 bg-blue-200 px-5 flex justify-between items-center'>
                    <Link href={"/"}> <div className="title text-3xl font-bold">
                     Devhub</div></Link>
                <ul className='flex gap-5'>
                    {!session && <Link href={"/login"}><button className="rounded-md relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-heading rounded-base group bg-linear-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800">
                        <span className=" relative px-4 py-2.5 transition-all ease-in duration-75 bg-neutral-primary-soft rounded-base group-hover:bg-transparent group-hover:dark:bg-transparent leading-5">
                            Login
                        </span>
                    </button></Link>}
                    {session && <Link href={`/${session?.user?.name}`}><button className="rounded-md relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-heading rounded-base group bg-linear-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800">
                        <span className=" relative px-4 py-2.5 transition-all ease-in duration-75 bg-neutral-primary-soft rounded-base group-hover:bg-transparent group-hover:dark:bg-transparent leading-5">
                            Welcome {session?.user?.name}
                        </span>
                    </button></Link>}
                    {session && <button onClick={signout} className="rounded-md relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-heading rounded-base group bg-linear-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800">
                        <span className=" relative px-4 py-2.5 transition-all ease-in duration-75 bg-neutral-primary-soft rounded-base group-hover:bg-transparent group-hover:dark:bg-transparent leading-5">
                            Logout
                        </span>
                    </button>}
                </ul>
            </nav>
        </div>
    )
}

export default Navbar
