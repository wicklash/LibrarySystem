import { Book, User, BorrowedBook, Message, LibraryStats } from '../types';
import { addDays, subDays, format } from 'date-fns';

export const users: User[] = [
  {
    id: '1',
    username: 'user1',
    email: 'user1@example.com',
    role: 'user',
    createdAt: subDays(new Date(), 30).toISOString(),
  },
  {
    id: '2',
    username: 'admin1',
    email: 'admin1@example.com',
    role: 'admin',
    createdAt: subDays(new Date(), 45).toISOString(),
  },
  {
    id: '3',
    username: 'user2',
    email: 'user2@example.com',
    role: 'user',
    createdAt: subDays(new Date(), 15).toISOString(),
  },
];

export const books: Book[] = [
  {
    id: '1',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description: 'A novel about racial inequality and loss of innocence in the American South.',
    coverImage: 'https://images.pexels.com/photos/1765033/pexels-photo-1765033.jpeg?auto=compress&cs=tinysrgb&w=400',
    isbn: '978-0-06-112008-4',
    publishYear: 1960,
    category: 'Classic',
    available: true,
    totalCopies: 5,
    availableCopies: 3,
    addedAt: subDays(new Date(), 60).toISOString(),
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    description: 'A dystopian novel set in a totalitarian society.',
    coverImage: 'https://images.pexels.com/photos/762687/pexels-photo-762687.jpeg?auto=compress&cs=tinysrgb&w=400',
    isbn: '978-0-452-28423-4',
    publishYear: 1949,
    category: 'Science Fiction',
    available: true,
    totalCopies: 3,
    availableCopies: 1,
    addedAt: subDays(new Date(), 45).toISOString(),
  },
  {
    id: '3',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A novel about the American Dream and the Roaring Twenties.',
    coverImage: 'https://images.pexels.com/photos/1670723/pexels-photo-1670723.jpeg?auto=compress&cs=tinysrgb&w=400',
    isbn: '978-0-7432-7356-5',
    publishYear: 1925,
    category: 'Classic',
    available: true,
    totalCopies: 4,
    availableCopies: 2,
    addedAt: subDays(new Date(), 30).toISOString(),
  },
  {
    id: '4',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    description: 'A fantasy novel about the adventures of hobbit Bilbo Baggins.',
    coverImage: 'https://images.pexels.com/photos/3747139/pexels-photo-3747139.jpeg?auto=compress&cs=tinysrgb&w=400',
    isbn: '978-0-618-00221-4',
    publishYear: 1937,
    category: 'Fantasy',
    available: true,
    totalCopies: 6,
    availableCopies: 4,
    addedAt: subDays(new Date(), 75).toISOString(),
  },
  {
    id: '5',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    description: 'A romantic novel of manners set in early 19th-century England.',
    coverImage: 'https://images.pexels.com/photos/3194464/pexels-photo-3194464.jpeg?auto=compress&cs=tinysrgb&w=400',
    isbn: '978-0-14-143951-8',
    publishYear: 1813,
    category: 'Romance',
    available: true,
    totalCopies: 3,
    availableCopies: 2,
    addedAt: subDays(new Date(), 90).toISOString(),
  },
  {
    id: '6',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    description: 'A novel about adolescent angst and alienation.',
    coverImage: 'https://images.pexels.com/photos/1738057/pexels-photo-1738057.jpeg?auto=compress&cs=tinysrgb&w=400',
    isbn: '978-0-316-76948-0',
    publishYear: 1951,
    category: 'Classic',
    available: true,
    totalCopies: 4,
    availableCopies: 3,
    addedAt: subDays(new Date(), 50).toISOString(),
  },
];

export const borrowedBooks: BorrowedBook[] = [
  {
    id: '1',
    bookId: '1',
    userId: '1',
    borrowDate: subDays(new Date(), 15).toISOString(),
    dueDate: addDays(new Date(), 15).toISOString(),
    returnDate: null,
    book: books.find(book => book.id === '1')!,
  },
  {
    id: '2',
    bookId: '2',
    userId: '1',
    borrowDate: subDays(new Date(), 10).toISOString(),
    dueDate: addDays(new Date(), 20).toISOString(),
    returnDate: null,
    book: books.find(book => book.id === '2')!,
  },
  {
    id: '3',
    bookId: '3',
    userId: '3',
    borrowDate: subDays(new Date(), 30).toISOString(),
    dueDate: subDays(new Date(), 5).toISOString(),
    returnDate: null,
    book: books.find(book => book.id === '3')!,
  },
  {
    id: '4',
    bookId: '4',
    userId: '1',
    borrowDate: subDays(new Date(), 45).toISOString(),
    dueDate: subDays(new Date(), 15).toISOString(),
    returnDate: subDays(new Date(), 18).toISOString(),
    book: books.find(book => book.id === '4')!,
  },
];

export const messages: Message[] = [
  {
    id: '1',
    senderId: '1',
    receiverId: '2',
    content: 'Hello, I wanted to ask about extending my borrowing period for "To Kill a Mockingbird".',
    read: true,
    createdAt: subDays(new Date(), 3).toISOString(),
  },
  {
    id: '2',
    senderId: '2',
    receiverId: '1',
    content: 'Hi, yes that should be fine. I can extend it for another 2 weeks.',
    read: true,
    createdAt: subDays(new Date(), 2).toISOString(),
  },
  {
    id: '3',
    senderId: '1',
    receiverId: '2',
    content: 'Thank you so much! I appreciate it.',
    read: false,
    createdAt: subDays(new Date(), 1).toISOString(),
  },
  {
    id: '4',
    senderId: '3',
    receiverId: '2',
    content: 'Do you have any new science fiction books coming in?',
    read: false,
    createdAt: subDays(new Date(), 4).toISOString(),
  },
];

export const libraryStats: LibraryStats = {
  totalBooks: books.reduce((sum, book) => sum + book.totalCopies, 0),
  totalUsers: users.filter(user => user.role === 'user').length,
  activeBorrows: borrowedBooks.filter(borrow => !borrow.returnDate).length,
  overdueBorrows: borrowedBooks.filter(
    borrow => !borrow.returnDate && new Date(borrow.dueDate) < new Date()
  ).length,
  popularCategories: [
    { name: 'Classic', count: 3 },
    { name: 'Fantasy', count: 1 },
    { name: 'Science Fiction', count: 1 },
    { name: 'Romance', count: 1 },
  ],
};

// Mock auth functions
export const mockLogin = (email: string, password: string): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = users.find(u => u.email === email);
      if (user && password === 'password') {
        resolve(user);
      } else {
        resolve(null);
      }
    }, 800);
  });
};

export const mockRegister = (username: string, email: string, password: string): Promise<User | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const exists = users.some(u => u.email === email);
      if (!exists) {
        const newUser: User = {
          id: (users.length + 1).toString(),
          username,
          email,
          role: 'user',
          createdAt: new Date().toISOString(),
        };
        users.push(newUser);
        resolve(newUser);
      } else {
        resolve(null);
      }
    }, 800);
  });
};