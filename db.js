const mongoose=require('mongoose');

const connectDB=async()=>{
    await mongoose.connect(process.env.DB_URI,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
        console.log(`Mongodb connected with server`);
    })
}

module.exports=connectDB; 