import React from 'react'
import { useState } from 'react'
import { addcomments,getallcomments ,likecomments } from '@/actions/useractions'
import { useSession } from 'next-auth/react'
 
const Nestedcomments = ({ postid,comments, allcomments,setallcomments }) => {
    const [showreplies, setshowreplies] = useState(false)
    const replies = allcomments.filter((c) => c.parentCommentId === comments._id)
    const [comment, setcomment] = useState("")
    const { data: session, status } = useSession()
    const [likecomment, setlikecomment] = useState({})
   const username=session?.user?.name
   const pic=session?.user?.image
    
    const addcomment=async (id) => {
        
      await addcomments(username,postid,comment,pic,id)
      let c=await getallcomments(postid)
      setallcomments(c)
      setcomment("")

    }
    const handlelikes=async(id) => {
      const like=likecomment[id]
       await likecomments(id,like)
       setlikecomment(
        prev=>({
            ...prev,
            [id]:!like
        })
       )
        let c=await getallcomments(postid)
      setallcomments(c)
    }
    
    
    return (
        <div className='mt-4'>
            <div className="bg-zinc-900 p-3 rounded">
                <div className="flex gap-2 items-center">
                    <img src={comments.pic } className='rounded-full w-7 h-7' alt="" />
                <h2 className='font-bold text-md'>{comments.username}</h2>
                </div>

                <p className='my-4 text-xl '>{comments.text}</p>

                <div className="flex gap-4 mt-2 justify-around">

                    <div onClick={()=>{handlelikes(comments._id)}} className='flex gap-2  items-center'>
                       {likecomment[comments._id]&& <img src="./heart.png" className='w-5 h-5 ' alt="" />}
                         {!likecomment[comments._id]&& <img src="./like.png" className='w-5 h-5 invert ' alt="" />}
                         {comments.clikes}
                         </div>
                    

                    <div  className='flex gap-2   items-center'
                        onClick={() => setshowreplies(!showreplies)}
                    >
                        <img src="./comment.png" className='w-5 h-5 invert' alt="" />
                         {replies.length}
                    </div>
                     <div className='flex gap-2  items-center'>
                        <img src="./share.png" className='w-5 h-5 invert' alt="" />
                         
                         </div> 
                         <div className='flex gap-2  items-center'>
                        <img src="./bookmark.png" className='w-5 h-5 invert' alt="" />
                          
                         </div>

                </div>

                {showreplies &&(
                    <div className='bg-zinc-700 my-4 rounded-md '>
                    <div className="search flex justify-between  p-7 ">
                        { <input type="text" className='border-white border p-2 w-3/4 rounded-md' value={comment} onChange={(e)=>
                            setcomment( e.target.value
 
                            )
                        }/> }

                           <button onClick={()=>{addcomment(comments._id)}}  className="rounded-md relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-heading rounded-base group bg-linear-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800">
                                            <span className=" relative px-4 py-2.5 transition-all ease-in duration-75 bg-neutral-primary-soft rounded-base group-hover:bg-transparent group-hover:dark:bg-transparent leading-5">
                                                Comment
                                            </span>
                                        </button>
                    </div>
                    <div className="ml-8 border-l-4 pl-4">
                        {replies.map((reply)=>(
                            <Nestedcomments postid={postid} key={reply._id} comments={reply} allcomments={allcomments} setallcomments={setallcomments}></Nestedcomments>
                        ))}
                    </div>
                    </div>
                )}

            </div>
        </div>
    )
}

export default Nestedcomments
