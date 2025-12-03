import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import session from 'express-session';

const app = express();

app.set("trust proxy", 1)
app.use(session({
    secret: 'cst336',
    resave: false,
    saveUninitialized:true,
}))
app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool
const pool = mysql.createPool({
    host: "jsftj8ez0cevjz8v.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "rq63ro5rtenc2twm",
    password: "y7mdpsql6fhn9lrp",
    database: "x6ij0hyll3qwgfjk",
    connectionLimit: 10,
    waitForConnections: true
});
const [rowsAuthors] = await pool.query('SELECT authorId, firstName, lastName FROM `authors`')
const [rowsCategories] = await pool.query('SELECT DISTINCT category FROM `quotes`')

//routes
app.get('/', (req, res) => {
   res.render("home.ejs");
});

//Displays form to add a new author
app.get("/addAuthor", async(req, res) =>{
    res.render('addAuthor.ejs')
});

//stores author data into the database
app.post("/addAuthor", async(req, res) =>{
    let firstName = req.body.fn;
    let lastName = req.body.ln;
    let dob = (req.body.dob);
    let sex = req.body.sex;
    let bio = req.body.bio;
    let sql = `INSERT INTO authors
                (firstName, lastName, dob, sex, bio)
                VALUES(?,?,?,?,?)`;
    let sqlParams = [firstName, lastName, dob, sex, bio];
    console.log(sqlParams);
    //const [rows] = await pool.query(sql, sqlParams);
    res.render('addAuthor.ejs')
});

//Displays form to add a new author
app.get("/addQuote", async(req, res) =>{
    let sql1 = `SELECT *     FROM authors    NATURAL JOIN quotes;`;
    let authorListSql = `SELECT firstName, lastName, authorId   FROM authors    GROUP BY authorId;`;
    let categoryListSql = `SELECT category FROM quotes GROUP BY category;`;
    const [rows] = await pool.query(sql1);
    const [aList] = await pool.query(authorListSql);
    const [cList] = await pool.query(categoryListSql);

    console.log(rows);
    res.render('addQuote.ejs',{aList, cList, isShort: false });
});

//stores quote data into the database
app.post("/addQuote", async(req, res) =>{
    let sql1 = `SELECT *     FROM authors    NATURAL JOIN quotes;`;
    let authorListSql = `SELECT firstName, lastName, authorId   FROM authors    GROUP BY authorId;`;
    let categoryListSql = `SELECT category FROM quotes GROUP BY category;`;
    const [rows] = await pool.query(sql1);
    const [aList] = await pool.query(authorListSql);
    const [cList] = await pool.query(categoryListSql);


    let authorId = req.body.authorId;
    let category = req.body.category;
    let quote = req.body.quote;
    
    // if(quote.length < 5){
    //     console.log("quote is short!");
    //     res.render('addQuote.ejs',{aList, cList});
    // }else{
    //     let sql = `INSERT INTO quotes
    //             (authorId, category, quote)
    //             VALUES(?,?,?)`;
    // let sqlParams = [authorId, category, quote];
    // console.log(sqlParams);
    // //const [rows] = await pool.query(sql, sqlParams);
    // res.render('addQuote.ejs',{aList, cList});
    // }

        let sql = `INSERT INTO quotes
            (authorId, category, quote)
            VALUES(?,?,?)`;
    let sqlParams = [authorId, category, quote];
    console.log(sqlParams);
    //const [rows] = await pool.query(sql, sqlParams);
    res.render('addQuote.ejs',{aList, cList, isShort: quote.length != '' &&  quote.length < 5 });
});

app.get('/authors', async (req,res) => {
    let sql = `SELECT authorId, firstName, lastName
                FROM authors
                ORDER BY lastName`;

    const [authors] = await pool.query(sql);         
    res.render('author.ejs',{authors})
});

app.get('/updateAuthor', async (req,res) => {
    let authorId = req.query.id;

    let sql = `SELECT *
                FROM authors
                WHERE authorId = ?`;
//w12 24:43

    const [authorInfo] = await pool.query(sql,[authorId]);         
    res.render('author.ejs',{authors})
});

app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await pool.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error!");
    }
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
})