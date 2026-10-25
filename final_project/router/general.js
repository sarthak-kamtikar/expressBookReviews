const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const users = require('./auth_users.js').users;

const public_users = express.Router();
const INTERNAL_BOOKS_URL = 'http://127.0.0.1:5000/_internal/books';

// Axios retrieves the catalog from this local data route.
public_users.get('/_internal/books', (req, res) => {
  return res.json(books);
});

async function fetchBooks() {
  const response = await axios.get(INTERNAL_BOOKS_URL);
  return response.data;
}

// Register a new user
public_users.post('/register', (req, res) => {
  const { username, password } = req.body || {};

  if (
    typeof username !== 'string' ||
    typeof password !== 'string' ||
    !username.trim() ||
    !password
  ) {
    return res.status(400).json({
      message: 'Username and password are required.',
    });
  }

  const cleanUsername = username.trim();
  const usernameExists = users.some(
    (user) => user.username === cleanUsername
  );

  if (usernameExists) {
    return res.status(409).json({
      message: 'Username already exists.',
    });
  }

  users.push({ username: cleanUsername, password });

  return res.status(201).json({
    message: 'User successfully registered.',
  });
});

// Task 10: Get all books asynchronously
public_users.get('/', async (req, res) => {
  try {
    const catalog = await fetchBooks();
    return res.json(catalog);
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to retrieve the books.',
    });
  }
});

// Task 11: Get a book by ISBN asynchronously
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const catalog = await fetchBooks();
    const book = catalog[req.params.isbn];

    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    return res.json(book);
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to retrieve the book.',
    });
  }
});

// Task 12: Get books by author asynchronously
public_users.get('/author/:author', async (req, res) => {
  try {
    const catalog = await fetchBooks();
    const author = req.params.author.toLowerCase();
    const matchingBooks = {};
    const isbnList = Object.keys(catalog);

    isbnList.forEach((isbn) => {
      if (catalog[isbn].author.toLowerCase() === author) {
        matchingBooks[isbn] = catalog[isbn];
      }
    });

    return res.json(matchingBooks);
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to retrieve books by author.',
    });
  }
});

// Task 13: Get books by title asynchronously
public_users.get('/title/:title', async (req, res) => {
  try {
    const catalog = await fetchBooks();
    const title = req.params.title.toLowerCase();
    const matchingBooks = {};
    const isbnList = Object.keys(catalog);

    isbnList.forEach((isbn) => {
      if (catalog[isbn].title.toLowerCase() === title) {
        matchingBooks[isbn] = catalog[isbn];
      }
    });

    return res.json(matchingBooks);
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to retrieve books by title.',
    });
  }
});

// Get reviews for a book by ISBN
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];

  if (!book) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  return res.json(book.reviews);
});

module.exports.general = public_users;