import { Book, BorrowedBook } from '../types';

// Get all books
export const getAllBooks = async (): Promise<Book[]> => {
  const response = await fetch('http://localhost:8000/books');
  if (!response.ok) return [];
  return await response.json();
};

// Get book by ID
export const getBookById = async (id: string): Promise<Book | undefined> => {
  const response = await fetch(`http://localhost:8000/books/${id}`);
  if (!response.ok) return undefined;
  return await response.json();
};

// Add new book
export const addBook = async (book: Omit<Book, 'id' | 'addedAt'>): Promise<Book> => {
  const response = await fetch('http://localhost:8000/books', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(book),
  });
  if (!response.ok) throw new Error('Kitap eklenemedi');
  return await response.json();
};

// Update book
export const updateBook = async (id: string, updates: Partial<Book>): Promise<Book> => {
  const response = await fetch(`http://localhost:8000/books/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Kitap güncellenemedi');
  return await response.json();
};

// Delete book
export const deleteBook = async (id: string): Promise<boolean> => {
  const response = await fetch(`http://localhost:8000/books/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Kitap silinemedi');
  return true;
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
export const returnBook = async (borrowId: string): Promise<any> => {
  const response = await fetch(`http://localhost:8000/borrowed/return/${borrowId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  if (!response.ok) return null;
  return await response.json();
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
export const getAllActiveBorrows = async (): Promise<BorrowedBook[]> => {
  const response = await fetch('http://localhost:8000/borrowed/active');
  if (!response.ok) return [];
  return await response.json();
};