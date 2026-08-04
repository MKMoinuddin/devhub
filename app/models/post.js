import mongoose from "mongoose";
import { unpatchedSetImmediate } from "next/dist/server/node-environment-extensions/fast-set-immediate.external";
const{Schema,model}=mongoose
const PostSchema=new mongoose.Schema({
    username:{type:String,required:true},
    profilepic:{type:String ,required:true},
     title:{type:String,required:true},
      bio:[{type:String}],
      pic:[{type:String}],
      likes:{type:Number,default:0},
       shares:{type:Number,default:0},
        bookmarks:{type:Number,default:0},
         
      likedby:[{
        username:String
}],
 sharedby:[{
        username:String
}],
 bookmarkedby:[{
        username:String
}],
   
       createdAt:{type:Date,default:Date.now},
        updatedAt:{type:Date,default:Date.now},
        done:{type:Boolean,default:false}
})
export default mongoose.models.post||model("post",PostSchema)