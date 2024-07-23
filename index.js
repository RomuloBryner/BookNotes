import pg from "pg";
import bodyParser from "body-parser";
import express from "express";
import axios, { Axios } from "axios";

const app = express();
const port = 3000;
const db = new pg.Client({
  user: "postgres",
  password: "YourPassword",
  database: "booklist",
  port: 5432,
  host: "localhost",
});
const APIURL = "https://openlibrary.org";

db.connect();

let booksList = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
    booksList = await db.query("SELECT * FROM books ORDER BY id ASC");
    res.render("index.ejs", { books: booksList.rows });
  } catch (error) {
    console.log(error);
  }
});

// Filter Book
app.get("/filter", async (req, res) => {
  const bookName = req.query.bookname.toLocaleLowerCase();
  const books = await db.query(
    "SELECT * FROM books WHERE book_name LIKE '%' || $1 || '%'",
    [bookName]
  );
  res.render("index.ejs", { books: books.rows });
});

// Filter Book By
app.get("/filterby", async (req, res) => {
  const booktype = req.query.type.toString();
  let books;
  if (booktype === "book_name") {
    books = await db.query(`SELECT * FROM books ORDER BY ${booktype} ASC`);
  } else {
    books = await db.query(`SELECT * FROM books ORDER BY ${booktype} DESC`);
  }
  res.render("index.ejs", { books: books.rows });
});

// New Book Page
app.get("/newbook", (req, res) => {
  res.render("modify.ejs");
});

// New Book
app.post("/newbook", async (req, res) => {
  const response = await axios.get(
    APIURL + `/search.json?q=${req.body.title.toLocaleLowerCase()}`
  );
  const final = response.data.docs[0].isbn[0].toString();
  const bookcover = `https://covers.openlibrary.org/b/isbn/${final}-L.jpg`;
  const bookData = {
    title: req.body.title.toLocaleLowerCase(),
    note: req.body.note,
    rate: req.body.rate,
    datestart: req.body.datestart,
    dateend: req.body.dateend,
    cover: bookcover,
  };
  try {
    await db.query(
      "INSERT INTO books (book_name, book_note, book_rate, read_start_date, read_end_date, book_cover) values ($1, $2, $3, $4, $5, $6)",
      [
        bookData.title,
        bookData.note,
        bookData.rate,
        bookData.datestart,
        bookData.dateend,
        bookData.cover,
      ]
    );
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

// Edit Book
app.post("/editbook/:id", async (req, res) => {
  const bookID = parseInt(req.params.id);
  try {
    const bookinfo = await db.query("SELECT * FROM books WHERE id = $1", [
      bookID,
    ]);
    res.render("modify.ejs", { book: bookinfo.rows[0] });
  } catch (error) {
    console.log(error);
  }
});

// Update Book
app.post("/updatebook", async (req, res) => {
  const bookUpdate = {
    id: req.body.id,
    title: req.body.title.toLocaleLowerCase(),
    note: req.body.note,
    rate: req.body.rate,
  };
  try {
    await db.query(
      "UPDATE books SET book_name = $1, book_note = $2, book_rate = $3 WHERE id = $4",
      [bookUpdate.title, bookUpdate.note, bookUpdate.rate, bookUpdate.id]
    );
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

// Delete Book
app.post("/deletebook/:id", async (req, res) => {
  const bookID = req.params.id;
  try {
    await db.query("DELETE FROM books WHERE id = $1", [bookID]);
    res.status(200).redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, (req, res) => {
  console.log(`Listening to port on http://localhost:${port}`);
});
