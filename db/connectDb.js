import mongoose from 'mongoose'
import React from 'react'

const connectDb = async() => {
    try{
      const conn=await mongoose.connect("mongodb://localhost:27017/posts")
      return conn;
    }catch(error){

    console.error(error.message)
    process.exit(1)

    }
}

export default connectDb
