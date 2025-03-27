document.addEventListener('DOMContentLoaded', () => {
    loadAuthors();
    loadGenres();
    loadBooks();
    loadAuthorsForSelect();
    loadGenresForSelect();
});

document.getElementById('addAuthorForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;

    try {
        const response = await fetch('/api/authors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ first_name: firstName, last_name: lastName }),
        });

        if (response.ok) {
            alert('Autor úspěšně přidán');
            document.getElementById('addAuthorForm').reset();
            loadAuthors();
            loadAuthorsForSelect();
        } else {
            const error = await response.json();
            alert(`Chyba: ${error.error}`);
        }
    } catch (err) {
        alert(`Chyba: ${err.message}`);
    }
});

document.getElementById('addGenreForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const genreName = document.getElementById('genreName').value;

    try {
        const response = await fetch('/api/genres', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: genreName }),
        });

        if (response.ok) {
            alert('Žánr úspěšně přidán');
            document.getElementById('addGenreForm').reset();
            loadGenresForSelect();
        } else {
            const error = await response.json();
            alert(`Chyba: ${error.error}`);
        }
    } catch (err) {
        alert(`Chyba: ${err.message}`);
    }
});

document.getElementById('addBookForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('bookTitle').value;
    const releaseDate = document.getElementById('releaseDate').value;
    const authorId = document.getElementById('authorSelect').value;
    const genreId = document.getElementById('genreSelect').value;

    try {
        const response = await fetch('/api/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                title, 
                release_date: releaseDate, 
                author_id: authorId, 
                genre_id: genreId 
            }),
        });

        if (response.ok) {
            alert('Kniha úspěšně přidána');
            document.getElementById('addBookForm').reset();
            loadBooks();
        } else {
            const error = await response.json();
            alert(`Chyba: ${error.error}`);
        }
    } catch (err) {
        alert(`Chyba: ${err.message}`);
    }
});

document.getElementById('filterAuthorsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    loadAuthors();
});

document.getElementById('filterBooksForm').addEventListener('submit', (e) => {
    e.preventDefault();
    loadBooks();
});

async function loadAuthors() {
    const firstName = document.getElementById('filterFirstName').value;
    const lastName = document.getElementById('filterLastName').value;

    let url = '/api/authors';
    const params = [];
    if (firstName) params.push(`first_name=${encodeURIComponent(firstName)}`);
    if (lastName) params.push(`last_name=${encodeURIComponent(lastName)}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    try {
        const response = await fetch(url);
        const authors = await response.json();
        const tbody = document.querySelector('#authorsTable tbody');
        tbody.innerHTML = '';

        authors.forEach(author => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${author.id}</td>
                <td>${author.first_name}</td>
                <td>${author.last_name}</td>
                <td><button onclick="showAuthorDetail(${author.id})">Detail</button></td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        alert(`Chyba při načítání autorů: ${err.message}`);
    }
}

async function loadGenres() {
    try {
        const response = await fetch('/api/genres');
        return await response.json();
    } catch (err) {
        console.error(`Chyba při načítání žánrů: ${err.message}`);
        return [];
    }
}

async function loadBooks() {
    const title = document.getElementById('filterTitle').value;
    const releaseDate = document.getElementById('filterReleaseDate').value;
    const author = document.getElementById('filterAuthor').value;
    const genre = document.getElementById('filterGenre').value;

    let url = '/api/books';
    const params = [];
    if (title) params.push(`title=${encodeURIComponent(title)}`);
    if (releaseDate) params.push(`release_date=${encodeURIComponent(releaseDate)}`);
    if (author) params.push(`author=${encodeURIComponent(author)}`);
    if (genre) params.push(`genre=${encodeURIComponent(genre)}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    try {
        const response = await fetch(url);
        const books = await response.json();
        const tbody = document.querySelector('#booksTable tbody');
        tbody.innerHTML = '';

        books.forEach(book => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.release_date}</td>
                <td>${book.author_name}</td>
                <td>${book.genre_name}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        alert(`Chyba při načítání knih: ${err.message}`);
    }
}

async function loadAuthorsForSelect() {
    try {
        const response = await fetch('/api/authors');
        const authors = await response.json();
        const select = document.getElementById('authorSelect');
        const currentValue = select.value;
        select.innerHTML = '<option value="">Vyberte autora</option>';
        
        authors.forEach(author => {
            const option = document.createElement('option');
            option.value = author.id;
            option.textContent = `${author.first_name} ${author.last_name}`;
            select.appendChild(option);
        });
        
        if (currentValue && authors.some(a => a.id == currentValue)) {
            select.value = currentValue;
        }
    } catch (err) {
        console.error(`Chyba při načítání autorů: ${err.message}`);
    }
}

async function loadGenresForSelect() {
    try {
        const genres = await loadGenres();
        const select = document.getElementById('genreSelect');
        const currentValue = select.value;
        select.innerHTML = '<option value="">Vyberte žánr</option>';
        
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            select.appendChild(option);
        });
        
        if (currentValue && genres.some(g => g.id == currentValue)) {
            select.value = currentValue;
        }
    } catch (err) {
        console.error(`Chyba při načítání žánrů: ${err.message}`);
    }
}

async function showAuthorDetail(authorId) {
    try {
        const response = await fetch(`/api/authors/${authorId}`);
        const author = await response.json();
        
        const detailSection = document.getElementById('authorDetailSection');
        const detailContent = document.getElementById('authorDetail');
        
        let booksHtml = '';
        if (author.books && author.books.length > 0) {
            booksHtml = '<h3>Knihy:</h3><ul>';
            author.books.forEach(book => {
                booksHtml += `<li>${book.title} (${book.release_date}), ${book.genre_name}</li>`;
            });
            booksHtml += '</ul>';
        } else {
            booksHtml = '<p>Žádné knihy</p>';
        }
        
        detailContent.innerHTML = `
            <p><strong>Jméno:</strong> ${author.first_name} ${author.last_name}</p>
            <p><strong>Počet knih:</strong> ${author.books_count}</p>
            <p><strong>Oblíbený žánr:</strong> ${author.favorite_genre || 'Není dostupné'}</p>
            ${booksHtml}
        `;
        
        detailSection.style.display = 'block';
        detailSection.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        alert(`Chyba při načítání detailu autora: ${err.message}`);
    }
}