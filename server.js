const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./library.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the library database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS authors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS genres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        release_date TEXT NOT NULL,
        author_id INTEGER NOT NULL,
        genre_id INTEGER NOT NULL,
        FOREIGN KEY (author_id) REFERENCES authors(id),
        FOREIGN KEY (genre_id) REFERENCES genres(id)
    )`);
});

app.get('/api/authors', (req, res) => {
    const { first_name, last_name } = req.query;
    let query = 'SELECT * FROM authors';
    const params = [];

    if (first_name || last_name) {
        query += ' WHERE ';
        const conditions = [];
        if (first_name) {
            conditions.push('first_name LIKE ?');
            params.push(`%${first_name}%`);
        }
        if (last_name) {
            conditions.push('last_name LIKE ?');
            params.push(`%${last_name}%`);
        }
        query += conditions.join(' AND ');
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/authors', (req, res) => {
    const { first_name, last_name } = req.body;
    db.run('INSERT INTO authors (first_name, last_name) VALUES (?, ?)', [first_name, last_name], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

app.get('/api/authors/:id', (req, res) => {
    const authorId = req.params.id;
    
    db.get('SELECT * FROM authors WHERE id = ?', [authorId], (err, author) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!author) {
            res.status(404).json({ error: 'Author not found' });
            return;
        }

        db.all('SELECT b.*, g.name as genre_name FROM books b JOIN genres g ON b.genre_id = g.id WHERE author_id = ?', [authorId], (err, books) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            db.get(`
                SELECT g.name, COUNT(*) as count 
                FROM books b 
                JOIN genres g ON b.genre_id = g.id 
                WHERE b.author_id = ? 
                GROUP BY g.id 
                ORDER BY count DESC 
                LIMIT 1`, [authorId], (err, favoriteGenre) => {
                
                const response = {
                    ...author,
                    books_count: books.length,
                    books: books,
                    favorite_genre: favoriteGenre ? favoriteGenre.name : null
                };
                
                res.json(response);
            });
        });
    });
});

app.get('/api/genres', (req, res) => {
    db.all('SELECT * FROM genres', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/genres', (req, res) => {
    const { name } = req.body;
    db.run('INSERT INTO genres (name) VALUES (?)', [name], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ id: this.lastID });
    });
});

app.get('/api/books', (req, res) => {
    const { title, release_date, author, genre } = req.query;
    let query = `
        SELECT b.*, 
               a.first_name || ' ' || a.last_name as author_name, 
               g.name as genre_name 
        FROM books b 
        JOIN authors a ON b.author_id = a.id 
        JOIN genres g ON b.genre_id = g.id`;
    
    const params = [];
    const conditions = [];

    if (title) {
        conditions.push('b.title LIKE ?');
        params.push(`%${title}%`);
    }
    if (release_date) {
        conditions.push('b.release_date = ?');
        params.push(release_date);
    }
    if (author) {
        conditions.push('(a.first_name LIKE ? OR a.last_name LIKE ?)');
        params.push(`%${author}%`, `%${author}%`);
    }
    if (genre) {
        conditions.push('g.name LIKE ?');
        params.push(`%${genre}%`);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post('/api/books', (req, res) => {
    const { title, release_date, author_id, genre_id } = req.body;
    db.run('INSERT INTO books (title, release_date, author_id, genre_id) VALUES (?, ?, ?, ?)', 
        [title, release_date, author_id, genre_id], 
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID });
        });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});