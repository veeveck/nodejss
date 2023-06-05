import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

//Db connection
mongoose.connect("mongodb://127.0.0.1:27017",{
    dbName:"backend"
}).then(()=>console.log("Database connected"))
  .catch((e)=>console.log(e));

//Schema
const userSchema= new mongoose.Schema({
    name:String,
    email:String,
    password:String
});
const User=mongoose.model("User",userSchema);

const app=express();

//Uisng middleware
app.use(express.static(path.join(path.join(path.resolve(),"public"))));
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

//Setting up view engine
app.set("view engine","ejs");

const isAuthenticated =async (req,res,next)=>{
    const {token} =req.cookies;
    if(token){
        const decoded=jwt.verify(token,"xyz");
        req.user=await User.findById(decoded._id);
        console.log(decoded);
        next();
      }
    else{
        res.redirect("/login");
    }
}

//Routes
app.get("/vivi",(req,res)=>{
   res.render("index",{name:"Vivi"});
  // res.sendFile("index.html");
})
app.get("/success",(req,res)=>{
    res.render("success");
})
app.get("/add",async(req,res)=>{
  //  res.send("Nice");
await  Message.create({name:"Vivi1",email:"sample1@gmail.com"})
res.send("Nice");
})
app.post("/contact",async (req,res)=>{
    console.log(req.body);
    const messageData = {name:req.body.name,email:req.body.email};
    await Message.create(messageData);
    res.redirect("/success");
})
app.get("/",isAuthenticated,(req,res)=>{
    console.log(req.user);
    res.render("logout",{name:req.user.name});
})
app.get("/register",(req,res)=>{
    res.render("register");
})
app.get("/login",(req,res)=>{
    res.render("login");
})
app.post("/login",async (req,res)=>{
   const {email,password}=req.body; 
   let user= await User.findOne({email});
   if(!user){
    return res.redirect('/register');
   }
   const isMatch= await bcrypt.compare(password,user.password);
   if(!isMatch){
    return res.render("login",{email,message :"Incorrect Password"});
   }
   const token =jwt.sign({_id:user._id},"xyz");
    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now() + 60*1000),
    });
    res.redirect("/");

})
app.post("/register",async (req,res)=>{
 const {name,email,password}=req.body; 
 let user=await User.findOne({email});   
 if(user){
    return res.redirect("/login");
 }
 const hashedPassword=await bcrypt.hash(password,10);
  user=await User.create({name:req.body.name,email:req.body.email,password:hashedPassword});

 const token =jwt.sign({_id:user._id},"xyz");
    res.cookie("token",token,{
        httpOnly:true,
        expires:new Date(Date.now() + 60*1000),
    });
    res.redirect("/");
});
app.get("/logout",(req,res)=>{
    res.cookie("token",null,{
        httpOnly:true,
        expires: new Date(Date.now())
    });
    res.redirect("/");
});

app.listen(5001,()=>{
    console.log("Server is working");
})

