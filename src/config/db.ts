import mongoose from 'mongoose';
import { ENV } from './env/env';

const connectDB = async ():Promise<void> => {
  try {
    const mongoURl:string = ENV.MONGO_URI;
    if (!mongoURl) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }
    await mongoose.connect(mongoURl);
    console.log('Mongo db is connected Successfuly');
  } catch (error) {
    console.error('mongo db Error', error);
  }
};
export { connectDB };
