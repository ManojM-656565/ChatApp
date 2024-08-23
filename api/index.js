const express =require('express')
const mongoose =require('mongoose')
const dotenv=require('dotenv');
const cookieParser=require('cookie-parser')
const UserModel=require('./models/User')
const jwt =require('jsonwebtoken')
const cors =require('cors');


dotenv.config();

const app=express();
app.use(express.json());

app.use(cookieParser());

app.use(cors({
    credentials:true,
    origin:'http://localhost:3000',
}))
mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("Connected to database");
})
.catch((error)=>{
    console.log(error)
})


app.get('/test',(req,res) =>{
    res.json('test ok')
});

app.get('/profile',(req,res)=>{
    const token=req.cookies?.token;
    if(token){
    jwt.verify(token,process.env.JWT_SECRET,{},(err,userData)=>{
            if(err) throw err;
            res.json(userData);
        })
    }
    else{
        res.status(401).json('no token');
    }
})
 
app.post('/register',async (req,res)=>{
    try{
         
        const {username,password}=req.body;
        const createUser=await UserModel.create({username,password})
        const token=jwt.sign({userId:createUser._id},process.env.JWT_SECRET);
        res.cookie('token',token,{sameSite:'none',secure:true}).status(201).json(
        {
            id:createUser._id,
            username 

        }    
        );
         
    }
    catch(err){
       if(err) throw err;
    }
});

app.listen(process.env.PORT,()=>{
    console.log("Server is running on the port: ",process.env.PORT)
});