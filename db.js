const mongoose=require('mongoose');

const connectDB=async()=>{
    await mongoose.connect(process.env.DB_URI).then(()=>{
        console.log(`Mongodb connected with server`);
    })
}

module.exports=connectDB; 