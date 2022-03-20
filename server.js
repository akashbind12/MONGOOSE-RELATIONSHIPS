const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.use(express.json());


const connect = ()=>{
    return mongoose.connect("mongodb://127.0.0.1:27017/librarySystem_assign")
}


//  Create schema for section
const sectionSchema = new mongoose.Schema(
   {
    section_name : {type : String, required : true}
   },
    {
        versionKey: false,
        timestamps: true, // createdAt, updatedAt
    }
);

// Connect the schema to section collection
const Section = mongoose.model("section", sectionSchema);



//  Create schema for books
const bookSchema = new mongoose.Schema(
    {
    name:{type:String, required:true},
    body:{type:String, required:true},
    section_name:{type : mongoose.Schema.Types.ObjectId, ref : "section", required : true}
  },
  {
    versionKey: false,
    timestamps: true, // createdAt, updatedAt
}
);

//Connect the schema to books collection
const Book = mongoose.model("book", bookSchema);



// Create schema for author
const authorSchema = new mongoose.Schema(
    {
    author_name:{type:String, required:true}
   },
   {
    versionKey: false,
    timestamps: true, // createdAt, updatedAt
}
);

//Connect the schema to authors collection
const Author = mongoose.model("author", authorSchema)



//Create schema for book author
const bookAuthorSchema = new mongoose.Schema(
    {
    book_id:{type : mongoose.Schema.Types.ObjectId, ref:"book", required:true},
    author_id:[{type : mongoose.Schema.Types.ObjectId, ref:"author", required:true}]
    },
    {
        versionKey: false,
        timestamps: true, // createdAt, updatedAt
    }
);

// Connect the Schema to bookAuthors collection
const BookAuthor = mongoose.model("bookAuthor", bookAuthorSchema)



//create schema for checkout 

const checkoutschema = new mongoose.Schema(
    {
        checkin_time : {type: String , required: false, default: null},
        checkout_time : {type: String , required: false, default: null},
        book_id:{type : mongoose.Schema.Types.ObjectId, ref:"book", required:true},
        section_id:{type : mongoose.Schema.Types.ObjectId, ref : "section", required : true}     
    },
    {
        versionKey: false,
        timestamps: true, // createdAt, updatedAt
    }
);

// Connect the Schema to checkout collection
const Checkout = mongoose.model("checkout", checkoutschema)





///----------------CRUD API for Section-----------------------

app.post("/section", async (req, res)=>{
    try{
        const sec = await Section.create(req.body)

        return res.status(201).send({sec})
    }catch(err){
        return res.status(500).send({message : err.message})
    }  
});

app.get("/section", async (req,res)=>{
    try{
        const sec = await Section.find().lean().exec();
        res.status(200).send({sec})
    }catch(err){
        return res.status(500).send({message : err.message})
    }     
});



//----------------CRUD API for Books-----------------------

app.post("/book", async (req, res)=>{
    try{ 
      const book = await Book.create(req.body)
      return res.status(201).send({book})
    }catch(err){
        return res.status(500).send({message : err.message})
    }
    
});

app.get("/book", async (req,res)=>{
   try{
    const book = await Book.find().populate("section_name").lean().exec()
    res.status(200).send({book})
   }catch(err){
    return res.status(500).send({message : err.message}) 
   }
});


app.get("/book/:id", async(req, res)=>{
   try{
    const book = await Book.findById(req.params.id).lean().exec();
    res.status(200).send({book})
   }catch(err){
    return res.status(500).send({message : err.message})  
   }
});



//----------------CRUD API for Authors-----------------------

app.post("/author", async (req, res)=>{
   try{
    const author = await Author.create(req.body)

    return res.status(201).send({author})
   }catch(err){
    return res.status(500).send({message : err.message})   
   }
});

app.get("/author", async (req,res)=>{
    try{
        const author = await Author.find().lean().exec();
    res.status(200).send({author})
    }catch(err){
        return res.status(500).send({message : err.message})   
    }
});


//----------------CRUD API for bookAuthor-----------------------

app.post("/bookauthor", async(req,res)=>{
   try{
    const bookauthor = await BookAuthor.create(req.body);
    return res.status(201).send({bookauthor})
   }catch(err){
    return res.status(500).send({message : err.message})   
   }
})

app.get("/bookauthor", async (req,res)=>{
    try{
     const bookauthor = await BookAuthor.find().populate("author_id").populate("book_id").lean().exec();
     res.status(200).send({bookauthor})
    }catch(err){
        return res.status(500).send({message : err.message})  
    }
});


//----------------CRUD API for checkout-----------------------

app.post("/checkout", async (req, res) => {
    try{
        const checkout = await Checkout.create(req.body);
        return res.status(201).send({checkout})
    }catch(err){
        return res.status(500).send({message : err.message})  
    }
});

app.get("/checkout", async (req, res) => {
    try{
        const checkout = await Checkout.find().populate("book_id").lean().exec();
        res.status(200).send({checkout})
       }catch(err){
           return res.status(500).send({message : err.message})  
       }
})

app.patch("/checkout/:id", async (req, res) => {
    try {
      const checkout_update = await Checkout.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      })

      return res.status(200).send(checkout_update);
    } catch (err) {
      return res.status(500).send({ message: err.message });
    }
  });



// All books written by an Author

app.get("/booksbyauthor/:id", async(req, res)=>{
  try{
    const match = await BookAuthor.find({author_id:req.params.id}).lean().populate("book_id").populate("author_id").exec();
    res.status(200).send({match})
  }catch(err){
    return res.status(500).send({message : err.message})  
  }
});


// find all books in a section by section_id

app.get("/booksinsection/:id", async(req, res) =>{
   try{
    const booksinsection = await Book.find({section_name:req.params.id}).lean().populate("section_name").exec();
    res.status(200).send({booksinsection})
   }catch(err){
    return res.status(500).send({message : err.message})  
   }
})

//find books in section that are not checked out

app.get("/notcheckout/:id", async(req, res) =>{
    try{
     const No_checkoutbooks = await Checkout.find({ section_id:req.params.id}).lean().populate({path:"book_id", populate:{path:"section_name"}}).exec();
     
    let  arr = No_checkoutbooks.map(function(el){
        return el.checkout_time!=null  && el.checkin_time==null;
    })
    console.log(arr);
    let avilable_books = [];
    for(let i=0 ; i<arr.length; i++){
        if(arr[i]==false){
            avilable_books.push(No_checkoutbooks[i])
        }
    }
    console.log(avilable_books)

     res.status(200).send({avilable_books})
    }catch(err){
     return res.status(500).send({message : err.message})  
    }
 })


app.listen(8000, async (req,res)=>{
    await connect();
    console.log("Listening to port 8000");
});