"use client"
import React from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { addlikes,fetchpost, followuser, unfollowuser, userdetails, updatebookmark, retrieveshares, deletesharedpost, } from '@/actions/useractions'
const page = () => {
  const { data: session } = useSession()
  const [isfollowing, setisfollowing] = useState(false)
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
  const [sharecount, setsharecount] = useState(0)
  const [shareview, setshareview] = useState(false)
  const [shared, setshared] = useState([])
  const rootcomments = commentdata.filter(
    c => c.parentCommentId === null
  );
  const params = useParams();
  const searchParams = useSearchParams();

  const name = params?.username || ""

  const username = decodeURIComponent(name)
  const profilepic = searchParams.get("profilepic")

  const [userdata, setuserdata] = useState({})
  useEffect(() => {
    console.log(username, profilepic)
    getuser(username)
  }, [username, session])
  const getuser = async (username) => {

    let c = await userdetails(username)
    setuserdata(c)

    setisfollowing(c?.followers?.some(f => f.username === session?.user?.name))




  }
  const handlefollow = async () => {
    if (isfollowing) {
      await unfollowuser(session?.user?.name, session?.user?.image, username, profilepic)
      let c = await userdetails(username)
      setuserdata(c)
      setisfollowing(!isfollowing)
    }
    else {
      await followuser(session?.user?.name, session?.user?.image, username, profilepic)
      setisfollowing(!isfollowing)
      let c = await userdetails(username)
      setuserdata(c)
    }

  }
  useEffect(() => {
    getdata()
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
  const getdata = async () => {

    let c = await fetchpost(username)
    setdata(c)
    setfilter(c)
    let userd = await userdetails(session?.user?.name)
    let bookmarklist = userd.bookmarkedposts.map(f => f.postId.toString())
    const bookmarkstate = {}
    c.forEach(e => {
      if (bookmarklist.includes(e._id.toString())) {
        bookmarkstate[e._id] = true
      }
    });
    setisbookmark(bookmarkstate)
     let likedlist = userd.likedposts.map(f => f.postId.toString())
    const likedstate = {}
 c.forEach(e => {
      if (likedlist.includes(e._id.toString())) {
        likedstate[e._id] = true
      }
    });
    setlikedpost(likedstate)
    // const bookmarkstate = {}
    // c.forEach(e => {
    //   bookmarkstate[e._id] = e.isbookmark
    // });
    // setisbookmark(bookmarkstate)
    const list = await retrieveshares(username)
    console.log(list)
    setshared(list)
    setsharecount(sharecount + list?.length)


  }
  const handlelikes = async (id) => {

    const like = likedpost[id]
    if (!like) {
      let l = await addlikes(id, like,session?.user?.name)
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
      let l = await addlikes(id, like,session?.user?.name)
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
      let c = await fetchpost(username)
      setdata(c)
      setfilter(c)

    }
    else {
      await updatebookmark(id, isbookmark?.[id], session?.user?.name)
      setisbookmark(prev => ({
        ...prev,
        [id]: !prev[id]
      }))
      let c = await fetchpost(username)
      setdata(c)
      setfilter(c)

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
  const showshares = async () => {
    setshareview(!shareview)
  }
  const deleteshare = async (id) => {
    await deletesharedpost(username, id)
    setshared(prev => prev.filter(post => post._id !== id))
    setsharecount(prev => prev - 1)
  }



  return (
    <>
      {session?.user?.name === username && sharecount > 0 && (<div className='absolute right-18 top-29 bg-red-700 text-white  rounded-full h-5 w-5 p-2 flex justify-center items-center'>{sharecount}</div>)}
      {session?.user?.name === username && (<div onClick={showshares} className=' absolute right-20 top-32 border border-black rounded-full p-2 '>
        <img src="/share.png " className='w-7 h-7' alt="" />
      </div>)}
      <div className={`${shareview ? "visible" : "hidden"} absolute right-32 top-42 border-2 bg-white border-black w-1/4 h-1/2`}>
        <div className='font-bold text-xl p-4  '> Posts Shared for You </div>
        <div className='overflow-y-auto h-4/6 scrollbar-auto'>
          {shared?.map((s, i) => {
            return (
              <div key={i} className='border border-black' onClick={() => { deleteshare(s._id) }} >
                <Link href={`/post?postId=${s._id}`}>
                  <div className='flex gap-3 items-center p-4'>
                    <img src={s.profilepic} className='w-5 h-5 rounded-full' alt="" />
                    <div className='font-bold text-md'>{s.username}</div>

                  </div>
                  <div className='text-lg px-4'>{s.title}</div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
      <div className="profile flex flex-col justify-center items-center my-5 gap-2">
        <h1 className='text-3xl font-bold'>Profile</h1>


        <img src={userdata.profilepic} alt="" />
        <h2>Name  :     {username}</h2>
        <h2>Email  :     {userdata.email}</h2>


        {session?.user?.name === username && (<Link href={"/blogs"}><button className="rounded-md relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-heading rounded-base group bg-linear-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800">
          <span className=" relative px-4 py-2.5 transition-all ease-in duration-75 bg-neutral-primary-soft rounded-base group-hover:bg-transparent group-hover:dark:bg-transparent leading-5">
            Blogs
          </span>
        </button></Link>)}
      </div>
      <div>
        {session?.user?.name !== username && (<div className='flex justify-center my-3'>
          <div onClick={handlefollow} className={`follow px-4 py-2 border border-black rounded-md ${isfollowing ? "bg-blue-600 text-white" : "border-black"} `}>{isfollowing ? "following" : "want to follow"}</div>
        </div>)}
        <div className='grid grid-cols-3 gap-5 my-5 items-center justify-center mx-auto w-fit'>
          <h1 className='font-bold text-xl'>Followers:{userdata?.followers?.length}</h1>
          <h1 className='font-bold text-xl'>Following:{userdata?.following?.length}</h1>
          <h1 className='font-bold text-xl'>total Posts Posted:{userdata?.posts}</h1>
          {!isfollowing && (<><h1 className='font-bold text-xl'>Total Shared:{userdata?.shares}</h1><h1 className='font-bold text-xl'>Total Liked:{userdata?.likes}</h1><h1 className='font-bold text-xl'> Bookmarks:{userdata?.bookmarks} </h1></>)}
        </div>

      </div>

      {session?.user?.name !== username && (<><h1 className='font-bold text-3xl text-center'>Posts </h1>
        {filter.map((d, i) => {
          return (
            <div key={i} className='flex flex-col my-5 mx-10 border-black border-2 rounded-2xl p-5 gap-5 '>
              {!d.done && <div className='flex items-center gap-5 border-2 w-1/3 p-5 border-black'> <div className='p-2 h-4 w-4 bg-red-500 rounded-full'></div> <p className='text-2xl font-bold'> Drafted Post</p></div>}
              <div className='flex justify-between'>

                <div className="flex gap-3 items-center">
                  <Link href={`/${d.username}`}> <div className="flex gap-3 items-center">
                    <img src={d.profilepic ? d.profilepic : "/profile.png"} className='w-10 h-10 rounded-full' alt="" />

                    <div className='text-xl font-bold'>{d.username}</div>
                  </div></Link>
                  <div>{d.createdAt.slice(0, 16)}</div>
                </div>

              </div>
              <div className="title text-2xl ">{d.title}</div>
              <div className='flex flex-col gap-2'>
                {d.bio.map((b, index) => {
                  return (

                    <p key={index}>{b}</p>

                  )
                })}
              </div>
              {/* if({d.pic}){ */}
              <div className=' grid grid-cols-2 gap-2'>
                {d.pic.map((p, index) => {
                  return (
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
                <div className="edit flex gap-2 items-center">
                  <img src="/share.png" className='h-10 w-10' alt="" />
                  <span>Share</span>
                </div>
                <div onClick={() => { handlebookmark(d._id) }} className="delete flex gap-2 items-center">
                  <img src={`${isbookmark?.[d._id] ? "/bookmarked.png" : "/bookmark.png"}`} className='h-10 w-10' alt="" />
                  <span>Bookmark</span>
                </div>
              </div>
            </div>
          );
        })}
      </>
      )}

    </>
  )
}

export default page
