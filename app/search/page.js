"use client"
import { searchuser } from '@/actions/useractions'
import React from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
const page = () => {
    const [search, setsearch] = useState("")
    const [data, setdata] = useState([])
    const [submit, setsubmit] = useState(false)
    const router=useRouter()
    const handlechange=async (value) => {
        setsearch(value)
        let res=[]
        if(value.length>0){
            res=await searchuser(value)
        }
        setdata(res)

    }
    const handlesearch=async () => {
      setsubmit(!submit)

    }
    const handleback=async () => {
      setsubmit(!submit)
      setsearch("")
      setdata([])
      router.push("/")

    }


  return (
    <div>
      <div className='flex gap-10'>
       <button onClick={handleback} type="button" className='  hover:bg-slate-200 hover:rounded-lg p-2 w-fit'>
            <img src="/back.png" className='w-8 h-8' alt="" />
        </button>
        <h1 className=' font-bold text-2xl my-5'>Search the Author You Like</h1>
        </div>
      <form className={` ${submit?"hidden":"vsible"} w-full flex items-center p-20`} >
        
        <input onChange={(e)=>{handlechange(e.target.value)}} value={search} type="text" name="" id="" className=' border-2 p-2 flex-1 border-gray-300 rounded-md' />
        <button onClick={handlesearch} type="button" className=' hover:bg-slate-200 hover:rounded-lg p-2 w-fit'  placeholder="Search posts, users, or topics...">
            <img src="/search.png" className=' w-8 h-8' alt=""  />
        </button>
      </form>
      <div className='flex flex-col items-center justify-center gap-3'>
      {data.map((d,index)=>{
        return(
              <Link key={index} href={`/${d.username}?profilepic=${d.profilepic}`}>
            <div   className='flex gap-4 items-center rounded-md border border-black p-2 w-full'  >
                  <img src={d.profilepic||null} alt="" className='w-8 h-8 rounded-full' />
                <h1 className=' text-xl'>{d.username}</h1>
               
            </div>
            </Link>
        )
      })}
      </div>
    </div>
  )
}

export default page
