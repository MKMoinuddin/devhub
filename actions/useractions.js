"use server"
import mongoose from "mongoose"
import post from "@/app/models/post"
import comments from "@/app/models/comments"
import connectDb from "@/db/connectDb"
import user from "@/app/models/user"
import { Fascinate_Inline } from "next/font/google"


export const add = async (username, profilepic, title, bio, pic, done) => {

    await connectDb()
    
    let newpost = await post.create({ username, profilepic, title: title, bio: bio, pic: pic, likes: 0, done: done })
    if (done) {
        await user.findOneAndUpdate({ username: username }, { $inc: { posts: 1 } })
    }
    return { success: true }
}
export const fetchpost = async (username) => {

    await connectDb()
    let getpost = await post.find({ username: username }).lean()
    return JSON.parse(JSON.stringify(getpost))
}
export const randomposts = async (username) => {

    await connectDb()
    let rpost = await post.aggregate([
        {
            $match: {
                username: { $ne: username },
                done: true

            }
        },
        {

            $sample: {
                size: 10
            }
        }
    ])

    const currentUser = await user.findOne({
        username: username
    }).lean();

    const followinglist = currentUser?.following.map(f => f.username) || []
    const bookmarklist = currentUser?.bookmarkedposts.map(f => f.postId.toString()) || []
    const likedlist=currentUser?.likedposts.map(f=>f.postId.toString())||[]

    return rpost.map(c => ({
        ...c,
        _id: c._id.toString(),
        createdAt: c.createdAt.toISOString(),
        isfollowing: followinglist?.includes(c.username),
        isbookmark: bookmarklist?.includes(c._id.toString()),
        isliked:likedlist?.includes(c._id.toString())
    }))
}
export const addlikes = async (id, like,username) => {
    if (like){
        await post.findOneAndUpdate({ _id: id }, { $inc: { likes: -1 } })
        await user.findOneAndUpdate({username:username},{$pull:
            {likedposts:
                {postId:id}}})
    }
    else{
        await post.findOneAndUpdate({ _id: id }, { $inc: { likes: 1 } })
         await user.findOneAndUpdate({username:username},{$push:
            {likedposts:
                {postId:id}}})
    }


}
export const likecomments = async (id, like) => {
    await connectDb()
    if (like)
        await comments.findOneAndUpdate({ _id: id }, { $inc: { clikes: -1 } })
    else
        await comments.findOneAndUpdate({ _id: id }, { $inc: { clikes: 1 } })
}

export const getallcomments = async (id) => {
    await connectDb()
    let getcom = await comments.find({ postId: id }).lean()
    return getcom.map(c => ({
        ...c,
        _id: c._id.toString(),
        postId: c.postId.toString(),
        parentCommentId: c.parentCommentId
            ? c.parentCommentId.toString()
            : null,
        createdAt: c.createdAt?.toISOString()
    }))

}


export const addcomments = async (username, id, text, pic, pid) => {

    await connectDb()
    let newcom = await comments.create({
        postId: id,
        username: username,
        text: text,
        pic: pic,
        parentCommentId: pid
    })

    return { success: true }

}
export const findbyid = async (id) => {
    await connectDb()
    const cpost = await post.findById(id).lean()
    return JSON.parse(JSON.stringify(cpost))
}
export const deletepost = async (id) => {
    await connectDb()
    await post.findByIdAndDelete(id)

    return { success: true }
}

export const sortpost = async (data, username) => {
    let getpost
    await connectDb()
    if (data == "likes") {
        getpost = await post.find({ username: username }).sort({ likes: -1 }).lean()
    }
    else if (data == "alphabet") {
        getpost = await post.find({ username: username }).sort({ title: 1 }).lean()
    }
    else {
        getpost = await post.find({ username: username }).sort({ createdAt: 1 }).lean()
    }
    let afterpost = getpost.map(p => ({
        ...p,
        _id: p._id.toString(),
        comments: p.comments?.map(c => ({
            ...c,
            _id: c._id.toString(),
            createdAt: c.createdAt?.toISOString()
        }))
    }))
    return afterpost

}

