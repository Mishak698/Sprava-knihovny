
CREATE TABLE IF NOT EXISTS authors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);


CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    release_date TEXT NOT NULL,
    author_id INTEGER NOT NULL,
    genre_id INTEGER NOT NULL,
    FOREIGN KEY (author_id) REFERENCES authors(id),
    FOREIGN KEY (genre_id) REFERENCES genres(id)
);


INSERT INTO authors (first_name, last_name) VALUES 
('Karel', 'Čapek'),
('Bohumil', 'Hrabal'),
('Milan', 'Kundera'),
('Jaroslav', 'Hašek'),
('Franz', 'Kafka');


INSERT INTO genres (name) VALUES 
('Sci-fi'),
('Román'),
('Povídky'),
('Satira'),
('Absurdní literatura'),
('Filozofické dílo');


INSERT INTO books (title, release_date, author_id, genre_id) VALUES 
('R.U.R.', '1920-01-01', 1, 1),
('Válka s mloky', '1936-01-01', 1, 1),
('Obsluhoval jsem anglického krále', '1971-01-01', 2, 2),
('Příliš hlučná samota', '1976-01-01', 2, 2),
('Nesnesitelná lehkost bytí', '1984-01-01', 3, 6),
('Osudy dobrého vojáka Švejka', '1921-01-01', 4, 4),
('Proces', '1925-01-01', 5, 5),
('Zámek', '1926-01-01', 5, 5);
