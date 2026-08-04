"use client"
import React from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getapost } from '@/actions/useractions'
import Nestedcomments from '@/components/Nestedcomments'
import { randomposts, addcomments, addlikes, deletepost, fetchpost, sortpost, getallcomments, checkfollow, updatebookmark, followinglist, sharepost } from "@/actions/useractions";
const page = () => {
    const searchparams = useSearchParams()
    const pid = searchparams.get("postId")
    const postid = decodeURIComponent(pid)
    const { data: session, status } = useSession()
    const [oncomment, setoncomment] = useState(null)
    const [comment, setcomment] = useState({})
    const [follow, setfollow] = useState({})
    const [open, setopen] = useState(false)
    const [search, setsearch] = useState("")
    const [commentdata, setcommentdata] = useState([])
    const [commentlayer, setcommentlayer] = useState(false)
    const [likedpost, setlikedpost] = useState({})
    const [isbookmark, setisbookmark] = useState(true)
    const [ishare, setishare] = useState({})
    const [flist, setflist] = useState({})
    const [sharedusers, setsharedusers] = useState({})
    const rootcomments = commentdata.filter(
        c => c.parentCommentId === null
    );
    const [d, setd] = useState([])
    const username = session?.user?.name
    useEffect(() => {
        getdata()
        console.log("session is", session)

    }, [session, status, postid])
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
    const getdata = async () => {
        const data = await getapost(postid, username)
        setd(data)
        console.log(data)

        setisbookmark(data.isbookmark)

    }

    const handlelikes = async (id) => {

        const like = likedpost[id]
        if (!like) {
            let l = await addlikes(id, like)

            if (d._id === id)
                d.likes += 1


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
            if (d._id === id)
                d.likes -= 1

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


    const handlecomments = async (id, username, text, pic) => {
        let a = await addcomments(username, id, text, session?.data?.user?.image, null)
        let c = await getallcomments(id)
        setcommentdata(c)


    }
    const getcomments = async (id) => {


        setoncomment(id)

        let c = await getallcomments(id)
        setcommentdata(c)

    }
    const handlebookmark = async (id) => {
        if (isbookmark) {
            console.log(isbookmark)

            await updatebookmark(id, isbookmark, session?.user?.name)
            setisbookmark(!isbookmark)

        }
        else {
            console.log(isbookmark)
            await updatebookmark(id, isbookmark, username)
            setisbookmark(!isbookmark)


        }

    }
    const handleshare = async (id, postusername, flag) => {
        setishare(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
        const list = await followinglist(username, postusername)
        console.log(list)
        setflist(prev => ({
            ...prev,
            [id]: list
        }))
        if (!flag) {
            setsharedusers(prev => {

                const updated = {}
                for (const postid in prev) {
                    updated[postid] = { ...prev[postid] }
                    for (const user in updated[postid]) {
                        updated[postid][user] = false
                    }
                }
                return updated
            }
            )
        }


    }
    const sendpost = async () => {
        const selected = []
        console.log("selected is ", selected)
        Object.entries(sharedusers).forEach(([postid, users]) => {
            Object.entries(users).forEach(([user, value]) => {
                if (value == true) {
                    selected.push({ postid: postid, username: user })
                }
            });
        });
        await sharepost(selected)
        setsharedusers(prev => {
            // const updated = structuredClone(prev)
            // for (const postid in updated) {
            //     for (const user in sharedusers[postid]) {
            //         sharedusers[postid][user] = false;
            //     }
            // }
            const updated = {}
            for (const postid in prev) {
                updated[postid] = { ...prev[postid] }
                for (const user in updated[postid]) {
                    updated[postid][user] = false
                }
            }
            return updated
        }
        )

    }
    const toggleuser = async (id, username) => {
        setsharedusers(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [username]: !prev[id]?.[username]
            }
        }))
    }
    return (
        <div>
            {
                <>

                    <div className='flex flex-col my-5 mx-10 border-black border-2 rounded-2xl p-5 gap-5 '>
                        {!d.done && <div className='flex items-center gap-5 border-2 w-1/3 p-5 border-black'> <div className='p-2 h-4 w-4 bg-red-500 rounded-full'></div> <p className='text-2xl font-bold'> Drafted Post</p></div>}
                        <div className='flex justify-between'>

                            <div className="flex gap-3 items-center">
                                <Link href={`/${d.username}?profilepic=${d.profilepic}`}> <div className="flex gap-3 items-center">
                                    <img src={d.profilepic} className='w-10 h-10 rounded-full' alt="" />

                                    <div className='text-xl font-bold'>{d.username}</div>
                                </div></Link>
                                <div>{d.createdAt?.slice(0, 16)}</div>
                            </div>
                            <div className={` px-8 text-center mr-10 py-2 border border-black rounded-md ${d.isfollowing ? "bg-blue-600 text-white" : "border-black"} `}>{d.isfollowing ? "following" : "not following"}</div>

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
                            <button onClick={() => { handlelikes(d._id) }} className='hover:cursor-pointer hover:scale-3d hover:scale-110 hover:shadow-xl hover:shadow-red-400 transition'><div className="like flex gap-2 items-center">
                                {likedpost[d._id] && <img src="/heart.png" className='h-10 w-10' alt="" />}
                                {!likedpost[d._id] && <img src="/like.png" className='h-10 w-10' alt="" />}
                                <span>{d.likes}</span>
                            </div></button>
                            <div>
                                <button onClick={() => { getcomments(d._id) }} className='hover:cursor-pointer hover:scale-3d hover:scale-110 hover:shadow-xl hover:shadow-blue-600 transition'><div className=" flex gap-2 items-center">
                                    <img src="/comment.png" className='h-10 w-10' alt="" />

                                   
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

                                    </div>




                                    {rootcomments.map(comment => (
                                        <Nestedcomments

                                            key={comment._id}
                                            postid={d._id}
                                            comments={comment}
                                            allcomments={commentdata}
                                            setallcomments={setcommentdata}
                                        />
                                    ))}


                                </div>
                            </div>
                            <div>
                                <div onClick={() => { handleshare(d._id, d.username, true) }} className="edit flex gap-2 items-center">
                                    <img src="/share.png" className='h-10 w-10' alt="" />
                                    <span>Share</span>
                                </div>

                            </div>
                            <div onClick={() => { handlebookmark(d._id) }} className="delete flex gap-2 items-center">
                                <img src={`${isbookmark ? "/bookmarked.png" : "/bookmark.png"}`} className='h-10 w-10' alt="" />
                                <span>Bookmark</span>
                            </div>

                        </div>
                        <div className={`sharemenu border overflow-y-auto bg-white h-96 w-96 border-black rounded-md ${ishare[d._id] ? "visible absolute left-1/3 " : "hidden"}`}>
                            <div className="h-8 bg-black flex justify-between items-center px-5">
                                <p className="text-white font-bold">whom you want to share</p>
                                <button onClick={() => { handleshare(d._id, d.username, false) }}  >
                                    <img src="/close.png" alt="" className="w-4 h-4 invert"  ></img>
                                </button>
                            </div>
                            <h1 className="font-bold text-xl p-4">Send</h1>
                            {flist[d._id]?.map((user) => {
                                const selected =
                                    sharedusers[d._id]?.[user.username] || false;
                                return (
                                    <div className="p-4 border border-black flex justify-between items-center">
                                        <div className="flex gap-2 items-center">

                                            <img src={user.pic} className="h-10 w-10 rounded-full" alt="" />

                                            <h1 key={user}>{user.username}</h1>
                                        </div>
                                        <div onClick={() => { toggleuser(d._id, user.username) }} className="w-7 h-7 rounded-full border border-black">
                                            <div  >
                                                {selected && (<img src="/check.png" alt="" />)}

                                            </div>
                                        </div>


                                    </div>
                                )
                            })
                            }
                            <div className="my-5 flex justify-center">
                                <button onClick={sendpost} className="text-white bg-linear-to-br from-green-400 to-blue-600 hover:bg-linear-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-base text-sm px-8 py-2.5 text-center leading-5 rounded-md">Send</button>
                            </div>
                        </div>
                    </div>


                </>

            }

        </div>
    )
}

export default page