export const checkfollow = async (followername, followingname) => {
    await connectDb()
    const user = await user.findOne({
        username: followername,
        "following.username": followingname

    })
    if (user)
        return true
    return false
}
export const userdetails = async (username) => {

    await connectDb()
    let usd = await user.findOne({
        username: username
    }).lean()
    // return {
    //     ...usd,
    //     _id:usd._id.toString(),
    //     followers:usd.followers?.map(f=>({
    //         ...f,
    //         _id:f._id.toString()
    //     })),
    //       following:usd.following?.map(f=>({
    //         ...f,
    //         _id:f._id.toString()
    //     })),
    //    bookmarkedposts:usd.bookmarkedposts?.map(f=>({
    //         ...f,
    //         _id:f._id.toString(),
    //         postId:f?.postId?.toString()
    //     }))


    // }
    return JSON.parse(JSON.stringify(usd))
}
export const followuser = async (wantstofollow, picwantstofollow, follow, picfollow) => {
    await connectDb()
    await user.findOneAndUpdate(
        { username: wantstofollow },
        {
            $push: {
                following: {
                    username: follow,
                    profilepic: picfollow
                }
            }
        }
    )
    await user.findOneAndUpdate(
        { username: follow },
        {
            $push: {
                followers: {
                    username: wantstofollow,
                    profilepic: picwantstofollow
                }
            }
        }
    )
}
export const unfollowuser = async (wantstofollow, picwantstofollow, follow, picfollow) => {
    await connectDb()
    await user.findOneAndUpdate(
        { username: wantstofollow },
        {
            $pull: {
                following: {
                    username: follow,
                    profilepic: picfollow
                }
            }
        }
    )
    await user.findOneAndUpdate(
        { username: follow },
        {
            $pull: {
                followers: {
                    username: wantstofollow,
                    profilepic: picwantstofollow
                }
            }
        }
    )
}
export const updatebookmark = async (id, isbookmark, username) => {
    
    if (isbookmark) {
        await user.findOneAndUpdate(
            { username: username },
            {
                $inc: { bookmarks: -1 },

                $pull: {
                    bookmarkedposts: {
                        postId: id
                    }

                }
            }
        )

    }
    else {
        await user.findOneAndUpdate(
            { username: username }, {
            $inc: { bookmarks: 1 },

            $push: {
                bookmarkedposts: {
                    postId: id
                }

            }
        }
        )
    }
}
export const adduser = async (form) => {

    await connectDb()
    const emailexists = await user.findOne({ email: form.email })
    if (emailexists) {
        return false
    }
    else {
        await user.create({ username: form.username, email: form.email, profilepic: form.profilepic })
        return true
    }
}
export const followinglist = async (username, postusername) => {
    await connectDb()

    const list = await user.findOne({ username: username })
    const flist = list.following

    const olist = []
    flist.forEach(e => {
        if (e.username != postusername) {
            olist.push({ username: e.username, pic: e.profilepic })
        }
    });
    
    return olist



}

export const sharepost = async (sharelist) => {
    await connectDb()
    await Promise.all(
        sharelist.map(async (item) => {
            await user.findOneAndUpdate({ username: item.username }, {
                $push: {
                    sharedposts: {
                        postId: item.postid
                    }
                }
            })
        }))
}
export const retrieveshares = async (username) => {
    await connectDb()
    const sharelist = await user.findOne({ username: username })
    const list = []
    await Promise.all(
        sharelist.sharedposts.map(async (item) => {
            const postdata = await post.findOne({ _id: item.postId }).lean()
            if (postdata) {
                list.push({
                    ...postdata,
                    _id: postdata._id.toString(),
                    createdAt: postdata.createdAt?.toISOString()
                })
            }
        })
    )
    return list

}
export const getapost = async (postid, username) => {
    await connectDb()
    const postdata = await post.findOne({ _id: postid }).lean()

    const userdetails = await user.findOne({ username: username })
   
    const isbookmark = userdetails.bookmarkedposts.some(f => f.postId?.toString() === postid?.toString())
  

    return {
        ...postdata,
        _id: postdata._id.toString(),
        createdAt: postdata.createdAt?.toISOString(),
        isbookmark: isbookmark

    }

}
export const deletesharedpost = async (username, postid) => {
    await connectDb()
    await user.findOneAndUpdate({ username: username }, {
        $pull: {
            sharedposts: {
                postId: postid
            }
        }
    })


}
export const searchuser = async (search) => {
    await connectDb()
    const details = await user.find({ username: { $regex: search, $options: "i" } }).lean()
    return JSON.parse(JSON.stringify(details))
}