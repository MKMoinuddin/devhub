import mongoose from "mongoose";
import { unpatchedSetImmediate } from "next/dist/server/node-environment-extensions/fast-set-immediate.external";
const{Schema,model}=mongoose
const CommentSchema=new mongoose.Schema({
     postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    parentCommentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },
    pic:String,
    username: String,
    text: String,
    pic:String,
    clikes:{
        type:Number,
        default:0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})
export default mongoose.models.comments||model("comments",CommentSchema)