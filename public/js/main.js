document.getElementById('sortby').addEventListener('change', async (event) => {
    const sortorder = event.target.value;
    if (sortorder !== 'default') {
        try {
            const response = await axios.get(`/?order=${sortorder}`);
            const books = response.data;
            console.log(books);
            displayBooks(books);
        } catch (error) {
            console.log(error);
        }
    }
});

function displayBooks(books) {
    const booksContainer = document.getElementById('book-list');
    booksContainer.innerHTML = ''; // Clear previous books
    
    books.forEach(book => {
        const bookDiv = document.createElement('div');
        bookDiv.classList.add('book-content');
        bookDiv.innerHTML = `
            <a href="/booknotes/${book.isbn_number}" class="link-to-notes book_title">
                <h4>${book.book_name}</h4>
                <img src="https://covers.openlibrary.org/b/isbn/${book.isbn_number}-M.jpg" alt="Book Cover" class="book-cover">
            </a>
            <div class="book-info">
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>Published:</strong> ${book.date_published}</p>
                <p><strong>ISBN:</strong> ${book.isbn_number}</p>
            </div>
            <div class="book-about">
                <p>${book.about}</p>
            </div>
        `;
        booksContainer.appendChild(bookDiv);
    });
}

console.log("welcome to the website");
