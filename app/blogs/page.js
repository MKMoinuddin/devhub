"use client"
import React from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Nestedcomments from '@/components/Nestedcomments'
import { addcomments, addlikes, deletepost, fetchpost, sortpost, getallcomments } from '@/actions/useractions'

import Image from 'next/image'
const page = () => {
    const { data: session, status } = useSession()

    const [data, setdata] = useState([])
    const [filter, setfilter] = useState([])
    const [oncomment, setoncomment] = useState(null)
    const [comment, setcomment] = useState({})
    const [open, setopen] = useState(false)
    const [search, setsearch] = useState("")
    const [commentdata, setcommentdata] = useState([])
    const [commentlayer, setcommentlayer] = useState(false)
    const [likedpost, setlikedpost] = useState({})
    const rootcomments = commentdata.filter(
        c => c.parentCommentId === null
    );
    useEffect(() => {
        console.log("comment data", commentdata)
        console.log("root comments", rootcomments)

    }, [commentdata])


    useEffect(() => {


        if (session?.user?.name) {

            getdata(session.user.name)

        }

    }, [session])
    useEffect(() => {
        if (oncomment) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [oncomment]);

    const getdata = async (username) => {

        let u = await fetchpost(username)
        setdata(u)
        setfilter(u)




    }
    const handlelikes = async (id) => {

        const like = likedpost[id]
        if (!like) {
            let l = await addlikes(id, like)
            setdata(data.map(post =>
                post._id === id
                    ? { ...post, likes: post.likes + 1 }
                    : post
            ))
            setfilter(data.map(post =>
                post._id === id
                    ? { ...post, likes: post.likes + 1 }
                    : post
            ))
            setlikedpost(
                prev => (
                    {
                        ...prev,
                        [id]: !like
                    }
                )
            )
        }
        else {
            let l = await addlikes(id, like)
            setdata(data.map(post =>
                post._id === id
                    ? { ...post, likes: post.likes - 1 }
                    : post
            ))
            setfilter(data.map(post =>
                post._id === id
                    ? { ...post, likes: post.likes - 1 }
                    : post
            ))
            setlikedpost(
                prev => (
                    {
                        ...prev,
                        [id]: !like
                    }
                )
            )
        }

    }

    const getcomments = async (id) => {


        setoncomment(id)
        console.log("afg")
        let c = await getallcomments(id)
        setcommentdata(c)


        const roots = c.filter(comment => comment.
            parentCommentId
            === null);



    }
    const handledelete = async (id) => {
        let sure = confirm("do you want to delete")
        if (sure) {
            await deletepost(id)
            setdata(data.filter(post => post._id !== id))
            setfilter(data.filter(post => post._id !== id))
        }
    }
    const handlesort = async (sort) => {
        setdata(await sortpost(sort, session?.user?.name))
        setfilter(await sortpost(sort, session?.user?.name))
        setopen(!open)
    }
    const handlesearch = (e) => {
        const value = e.target.value
        setsearch(value)
        if (value == "") {
            getdata(session?.user?.name)
            console.log(session?.user?.name)
        }
        else {
            setfilter(data.filter(post => post.title.toLowerCase().includes(value.toLowerCase())))
            console.log(filter)
        }
    }
    const handlecomments = async (id, username, text, pic) => {
        let a = await addcomments(username, id, text, session?.user.image, null)
        let c = await getallcomments(id)
        setcommentdata(c)


    }

    return (
        <div>
            <div className='mt-5 flex gap-5 px-5'>
                <div>

                    <div onBlur={() => { setTimeout(() => { setopen(!open) }, 100); }} onClick={() => { setopen(!open) }} className='w-35 text-center bg-linear-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 rounded-md p-4'>Sort By</div>
                    {open && <div className='absolute top-35 bg-linear-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 rounded-md'>
                        <ul className='flex flex-col gap-2 w-35 p-4'>
                            <li onClick={() => { handlesort("likes") }}>Likes</li>
                            <li onClick={() => { handlesort("alphabet") }}>Alphabetical</li>
                            <li onClick={() => { handlesort("created") }}>Created</li>
                        </ul>
                    </div>}
                </div>
                <Link href={"/create"}><button className="rounded-md relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-heading rounded-base group bg-linear-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 h-14">
                    <span className=" relative px-4 py-2.5 transition-all ease-in duration-75 bg-neutral-primary-soft rounded-base group-hover:bg-transparent group-hover:dark:bg-transparent leading-5">
                        Create New Post
                    </span>
                </button></Link>

                <input type="text" name="search" id="" value={search} onChange={handlesearch} placeholder=' Search The Post You Like' className=' rounded-md bg-linear-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 h-14  flex-1 placeholder:text-center pl-4' />
            </div>
            {filter.map((d, i) => {
                return (
                    <div key={i} className='flex flex-col my-5 mx-10 border-black border-2 rounded-2xl p-5 gap-5 '>
                        {!d.done && <div className='flex items-center gap-5 border-2 w-1/3 p-5 border-black'> <div className='p-2 h-4 w-4 bg-red-500 rounded-full'></div> <p className='text-2xl font-bold'> Drafted Post</p></div>}
                        <div className='flex gap-3 items-center '>
                            <img src={session?.user?.image} className='w-10 h-10 rounded-full' alt="" />
                            <div className='text-xl font-bold'>{session?.user?.name}</div>
                        </div>
                        <div className="title text-2xl ">{d.title}</div>
                          <div className='flex flex-col gap-2'>
                            {d.bio.map((b,index)=>{
                                return(
                                   
                                        <p key={index}>{b}</p>
                                  
                                )
                            })}
                        </div>
                        {/* if({d.pic}){ */}
                        <div className=' grid grid-cols-2 gap-2'>
                            {d.pic.map((p,index)=>{
                                return(
                        <img key={index}
                            src={p}
                            className='rounded-2xl w-full h-full'
                        >
                        </img>
                                )
                            })}
                        </div>

                        <div className='icons flex justify-around'>
                            {/* <button onClick={() => { handlelikes(d._id) }} className='hover:cursor-pointer hover:scale-3d hover:scale-110 hover:shadow-xl hover:shadow-red-400 transition'><div className="like flex gap-2 items-center">
                                {likedpost[d._id] && <img src="/heart.png" className='h-10 w-10' alt="" />}
                                {!likedpost[d._id] && <img src="/like.png" className='h-10 w-10' alt="" />}
                                <span>{d.likes}</span>
                            </div></button>
                            <div>
                                <button onClick={() => { getcomments(d._id) }} className='hover:cursor-pointer hover:scale-3d hover:scale-110 hover:shadow-xl hover:shadow-blue-600 transition'><div className=" flex gap-2 items-center">
                                    <img src="/comment.png" className='h-10 w-10' alt="" />

                                    <div>{d?.comments?.length > 0 ? d?.comments?.length : 0}</div>
                                </div>
                                </button>

                                <div className={`bg-black w-full left-0 h-screen transition-transform duration-300 fixed bottom-0 scrollbar      overflow-y-auto   text-white ${oncomment === d._id ? "translate-y-0" : "translate-y-full scroll-y-auto w-full"}  `}>
                                    <div className='flex justify-between -4 '>
                                        <h1 className='text-2xl'>Comments</h1>
                                        <button onClick={() => { setoncomment(null) }}><img src="/close.png" alt="" className='invert h-5 w-5 ' /></button>
                                    </div>
                                    <div className='p-10 flex justify-between'>
                                        <input value={comment[d._id] || ""} onChange={(e) => {
                                            setcomment({
                                                ...comment,
                                                [d._id]: e.target.value
                                            }
                                            )
                                        }} className=' p-4 w-3/4 border-white border-2 rounded-2xl' type="text" name="comment" id="" placeholder='Enter the comment ' />
                                        <button onClick={() => { handlecomments(d._id, d.username, comment[d._id]), d.pic }} className="rounded-md relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-heading rounded-base group bg-linear-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800">
                                            <span className=" relative px-4 py-2.5 transition-all ease-in duration-75 bg-neutral-primary-soft rounded-base group-hover:bg-transparent group-hover:dark:bg-transparent leading-5">
                                                Comment
                                            </span>
                                        </button>

                                    </div> */}


                                   

                                    {/* {rootcomments.map(comment => (
                                        <Nestedcomments

                                            key={comment._id}
                                            postid={d._id}
                                            comments={comment}
                                            allcomments={commentdata}
                                            setallcomments={setcommentdata}
                                        />
                                    ))}


                                </div>
                            </div> */}
                            <Link href={`/create?id=${d._id}`}> <div className="edit flex gap-2 items-center">
                                <img src="/edit.png" className='h-10 w-10' alt="" />
                                <span>Edit</span>
                            </div></Link>
                            <div onClick={() => { handledelete(d._id) }} className="delete flex gap-2 items-center">
                                <img src="/delete.png" className='h-10 w-10' alt="" />
                                <span>Delete</span>
                            </div>
                        </div>
                    </div>
                )
            })}


        </div>
    )
}

export default page
