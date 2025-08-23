import mongoose from 'mongoose';
const { MONGO_URI } = process.env;

const conn = async () => mongoose.connect(MONGO_URI as string).catch(err => console.log(err));
export default conn;
