export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImage: string;
  isbn: string;
  publishYear: number;
  category: string;
  available: boolean;
  totalCopies: number;
  availableCopies: number;
  addedAt: string;
}

export interface BorrowedBook {
  id: string;
  bookId: string;
  userId: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  book: Book;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface LibraryStats {
  totalBooks: number;
  totalUsers: number;
  activeBorrows: number;
  overdueBorrows: number;
  popularCategories: { name: string; count: number }[];
}