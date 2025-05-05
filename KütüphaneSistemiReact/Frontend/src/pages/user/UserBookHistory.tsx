import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import UserLayout from '../../components/Layout/UserLayout';
import { Card, CardHeader, CardBody } from '../../components/UI/Card';
import { History, BookOpen, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserBorrowHistory } from '../../services/bookService';
import { BorrowedBook } from '../../types';

const UserBookHistory: React.FC = () => {
  const { user } = useAuth();
  const [historyBooks, setHistoryBooks] = useState<BorrowedBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookHistory = async () => {
      if (user) {
        try {
          const data = await getUserBorrowHistory(user.id);
          setHistoryBooks(data);
        } catch (error) {
          console.error('Error fetching book history:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchBookHistory();
  }, [user]);

  return (
    <UserLayout title="Borrowing History">
      <div className="animate-fade-in">
        <div className="mb-8">
          <p className="text-gray-600">
            Your complete borrowing history. Here you can see all the books you've previously borrowed and returned.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : historyBooks.length > 0 ? (
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Your Reading History</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-8">
                {historyBooks.map((historyBook) => (
                  <div 
                    key={historyBook.id}
                    className="flex flex-col md:flex-row border-b border-gray-200 pb-6 last:border-b-0 last:pb-0 animate-slide-in"
                  >
                    <div className="md:w-32 lg:w-40 flex-shrink-0 mb-4 md:mb-0">
                      <div className="aspect-[2/3] overflow-hidden rounded-lg shadow-md">
                        <img
                          src={historyBook.book.coverImage}
                          alt={historyBook.book.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="md:ml-6 flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">{historyBook.book.title}</h4>
                      <p className="text-gray-600 text-sm mb-4">by {historyBook.book.author}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-4">
                        <div className="flex items-center text-sm">
                          <BookOpen size={16} className="mr-2 text-gray-400" />
                          <span>Borrowed: {format(new Date(historyBook.borrowDate), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar size={16} className="mr-2 text-gray-400" />
                          <span>Due: {format(new Date(historyBook.dueDate), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <History size={16} className="mr-2 text-gray-400" />
                          <span>Returned: {historyBook.returnDate ? format(new Date(historyBook.returnDate), 'MMM d, yyyy') : 'Not returned'}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <div className="flex items-center">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-green-700">Completed</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                        <p className="truncate">"{historyBook.book.description.substring(0, 150)}..."</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        ) : (
          <Card className="text-center py-12">
            <CardBody>
              <History className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No borrowing history</h3>
              <p className="mt-1 text-gray-500">
                You haven't borrowed any books in the past.
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </UserLayout>
  );
};

export default UserBookHistory;