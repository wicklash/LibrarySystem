import { Book, BorrowedBook } from '../types';
import { books, borrowedBooks } from '../data/mockData';

// Get all books
export const getAllBooks = (): Promise<Book[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...books]);
    }, 500);
  });
};

// Get book by ID
export const getBookById = async (id: string): Promise<Book | undefined> => {
  const response = await fetch(`http://localhost:8000/books/${id}`);
  if (!response.ok) return undefined;
  return await response.json();
};

// Add new book
export const addBook = (book: Omit<Book, 'id' | 'addedAt'>): Promise<Book> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newBook: Book = {
        ...book,
        id: (books.length + 1).toString(),
        addedAt: new Date().toISOString(),
      };
      books.push(newBook);
      resolve(newBook);
    }, 500);
  });
};

// Update book
export const updateBook = (id: string, updates: Partial<Book>): Promise<Book | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = books.findIndex(book => book.id === id);
      if (index !== -1) {
        const updatedBook = { ...books[index], ...updates };
        books[index] = updatedBook;
        resolve(updatedBook);
      } else {
        resolve(undefined);
      }
    }, 500);
  });
};

// Delete book
export const deleteBook = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = books.findIndex(book => book.id === id);
      if (index !== -1) {
        books.splice(index, 1);
        resolve(true);
      } else {
        resolve(false);
      }
    }, 500);
  });
};

// Borrow a book
export const borrowBook = async (userId: string, bookId: string): Promise<any> => {
  const response = await fetch('http://localhost:8000/borrowed/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId: Number(userId), bookId: Number(bookId) }),
  });
  if (!response.ok) return null;
  return await response.json();
};

// Return a book
export const returnBook = (borrowId: string): Promise<BorrowedBook | null> => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const borrowIndex = borrowedBooks.findIndex(b => b.id === borrowId);
      
      if (borrowIndex === -1) {
        resolve(null);
        return;
      }
      
      const borrow = borrowedBooks[borrowIndex];
      
      // Update borrow record
      const updatedBorrow = {
        ...borrow,
        returnDate: new Date().toISOString(),
      };
      
      borrowedBooks[borrowIndex] = updatedBorrow;
      
      // Update book availability
      const book = await getBookById(borrow.bookId);
      if (book) {
        await updateBook(borrow.bookId, {
          availableCopies: book.availableCopies + 1,
          available: true,
        });
      }
      
      resolve(updatedBorrow);
    }, 700);
  });
};

// Get user's borrowed books
export const getUserBorrowedBooks = async (userId: string): Promise<BorrowedBook[]> => {
  const response = await fetch(`http://localhost:8000/borrowed/user/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch borrowed books");
  return await response.json();
};

// Get user's borrowing history
export const getUserBorrowHistory = async (userId: string): Promise<BorrowedBook[]> => {
  const response = await fetch(`http://localhost:8000/borrowed/history/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch borrow history");
  return await response.json();
};

// Get all active borrows (admin)
export const getAllActiveBorrows = (): Promise<BorrowedBook[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const activeBorrows = borrowedBooks.filter(borrow => !borrow.returnDate);
      resolve(activeBorrows);
    }, 500);
  });
};