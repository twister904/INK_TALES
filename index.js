import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { data_base } from "./conf";
const app=express();
const port=3000;
const db = new pg.Client(data_base);
db.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`Request received from IP: ${ip}`);
    next();
  });
async function getbooks(order){
    try {
        const result=await db.query(`select *from book_content order by ${order} desc`);
        const books=result.rows;
        console.log(books);
        return books;
    } catch (error) {
        console.log(error);
    }
}
async function get_books_notes(isbn) {
    try {
        const result = await db.query(
            "SELECT * FROM book_content JOIN book_notes ON book_content.isbn_number = book_notes.isbn_number WHERE book_content.isbn_number = $1",
            [isbn]
        );
        console.log(result.rows);
        const book_note = result.rows; 
        return book_note;
    } catch (error) {
        console.error('Error fetching book notes:', error); // Error handling
    }
}
async function getcomments(){
    try {
        const result=await db.query("select *from comment_section");
        const comments=result.rows;
        return(result.rows);
    } catch (error) {
        console.log(error);
    }
}
app.get("/", async (req, res) => {
   let order=req.query.order;
    if(order==null)
        order="isbn_number";
    console.log(order);
    try{
        const books_content= await getbooks(order);
        
        res.render("index.ejs",{books_content:books_content});
    }
    catch(err){
        console.log(err);
    }
});
app.get("/booknotes/:book_isbn", async (req, res) => {
    const book_isbn = req.params.book_isbn;
    try{
        const book_note=await get_books_notes(book_isbn);
        res.render("booknotes.ejs",{book_note:book_note});
    }
    catch(err){
        console.log(err);
    }
});
app.get("/edit",(req,res)=>{
    res.render("edit.ejs");
    });
app.post("/edit",async(req,res)=>{
    const {isbn_number,data,data_to_update}=req.body;
    const {name,email,password,security_question}=req.body;
    try {        
        const flag=await db.query("select *from log_in_credentials where name=$1 AND email=$2 AND password=$3 AND security_question=$4",[name,email,password,security_question]);
        if(flag.rows.length>0){
       const  result =await db.query(`update book_content set ${data}=$1 where book_content.isbn_number=$2 returning *`,[data_to_update,isbn_number]);
       console.log(result.rows);
       res.redirect("/");
    }
    else{
        res.redirect("/");
        console.log({name,email,password,security_question});       
    }
    } catch (error) {
        console.log(error);
    }

});
app.get("/aboutme",async(req,res)=>{
    const comments= await getcomments();
    const aboutme=" ";
    res.render("aboutme.ejs",{comments:comments,aboutme:aboutme});
})
app.post("/postcomment",async(req,res)=>{
    const name=req.body.name;
    const email=req.body.email;
    const comment=req.body.comment;
    console.log(email);
    if (!name || !email || !comment) {
        return res.status(400).send('All fields are required.');
    }
    try {
        const result=await db.query("insert into comment_section (name, email, comment)  values($1,$2,$3) returning *",[name,email,comment]);
        console.log(result.rows[0]);
        res.redirect("/aboutme");
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
});
app.get("/addnewdata",(req,res)=>{

res.render("addnewdata.ejs");
});
app.get("/contact",async(req,res)=>{
    res.render("contact.ejs");
})
app.post("/addnewdata",async(req,res)=>{
    const {isbn_number,book_notes,book_name,author,rating,about,date_published}= req.body;
    const {name,email,password,security_question}=req.body;
    const formatted_date= new Date(date_published).toISOString().split('T')[0];
    try{
        const flag=await db.query("select *from log_in_credentials where name=$1 AND email=$2 AND password=$3 AND security_question=$4",[name,email,password,security_question]);
        if(flag.rows.length>0){
            const result1=await db.query("insert into book_content values ($1,$2,$3,$4,$5,$6) returning *",[isbn_number,book_name,author,about,rating,formatted_date]);
            const result2=await db.query("insert into book_notes values ($1,$2) returning *",[isbn_number,book_notes]);
            console.log(result1,result2);
            res.redirect("/");
        }
        else{
            res.redirect("/");
            const flag2=await db.query("select *from log_in_credentials");
            console.log(flag2.rows);
            console.log({name,email,password,security_question});       
        }
    }
    catch(err){
        console.log(err);
        res.status(500).send('internal server error');
    }
});
app.get("/delete",(req,res)=>{
    res.render("delete.ejs");
    });
app.post("/delete",async(req,res)=>{
    const isbn_number= req.body.isbn_number;
    const {name,email,password,security_question}=req.body;
    try{
        const flag=await db.query("select *from log_in_credentials where name=$1 AND email=$2 AND password=$3 AND security_question=$4",[name,email,password,security_question]);
        if(flag.rows.length>0){
            const result2=await db.query("delete from book_notes where isbn_number=$1 returning *",[isbn_number]);
            const result1=await db.query("delete from book_content where isbn_number=$1 returning *",[isbn_number]);
            console.log(result1,result2);
            res.redirect("/");
        }
        else{
            res.redirect("/");
            console.log({name,email,password,security_question});       
        }

    }
    catch(err){
        console.log(err);
        res.status(500).send('internal server error');
    }
});
app.get("/search_book",async(req,res)=>{
    const isbn_number=req.query.isbn_number;
    console.log(isbn_number);
    try{
        const book_note=await db.query("SELECT * FROM book_content JOIN book_notes ON book_content.isbn_number = book_notes.isbn_number WHERE book_content.isbn_number = $1",[isbn_number]);
        console.log(book_note.rows);
        res.render("booknotes.ejs",{book_note:book_note.rows});
    }
    catch(err){
        res.status(500).send('internal server error');
        console.log(err);
    }
});
app.listen(port,()=>{
    console.log(`listening on port http://localhost:${port}`);
});
