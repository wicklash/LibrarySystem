import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../../components/Layout/UserLayout';
import StatCard from '../../components/UI/StatCard';
import { Card, CardHeader, CardBody } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { Book, BookOpen, History, MessageSquare, Award } from 'lucide-react';
import { getAllBooks, getBookCategories, getAvailableBooks } from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';
import { getUserBorrowedBooks } from '../../services/bookService';
import { getActiveBorrowCount } from '../../services/userService';
import { getUnreadMessageCountV2 } from '../../services/messageService';
import { BorrowedBook } from '../../types';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeBorrows, setActiveBorrows] = useState<BorrowedBook[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [activeBorrowCount, setActiveBorrowCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [libraryStats, setLibraryStats] = useState<{ totalBooks: number, popularCategories: { name: string, count: number }[] }>({ totalBooks: 0, popularCategories: [] });
  const [availableBooksCount, setAvailableBooksCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          const borrowsData = await getUserBorrowedBooks(user.id);
          const messagesCount = await getUnreadMessageCountV2(Number(user.id));
          const borrowCount = await getActiveBorrowCount(Number(user.id));
          const books = await getAllBooks();
          const categories = await getBookCategories();
          const availableBooks = await getAvailableBooks();
          // Popüler kategoriler (en çok kitaba sahip ilk 5 kategori)
          const popularCategories = categories.sort((a: {count: number}, b: {count: number}) => b.count - a.count).slice(0, 5);
          setActiveBorrows(borrowsData);
          setUnreadMessages(messagesCount);
          setActiveBorrowCount(borrowCount);
          setAvailableBooksCount(availableBooks.length);
          setLibraryStats({
            totalBooks: books.length,
            popularCategories
          });
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  const categoryCount = libraryStats.popularCategories.length;

  return (
    <UserLayout title="Dashboard">
      <div className="animate-fade-in">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Welcome back, {user?.username}!</h2>
          <p className="text-gray-600">
            Here's an overview of your library activity and available resources.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Available Books"
            value={availableBooksCount}
            icon={<Book size={24} />}
            color="primary"
          />
          <StatCard
            title="Your Active Borrows"
            value={activeBorrowCount}
            icon={<BookOpen size={24} />}
            color="secondary"
          />
          <StatCard
            title="Book Categories"
            value={categoryCount}
            icon={<Award size={24} />}
            color="accent"
          />
          <StatCard
            title="Unread Messages"
            value={unreadMessages}
            icon={<MessageSquare size={24} />}
            color={unreadMessages > 0 ? "warning" : "success"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Your Active Borrows</h3>
                <Link to="/user/borrowed">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : activeBorrows.length > 0 ? (
                <div className="space-y-4">
                  {activeBorrows.slice(0, 3).map((borrow) => (
                    <div
                      key={borrow.id}
                      className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0 h-12 w-12 rounded-md bg-gray-200 overflow-hidden">
                        <img
                          src={borrow.book.coverImage}
                          alt={borrow.book.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {borrow.book.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(borrow.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No borrowed books</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You don't have any active borrows at the moment.
                  </p>
                  <div className="mt-6">
                    <Link to="/user/browse">
                      <Button>Browse Books</Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Popular Categories</h3>
                <Link to="/user/browse">
                  <Button variant="outline" size="sm">
                    Browse All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {libraryStats.popularCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-12 bg-primary-600 rounded-full mr-4"></div>
                      <span className="text-gray-800 font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {category.count} books
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-4">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/user/browse">
                    <Button variant="outline" size="sm" fullWidth>
                      <Book size={16} className="mr-2" />
                      Browse Books
                    </Button>
                  </Link>
                  <Link to="/user/messages">
                    <Button variant="outline" size="sm" fullWidth>
                      <MessageSquare size={16} className="mr-2" />
                      Messages
                    </Button>
                  </Link>
                  <Link to="/user/borrowed">
                    <Button variant="outline" size="sm" fullWidth>
                      <BookOpen size={16} className="mr-2" />
                      My Borrows
                    </Button>
                  </Link>
                  <Link to="/user/history">
                    <Button variant="outline" size="sm" fullWidth>
                      <History size={16} className="mr-2" />
                      History
                    </Button>
                  </Link>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserDashboard;