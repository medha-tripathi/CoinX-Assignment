const mongoose=require('mongoose');

const connectDB=()=>{
    mongoose.connect(process.env.DB_URI,{useNewUrlParser:true,useUnifiedTopology:true}).then(()=>{
        console.log(`Mongodb connected with server`);
    })
}

module.exports=connectDB; 