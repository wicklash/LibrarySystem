import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, isAfter } from 'date-fns';
import UserLayout from '../../components/Layout/UserLayout';
import { Card, CardHeader, CardBody } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { Clock, AlertCircle, BookOpen, Check, Book } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserBorrowedBooks } from '../../services/bookService';
import { BorrowedBook } from '../../types';

const UserBorrowedBooks: React.FC = () => {
  const { user } = useAuth();
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBorrowedBooks = async () => {
      if (user) {
        try {
          const data = await getUserBorrowedBooks(user.id);
          setBorrowedBooks(data);
        } catch (error) {
          console.error('Error fetching borrowed books:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchBorrowedBooks();
  }, [user]);

  const isOverdue = (dueDate: string) => {
    return isAfter(new Date(), new Date(dueDate));
  };

  return (
    <UserLayout title="My Borrowed Books">
      <div className="animate-fade-in">
        <div className="mb-8">
          <p className="text-gray-600">
            Here are the books you are currently borrowing. Please return them by their due date.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : borrowedBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {borrowedBooks.map((borrowedBook) => (
              <Card key={borrowedBook.id} className="h-full transform transition-transform hover:scale-[1.02]">
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={borrowedBook.book.coverImage}
                    alt={borrowedBook.book.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 right-0 p-2">
                    {isOverdue(borrowedBook.dueDate) ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <AlertCircle size={12} className="mr-1" />
                        Overdue
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Clock size={12} className="mr-1" />
                        Active
                      </span>
                    )}
                  </div>
                </div>
                <CardBody>
                  <h3 className="text-lg font-semibold mb-1 line-clamp-1">{borrowedBook.book.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">by {borrowedBook.book.author}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <BookOpen size={16} className="mr-2 text-gray-400" />
                      <span>Borrowed: {format(new Date(borrowedBook.borrowDate), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock size={16} className={`mr-2 ${isOverdue(borrowedBook.dueDate) ? 'text-red-500' : 'text-gray-400'}`} />
                      <span className={isOverdue(borrowedBook.dueDate) ? 'text-red-600 font-medium' : ''}>
                        Due: {format(new Date(borrowedBook.dueDate), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                    <p className="truncate">
                      {borrowedBook.book && borrowedBook.book.description
                        ? `"${borrowedBook.book.description.substring(0, 150)}..."`
                        : "No description available."}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Link to={`/user/book/${borrowedBook.book.id}`} className="flex-1">
                      <Button variant="outline" size="sm" fullWidth>
                        <Book size={16} className="mr-1" />
                        Details
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardBody>
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No borrowed books</h3>
              <p className="mt-1 text-gray-500">
                You don't have any active borrows at the moment.
              </p>
              <div className="mt-6">
                <Link to="/user/browse">
                  <Button>
                    <BookOpen size={18} className="mr-2" />
                    Browse Books
                  </Button>
                </Link>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </UserLayout>
  );
};

export default UserBorrowedBooks;