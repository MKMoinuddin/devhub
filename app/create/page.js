"use client"
import { useSession } from 'next-auth/react'
import React from 'react'
import { useState, useEffect } from 'react'
import { add, findbyid } from '@/actions/useractions'

import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
function Createpost() {
    const { data: session } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()


    const [title, settitle] = useState("")
    const [bio, setbio] = useState([""])
    const [pic, setpic] = useState([""])


    useEffect(() => {
        if (session?.user?.name) {
            const id = searchParams.get("id")
            if (id) {
                editcomment(id)
            }
        }
    }, [session])

    const editcomment = async (id) => {
        try {
            let post = await findbyid(id)

            if (post) {
                settitle(post.title)
                setbio(post.bio)
                setpic(post.pic)
            }
        } catch (err) {
            console.log(err)
        }

    }

    const handletitlechange = (e) => {
        settitle(e.target.value)
    }
    const handlechange = async (value, index, state) => {
        if (state === "bio") {
            let newbio = [...bio]
            newbio[index] = value
            setbio(newbio)
        }
        else {
            let newpic = [...pic]
            newpic[index] = value
            setpic(newpic)
        }
    }
    const handlesubmit = async (done) => {
       
        const got = await add(session?.user?.name, session?.user?.image, title, bio, pic, done)

        settitle("")
        setbio([""])
        setpic([""])
        router.push("/blogs")


    }
    const addinput = async (state) => {
        if (state === "bio") {
            setbio([...bio, ""])
        }
        else {
            setpic([...pic, ""])
        }
    }

    return (
        <>

            <div>

                <h1 className='text-2xl font-bold my-5 text-center'>Create the Post You Like</h1>



                <form className='flex flex-col justify-center items-center my-5 gap-5'>
                    <div className='flex gap-5 justify-center items-center w-full'>
                        <label htmlFor="title" className='text-xl'>title:</label>
                        <input onChange={handletitlechange} value={title} type="text" name="title" id="" placeholder='enter the title of the post' className=' px-5 w-4/6 py-3 bg-slate-300 rounded-2xl border-black border-2  ' />
                    </div>
                    <div className='flex gap-4 w-full'>
                        <div className='flex flex-col  gap-4 flex-1  '>
                            {bio.map((b, index) => (
                                <div key={index} className='flex  items-center gap-5'>
                                    <label htmlFor="bio" className='text-xl w-20 shrink-0'>Bio {index + 1}:</label>
                                    <input onChange={(e) => { handlechange(e.target.value, index, "bio") }} value={b} type="text" name="bio" id="" placeholder='enter the bio of the post' className='flex-1 px-5 outline-none focus:ring-2 focus:ring-blue-300 py-3 bg-slate-300 rounded-2xl border-black border-2  ' />
                                </div>

                            ))}
                        </div>
                        <button type='button' onClick={() => { addinput("bio") }} className='rounded-lg bg-slate-300 p-2 border border-black self-start hover:bg-slate-500 transition'>
                            <img src="/plus.png" className='w-8 h-8' alt="" />
                        </button>
                    </div>
                    <div className='flex gap-5 w-full'>
                        <div className='flex flex-1 flex-col gap-4'>


                            {pic.map((p, index) => (
                                <div key={index} className='flex items-center gap-4'>
                                    <label htmlFor="pic" className='text-xl w-20 shrink-0 '>Pic {index + 1}:</label>
                                    <input value={p} onChange={(e) => { handlechange(e.target.value, index, "pic") }} type="text" name="pic" id="" placeholder='enter your pic' className=' px-5 flex-1 py-3 bg-slate-300 rounded-2xl border-black border-2 outline-none focus:ring-2 focus:ring-blue-300  ' />
                                </div>
                            ))}
                        </div>

                        <div onClick={() => { addinput("pic") }} className='rounded-lg self-start  hover:bg-slate-500 transition bg-slate-300 p-2 border border-black'>
                            <img src="/plus.png" className='w-8 h-8' alt="" />
                        </div>
                    </div>
                    <div className='flex gap-5'>
                        <button type='button' onClick={() => { handlesubmit(true) }} disabled={title?.length < 5} className="disabled:to-red-600 disabled:from-green-400 w-30 rounded-md relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-heading rounded-base group bg-linear-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800">
                            <span className=" relative px-4 py-2.5 transition-all ease-in duration-75 bg-neutral-primary-soft rounded-base group-hover:bg-transparent group-hover:dark:bg-transparent leading-5">
                                Save the post
                            </span>
                        </button>
                        <button type='button' onClick={() => { handlesubmit(false) }} disabled={title?.length < 5} className="disabled:to-red-600 w-30 disabled:from-green-400 rounded-md relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-heading rounded-base group bg-linear-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800">
                            <span className=" relative px-4 py-2.5 transition-all ease-in duration-75 bg-neutral-primary-soft rounded-base group-hover:bg-transparent group-hover:dark:bg-transparent leading-5">
                                Draft the post
                            </span>
                        </button>
                    </div>
                </form>
                <div className='px-20'>
                    <Link href={"/blogs"} ><button className="rounded-md relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-heading rounded-base group bg-linear-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800">
                        <span className=" relative px-4 py-2.5 transition-all ease-in duration-75 bg-neutral-primary-soft rounded-base group-hover:bg-transparent group-hover:dark:bg-transparent leading-5">
                            go to your posts
                        </span>
                    </button>
                    </Link>
                </div>

            </div>
        </>
    )
}


 

    export default  function page(){
        return(
           <Suspense fallback={<div>Loading...</div>}>
            <Createpost />
        </Suspense>
        )
    }
