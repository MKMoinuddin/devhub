import mongoose from "mongoose";
import { unpatchedSetImmediate } from "next/dist/server/node-environment-extensions/fast-set-immediate.external";
const{Schema,model}=mongoose
const UserSchema=new mongoose.Schema({
  username:String,
  email:String,
  profilepic:String,
  followers:[{
    username:String,
    profilepic:String
  }
  ],
  following:[{
    username:String,
    profilepic:String
  }
  ],
  posts:{type:Number,default:0},
  likes:{type:Number,default:0},
  shares:{type:Number,default:0},
  bookmarks:{type:Number,default:0},
  bookmarkedposts:[{
       postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true
        },
  }],
  sharedposts:[{
       postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true
        },
  }],
   likedposts:[{
       postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true
        },
  }],
   postsliked:[{
       postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            required: true
        },
  }]
  

})
export default mongoose.models.user||model("user",UserSchema)