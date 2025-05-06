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
export const getBookById = (id: string): Promise<Book | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const book = books.find(book => book.id === id);
      resolve(book);
    }, 300);
  });
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
export const borrowBook = (userId: string, bookId: string): Promise<BorrowedBook | null> => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const book = await getBookById(bookId);
      
      if (!book || book.availableCopies <= 0) {
        resolve(null);
        return;
      }
      
      // Update book availability
      await updateBook(bookId, {
        availableCopies: book.availableCopies - 1,
        available: book.availableCopies - 1 > 0,
      });
      
      // Create borrowed record
      const now = new Date();
      const dueDate = new Date();
      dueDate.setDate(now.getDate() + 30); // Default 30-day borrow period
      
      const newBorrow: BorrowedBook = {
        id: (borrowedBooks.length + 1).toString(),
        bookId,
        userId,
        borrowDate: now.toISOString(),
        dueDate: dueDate.toISOString(),
        returnDate: null,
        book: book,
      };
      
      borrowedBooks.push(newBorrow);
      resolve(newBorrow);
    }, 700);
  });
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
export const getUserBorrowHistory = (userId: string): Promise<BorrowedBook[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userHistory = borrowedBooks.filter(
        borrow => borrow.userId === userId && borrow.returnDate
      );
      resolve(userHistory);
    }, 500);
  });
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