"use client"
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import Nestedcomments from "@/components/Nestedcomments";
import { useRouter } from "next/navigation";
import { randomposts, addcomments, addlikes, deletepost, fetchpost, sortpost, getallcomments, checkfollow, updatebookmark, followinglist, sharepost } from "@/actions/useractions";
export default function Home() {
    const { data: session, status } = useSession()
    const [postdata, setpostdata] = useState([])
    const [data, setdata] = useState([])
    const [filter, setfilter] = useState([])
    const [oncomment, setoncomment] = useState(null)
    const [comment, setcomment] = useState({})
    const [follow, setfollow] = useState({})
    const [open, setopen] = useState(false)
    const [search, setsearch] = useState("")
    const [commentdata, setcommentdata] = useState([])
    const [commentlayer, setcommentlayer] = useState(false)
    const [likedpost, setlikedpost] = useState({})
    const [isbookmark, setisbookmark] = useState({})
    const [ishare, setishare] = useState({})
    const [flist, setflist] = useState({})
    const [sharedusers, setsharedusers] = useState({})
    const router = useRouter()
    const rootcomments = commentdata.filter(
        c => c.parentCommentId === null
    );
    const username = session?.user?.name

    useEffect(() => {
        if (status == "unauthenticated") {
            router.push("/login")
        }
        
        getdata()
    }, [session, router])
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

        let c = await randomposts(username)
        setdata(c)
        setfilter(c)
        
        const bookmarkstate = {}
        c.forEach(e => {
            bookmarkstate[e._id] = e.isbookmark
        });
        setisbookmark(bookmarkstate)



    }
    const moreposts = async () => {
        let c = await randomposts(username)
        setdata(prev => {
            const merged = [...prev]
            c.forEach(e => {
                if (!merged.some(x => x._id === e._id)) {
                    merged.push(e)
                }
            });
            return merged
        })
        setfilter(prev => {
            const merged = [...prev]
            c.forEach(e => {
                if (!merged.some(x => x._id === e._id)) {
                    merged.push(e)
                }
            });
            return merged
        })
        const bookmarkstate = {}
        c.forEach(e => {
            bookmarkstate[e._id] = e.isbookmark
        });
        setisbookmark(bookmarkstate)
        const likedstate={}
         c.forEach(e => {
            likedstate[e._id] = e.isliked
        });
        setlikedpost(likedstate)

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
           
        }
        else {
            setfilter(data.filter(post => post.title.toLowerCase().includes(value.toLowerCase())))
           
        }
    }
    const handlecomments = async (id, username, text, pic) => {
        let a = await addcomments(username, id, text, session?.user.image, null)
        let c = await getallcomments(id)
        setcommentdata(c)


    }
    const getcomments = async (id) => {


        setoncomment(id)

        let c = await getallcomments(id)
        setcommentdata(c)

    }
    const handlebookmark = async (id) => {
        if (isbookmark?.[id]) {
            await updatebookmark(id, isbookmark?.[id], session?.user?.name)
            setisbookmark(prev => ({
                ...prev,
                [id]: !prev[id]
            }))
            let c = await randomposts(username)
            setdata(c)
            setfilter(c)

        }
        else {
            await updatebookmark(id, isbookmark?.[id], session?.user?.name)
            setisbookmark(prev => ({
                ...prev,
                [id]: !prev[id]
            }))
            let c = await randomposts(username)
            setdata(c)
            setfilter(c)

        }

    }
    const handleshare = async (id, postusername,flag) => {
        setishare(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
        const list = await followinglist(username, postusername)
       
        setflist(prev => ({
            ...prev,
            [id]: list
        }))
        if(!flag){
            setsharedusers(prev => {
          
            const updated={}
            for(const postid in prev){
                updated[postid]={...prev[postid]}
                for(const user in updated[postid]){
                    updated[postid][user]=false
                }
            }
            return updated
        }
        )
        }


    }
    const sendpost = async () => {
        const selected = []
  
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
            const updated={}
            for(const postid in prev){
                updated[postid]={...prev[postid]}
                for(const user in updated[postid]){
                    updated[postid][user]=false
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
            <div className="flex flex-col items-center gap-3 justify-center my-5">
                <h1 className=" font-bold text-3xl ">DevHub-Blogging Platform</h1>
                <p className="">you can create the posts you like see the posts follow the people you like</p>
                <Link href={`/${session?.user?.name}`}>
                    <button type="button" className="text-white bg-linear-to-br from-green-400 to-blue-600 hover:bg-linear-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-base text-sm px-4 py-2.5 text-center leading-5 rounded-md">Your Profile</button></Link>
            </div>
            <div className="w-full  border border-black"></div>
            <div className='mt-5 flex px-20 justify-between items-center gap-10'>
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

                <input type="text" name="search" id="" value={search} onChange={handlesearch} placeholder=' Search The Post You Like' className=' rounded-md bg-linear-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 h-14  flex-1 placeholder:text-center pl-4' />
                <Link href={"/search"}>
                <button  type="button" className="bg-linear-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 rounded-md p-3">
                    <img src="/search.png" className="w-8 h-8" alt="" />
                </button>
                </Link>
            </div>
            <h1 className="text-center font-bold text-2xl my-5">Latest Posts</h1>

            {filter.map((d, i) => {
                return (
                    <div key={i} className='flex flex-col my-5 mx-10 border-black border-2 rounded-2xl p-5 gap-5 '>
                        {!d.done && <div className='flex items-center gap-5 border-2 w-1/3 p-5 border-black'> <div className='p-2 h-4 w-4 bg-red-500 rounded-full'></div> <p className='text-2xl font-bold'> Drafted Post</p></div>}
                        <div className='flex justify-between'>

                            <div className="flex gap-3 items-center">
                                <Link href={`/${d.username}?profilepic=${d.profilepic}`}> <div className="flex gap-3 items-center">
                                    <img src={d.profilepic} className='w-10 h-10 rounded-full' alt="" />

                                    <div className='text-xl font-bold'>{d.username}</div>
                                </div></Link>
                                <div>{d.createdAt.slice(0, 16)}</div>
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
                                <div onClick={() => { handleshare(d._id, d.username,true) }} className="edit flex gap-2 items-center">
                                    <img src="/share.png" className='h-10 w-10' alt="" />
                                    <span>Share</span>
                                </div>

                            </div>
                            <div onClick={() => { handlebookmark(d._id) }} className="delete flex gap-2 items-center">
                                <img src={`${isbookmark?.[d._id] ? "/bookmarked.png" : "/bookmark.png"}`} className='h-10 w-10' alt="" />
                                <span>Bookmark</span>
                            </div>

                        </div>
                        <div className={`sharemenu border overflow-y-auto bg-white h-96 w-96 border-black rounded-md ${ishare[d._id] ? "visible absolute left-1/3 " : "hidden"}`}>
                            <div className="h-8 bg-black flex justify-between items-center px-5">
                                <p className="text-white font-bold">whom you want to share</p>
                                <button onClick={() => { handleshare(d._id, d.username,false) }}  >
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
                )
            })}
            <div className="flex items-center justify-center">
                <button onClick={moreposts} className="text-white bg-linear-to-br from-green-400 to-blue-600 hover:bg-linear-to-bl focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800 font-medium rounded-base text-sm px-4 py-2.5 text-center leading-5 rounded-md">Click for more posts</button>
            </div>

        </div>
    )
}
