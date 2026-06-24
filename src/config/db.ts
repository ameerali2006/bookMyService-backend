import { MESSAGES } from './constants/message';
import mongoose from 'mongoose';
import { ENV } from './env/env';

const connectDB = async ():Promise<void> => {
  try {
    const mongoURl:string = ENV.MONGO_URI;
    if (!mongoURl) {
      throw new Error(MESSAGES.MONGOURI_IS_NOT_DEFINED_IN_ENVIRONMENT_V);
    }
    await mongoose.connect(mongoURl);
    console.log('Mongo db is connected Successfuly');
  } catch (error) {
    console.error('mongo db Error', error);
  }
};
export { connectDB };
