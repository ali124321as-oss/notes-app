     const { Schema, model } = require("mongoose");


       const notesSchema=new Schema({
        noteid:{
              type:String,
                 required:true
        },

             title:{
                    type:String,
                    required:true
             },

                  note:{
                  type:String,
                  required:true
                  }
       },
       {timestamps:true}
    )
    

const notesModel=model("note",notesSchema)

       module.exports=notesModel