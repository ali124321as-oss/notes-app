console.log(" index js running ");
  const mongoose= require("mongoose")
const express=require("express")
const app=express()
const port=9005
const userRoute=require("./Routes/UserRoutes")
const NotesRoute=require("./Routes/NotesRoute")
const cookieParser = require("cookie-parser");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');



const{CheckAuthenticationForJWtToken}=require("./AuthMiddleware")
 mongoose.connect("mongodb://127.0.0.1:27017/note-app").then(()=>{
        console.log("mongodb connected successFully");
        
 }).catch((err)=>{
       console.log(err);
       
 })

//testing change commits
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
 app.use(express.urlencoded({extended:false}))
 app.use(express.json())
 app.use(cookieParser())

 app.use("/api",userRoute)
 app.use("/api",CheckAuthenticationForJWtToken("userToken"),NotesRoute)
      


app.listen(port,()=>{
       console.log(`server started at port ${port}`);
       
})
   
