import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/Layout/AdminLayout';
import StatCard from '../../components/UI/StatCard';
import { Card, CardHeader, CardBody } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import {
  BookOpen,
  Users,
  AlertTriangle,
  Clock,
  Library,
  BookPlus,
  MessageSquare,
} from 'lucide-react';
import { getAllActiveBorrows, getAllBooks, getBookCategories, getOverdueBorrows } from '../../services/bookService';
import { getUserMessages } from '../../services/messageService';
import { getAllUsers } from '../../services/userService';
import { BorrowedBook } from '../../types';
import { format, isAfter } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const [activeBorrows, setActiveBorrows] = useState<BorrowedBook[]>([]);
  const [overdueBorrows, setOverdueBorrows] = useState<BorrowedBook[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [libraryStats, setLibraryStats] = useState<{ totalBooks: number, totalUsers: number, popularCategories: { name: string, count: number }[] }>({ totalBooks: 0, totalUsers: 0, popularCategories: [] });
  const [users, setUsers] = useState<any[]>([]);

  const user = users.find(u => u.role === 'admin');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [borrowsData, allBooks, allCategories, allUsers, overdueBorrowsData] = await Promise.all([
          getAllActiveBorrows(),
          getAllBooks(),
          getBookCategories(),
          getAllUsers(),
          getOverdueBorrows()
        ]);
        setUsers(allUsers);
        const adminUser = allUsers.find(u => u.role === 'admin');
        let unread = 0;
        if (adminUser) {
          const messages = await getUserMessages(adminUser.id);
          unread = messages.filter(
            message => message.receiverId === adminUser.id && !message.read
          ).length;
        }
        const popularCategories = allCategories.sort((a: {count: number}, b: {count: number}) => b.count - a.count).slice(0, 5);
        setActiveBorrows(borrowsData);
        setOverdueBorrows(overdueBorrowsData);
        setUnreadMessages(unread);
        setLibraryStats({
          totalBooks: allBooks.length,
          totalUsers: allUsers.length,
          popularCategories
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="animate-fade-in">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Library Administration Portal</h2>
          <p className="text-gray-600">
            Monitor library statistics and manage books, users, and borrowing activities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Books"
            value={libraryStats.totalBooks}
            icon={<Library size={24} />}
            color="primary"
          />
          <StatCard
            title="Registered Users"
            value={libraryStats.totalUsers}
            icon={<Users size={24} />}
            color="accent"
          />
          <StatCard
            title="Active Borrows"
            value={activeBorrows.length}
            icon={<BookOpen size={24} />}
            color="secondary"
          />
          <StatCard
            title="Overdue Books"
            value={overdueBorrows.length}
            icon={<AlertTriangle size={24} />}
            color={overdueBorrows.length > 0 ? "danger" : "success"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="h-full">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Recent Borrows</h3>
                <Link to="/admin/borrows">
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
                  {activeBorrows.slice(0, 5).map((borrow) => {
                    const isOverdue = isAfter(new Date(), new Date(borrow.dueDate));
                    
                    return (
                      <div
                        key={borrow.id}
                        className={`flex items-center p-3 border rounded-lg ${
                          isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:bg-gray-50'
                        } transition-colors`}
                      >
                        <div className="flex-shrink-0 h-10 w-10 rounded overflow-hidden bg-gray-200 mr-4">
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
                          <p className="text-xs text-gray-500">
                            Borrowed by: {users.find(u => u.id === borrow.userId)?.username}
                          </p>
                        </div>
                        <div className="ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isOverdue
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {isOverdue ? (
                              <>
                                <AlertTriangle size={12} className="mr-1" />
                                Overdue
                              </>
                            ) : (
                              <>
                                <Clock size={12} className="mr-1" />
                                Due {format(new Date(borrow.dueDate), 'MMM d')}
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No active borrows</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There are no books currently borrowed from the library.
                  </p>
                </div>
              )}
            </CardBody>
          </Card>

          <Card className="h-full">
            <CardHeader>
              <h3 className="text-lg font-semibold">Quick Actions</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary-50 rounded-lg p-4 flex flex-col">
                  <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <BookPlus size={24} className="text-primary-800" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary-800 mb-2">Add New Book</h3>
                  <p className="text-sm text-primary-700 mb-4">Add a new book to the library collection</p>
                  <Link to="/admin/books" className="mt-auto">
                    <Button variant="primary" size="sm" fullWidth>
                      Add Book
                    </Button>
                  </Link>
                </div>
                
                <div className="bg-secondary-50 rounded-lg p-4 flex flex-col">
                  <div className="bg-secondary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <BookOpen size={24} className="text-secondary-800" />
                  </div>
                  <h3 className="text-lg font-semibold text-secondary-800 mb-2">Manage Borrowing</h3>
                  <p className="text-sm text-secondary-700 mb-4">Process book loans and returns</p>
                  <Link to="/admin/borrows" className="mt-auto">
                    <Button variant="secondary" size="sm" fullWidth>
                      Manage
                    </Button>
                  </Link>
                </div>
                
                <div className="bg-accent-50 rounded-lg p-4 flex flex-col">
                  <div className="bg-accent-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <Library size={24} className="text-accent-800" />
                  </div>
                  <h3 className="text-lg font-semibold text-accent-800 mb-2">Book Inventory</h3>
                  <p className="text-sm text-accent-700 mb-4">View and update book inventory</p>
                  <Link to="/admin/books" className="mt-auto">
                    <Button variant="accent" size="sm" fullWidth>
                      View Inventory
                    </Button>
                  </Link>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-4 flex flex-col">
                  <div className="bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                    <MessageSquare size={24} className="text-gray-800" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">User Messages</h3>
                  <p className="text-sm text-gray-700 mb-4">Respond to user inquiries and requests</p>
                  <Link to="/admin/messages" className="mt-auto">
                    <Button variant="outline" size="sm" fullWidth>
                      View Messages
                      {unreadMessages > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                          {unreadMessages}
                        </span>
                      )}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Popular Categories</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {libraryStats.popularCategories.map((category, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center">
                  <div 
                    className={`w-3 h-10 rounded-full mr-4 ${
                      index === 0 ? 'bg-primary-600' : 
                      index === 1 ? 'bg-secondary-600' : 
                      index === 2 ? 'bg-accent-600' : 'bg-gray-400'
                    }`} 
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                    <p className="text-sm text-gray-500">{category.count} books</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;