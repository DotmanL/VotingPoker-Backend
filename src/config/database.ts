import mongoose from 'mongoose'
import 'dotenv/config'

export const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.mongoURI}`, {})
    console.log('connected to db')
  } catch (err) {
    console.log(err, 'mongo fail')
  }
}
