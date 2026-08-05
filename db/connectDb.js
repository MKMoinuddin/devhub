import mongoose from 'mongoose'
import React from 'react'

const connectDb = async() => {
    try{
      console.log(process.env.MONGODB_URI)
      const conn=await mongoose.connect(process.env.MONGODB_URI)
      return conn;
    }catch(error){

    console.error(error.message)
     throw error;

    }
}

export default connectDb
