import React, { useState, useEffect } from 'react';
import { format, isAfter } from 'date-fns';
import AdminLayout from '../../components/Layout/AdminLayout';
import { Card, CardHeader, CardBody } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  BookOpen, 
  Clock, 
  UserCheck,
  Filter
} from 'lucide-react';
import { 
  getAllActiveBorrows, 
  returnBook, 
  borrowBook, 
  getAllBooks 
} from '../../services/bookService';
import { users } from '../../data/mockData';
import { BorrowedBook, Book, User } from '../../types';

const ManageBorrows: React.FC = () => {
  const [activeBorrows, setActiveBorrows] = useState<BorrowedBook[]>([]);
  const [filteredBorrows, setFilteredBorrows] = useState<BorrowedBook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'overdue' | 'active'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [returnProgress, setReturnProgress] = useState<{[key: string]: boolean}>({});
  const [showAddBorrow, setShowAddBorrow] = useState(false);
  
  // New borrow form state
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [borrowFormErrors, setBorrowFormErrors] = useState<{book?: string; user?: string}>({});
  const [borrowingInProgress, setBorrowingInProgress] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const borrowsData = await getAllActiveBorrows();
        const booksData = await getAllBooks();
        
        // Only include books that have available copies
        const available = booksData.filter(book => book.availableCopies > 0);
        
        setActiveBorrows(borrowsData);
        setFilteredBorrows(borrowsData);
        setAvailableBooks(available);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter borrows based on search query and status
  useEffect(() => {
    let filtered = [...activeBorrows];
    
    // Apply status filter
    if (filterStatus === 'overdue') {
      filtered = filtered.filter(borrow => 
        isAfter(new Date(), new Date(borrow.dueDate))
      );
    } else if (filterStatus === 'active') {
      filtered = filtered.filter(borrow => 
        !isAfter(new Date(), new Date(borrow.dueDate))
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(borrow => {
        const user = users.find(u => u.id === borrow.userId);
        return (
          borrow.book.title.toLowerCase().includes(query) ||
          borrow.book.author.toLowerCase().includes(query) ||
          (user && user.username.toLowerCase().includes(query))
        );
      });
    }
    
    setFilteredBorrows(filtered);
  }, [searchQuery, filterStatus, activeBorrows]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleReturnBook = async (borrowId: string) => {
    setReturnProgress({...returnProgress, [borrowId]: true});
    
    try {
      const returned = await returnBook(borrowId);
      if (returned) {
        // Update the list of active borrows
        setActiveBorrows(activeBorrows.filter(borrow => borrow.id !== borrowId));
      }
    } catch (error) {
      console.error('Error returning book:', error);
    } finally {
      setReturnProgress({...returnProgress, [borrowId]: false});
    }
  };

  const handleAddNewBorrow = async () => {
    const errors: {book?: string; user?: string} = {};
    
    if (!selectedBook) errors.book = 'Please select a book';
    if (!selectedUser) errors.user = 'Please select a user';
    
    if (Object.keys(errors).length > 0) {
      setBorrowFormErrors(errors);
      return;
    }
    
    setBorrowingInProgress(true);
    
    try {
      const result = await borrowBook(selectedUser, selectedBook);
      
      if (result) {
        // Refresh the borrows list
        const updatedBorrows = await getAllActiveBorrows();
        setActiveBorrows(updatedBorrows);
        
        // Update available books
        const booksData = await getAllBooks();
        const available = booksData.filter(book => book.availableCopies > 0);
        setAvailableBooks(available);
        
        // Reset form
        setSelectedBook('');
        setSelectedUser('');
        setBorrowFormErrors({});
        setShowAddBorrow(false);
      } else {
        setBorrowFormErrors({ 
          book: 'Error borrowing book. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error creating new borrow:', error);
      setBorrowFormErrors({ 
        book: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setBorrowingInProgress(false);
    }
  };

  // Get user information
  const getUserById = (userId: string): User | undefined => {
    return users.find(user => user.id === userId);
  };

  const getBorrowerName = (borrow: BorrowedBook): string => {
    const user = getUserById(borrow.userId);
    return user ? user.username : 'Unknown User';
  };

  return (
    <AdminLayout title="Manage Borrowing">
      <div className="animate-fade-in">
        <div className="mb-8">
          <p className="text-gray-600">
            Manage book borrowing activities, process returns, and issue new loans.
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="md:flex-1">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="sm:flex-1 relative">
                <Input
                  type="text"
                  placeholder="Search by book title, author, or borrower..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 w-full"
                  fullWidth
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
              </div>
              
              <div className="flex gap-2 items-center">
                <Filter size={18} className="text-gray-500" />
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filterStatus === 'all'
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterStatus('active')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filterStatus === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterStatus('overdue')}
                  className={`px-3 py-1 rounded-full text-sm ${
                    filterStatus === 'overdue'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Overdue
                </button>
              </div>
            </div>
          </div>
          
          <div>
            <Button onClick={() => setShowAddBorrow(!showAddBorrow)}>
              <BookOpen size={20} className="mr-2" />
              New Borrowing
            </Button>
          </div>
        </div>

        {showAddBorrow && (
          <Card className="mb-8">
            <CardHeader>
              <h3 className="text-lg font-semibold">Create New Borrowing</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="select-book" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Book
                  </label>
                  <select
                    id="select-book"
                    value={selectedBook}
                    onChange={(e) => {
                      setSelectedBook(e.target.value);
                      if (borrowFormErrors.book) {
                        setBorrowFormErrors({...borrowFormErrors, book: undefined});
                      }
                    }}
                    className={`shadow-sm rounded-md border px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      borrowFormErrors.book
                        ? 'border-red-300 text-red-900'
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Select a book --</option>
                    {availableBooks.map(book => (
                      <option key={book.id} value={book.id}>
                        {book.title} ({book.availableCopies} available)
                      </option>
                    ))}
                  </select>
                  {borrowFormErrors.book && (
                    <p className="mt-1 text-sm text-red-600">{borrowFormErrors.book}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="select-user" className="block text-sm font-medium text-gray-700 mb-1">
                    Select User
                  </label>
                  <select
                    id="select-user"
                    value={selectedUser}
                    onChange={(e) => {
                      setSelectedUser(e.target.value);
                      if (borrowFormErrors.user) {
                        setBorrowFormErrors({...borrowFormErrors, user: undefined});
                      }
                    }}
                    className={`shadow-sm rounded-md border px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                      borrowFormErrors.user
                        ? 'border-red-300 text-red-900'
                        : 'border-gray-300'
                    }`}
                  >
                    <option value="">-- Select a user --</option>
                    {users
                      .filter(user => user.role === 'user')
                      .map(user => (
                        <option key={user.id} value={user.id}>
                          {user.username} ({user.email})
                        </option>
                      ))}
                  </select>
                  {borrowFormErrors.user && (
                    <p className="mt-1 text-sm text-red-600">{borrowFormErrors.user}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowAddBorrow(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddNewBorrow}
                  disabled={borrowingInProgress}
                >
                  {borrowingInProgress ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <UserCheck size={18} className="mr-2" />
                      Create Borrowing
                    </>
                  )}
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredBorrows.length > 0 ? (
          <Card>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Book
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Borrower
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Borrow Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBorrows.map((borrow) => {
                      const isOverdue = isAfter(new Date(), new Date(borrow.dueDate));
                      const borrower = getBorrowerName(borrow);
                      
                      return (
                        <tr key={borrow.id} className={isOverdue ? 'bg-red-50' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <img
                                  className="h-10 w-10 rounded-md object-cover"
                                  src={borrow.book.coverImage}
                                  alt={borrow.book.title}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{borrow.book.title}</div>
                                <div className="text-sm text-gray-500">{borrow.book.author}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{borrower}</div>
                            <div className="text-sm text-gray-500">
                              {getUserById(borrow.userId)?.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {format(new Date(borrow.borrowDate), 'MMM d, yyyy')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                              {format(new Date(borrow.dueDate), 'MMM d, yyyy')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isOverdue ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <AlertTriangle size={12} className="mr-1" />
                                Overdue
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Clock size={12} className="mr-1" />
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              size="sm"
                              variant="accent"
                              onClick={() => handleReturnBook(borrow.id)}
                              disabled={returnProgress[borrow.id]}
                            >
                              {returnProgress[borrow.id] ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <CheckCircle size={16} className="mr-1" />
                                  Return
                                </>
                              )}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Card className="text-center py-12">
            <CardBody>
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No active borrows</h3>
              <p className="mt-1 text-gray-500">
                {searchQuery || filterStatus !== 'all'
                  ? "No borrows match your search or filter criteria."
                  : "There are no active book borrowings at the moment."}
              </p>
              <div className="mt-6">
                <Button onClick={() => setShowAddBorrow(true)}>
                  <BookOpen size={20} className="mr-2" />
                  New Borrowing
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageBorrows;