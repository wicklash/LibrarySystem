import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserLayout from '../../components/Layout/UserLayout';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { BookOpen, User, Calendar, ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { getBookById, borrowBook } from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';
import { Book } from '../../types';

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [borrowStatus, setBorrowStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const fetchBook = async () => {
      if (id) {
        try {
          const data = await getBookById(id);
          setBook(data || null);
        } catch (error) {
          console.error('Error fetching book details:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchBook();
  }, [id]);

  const handleBorrow = async () => {
    if (!user || !book || !book.available) return;
    
    setIsBorrowing(true);
    setBorrowStatus('idle');
    
    try {
      const result = await borrowBook(user.id, book.id);
      if (result) {
        setBorrowStatus('success');
        // Update book availability
        setBook({
          ...book,
          availableCopies: book.availableCopies - 1,
          available: book.availableCopies - 1 > 0,
        });
      } else {
        setBorrowStatus('error');
      }
    } catch (error) {
      console.error('Error borrowing book:', error);
      setBorrowStatus('error');
    } finally {
      setIsBorrowing(false);
    }
  };

  return (
    <UserLayout title="Book Details">
      <div className="animate-fade-in">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} className="mr-2" />
            Back to Books
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : book ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="sticky top-6">
                <Card>
                  <div className="p-6">
                    <div className="aspect-[2/3] overflow-hidden rounded-lg shadow-md mb-6">
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Status</span>
                        {book.available ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Available
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Not Available
                          </span>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Category</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {book.category}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Copies Available</span>
                        <span className="font-medium">{book.availableCopies} of {book.totalCopies}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">ISBN</span>
                        <span className="font-medium">{book.isbn}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Year</span>
                        <span className="font-medium">{book.publishYear}</span>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <Button
                        fullWidth
                        disabled={!book.available || isBorrowing}
                        onClick={handleBorrow}
                      >
                        {isBorrowing ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        ) : borrowStatus === 'success' ? (
                          <>
                            <CheckCircle size={18} className="mr-2" />
                            Borrowed Successfully
                          </>
                        ) : (
                          <>
                            <BookOpen size={18} className="mr-2" />
                            Borrow Book
                          </>
                        )}
                      </Button>

                      {borrowStatus === 'success' && (
                        <p className="text-center text-sm text-green-600 mt-2">
                          The book has been added to your borrowed books.
                        </p>
                      )}
                      
                      {borrowStatus === 'error' && (
                        <p className="text-center text-sm text-red-600 mt-2">
                          There was an error borrowing this book. Please try again.
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">{book.title}</h1>
                  <p className="text-xl text-gray-600 mb-2">by {book.author}</p>
                </CardHeader>
                <CardBody>
                  <div className="bg-primary-50 rounded-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold text-primary-800 mb-3">Overview</h2>
                    <p className="text-primary-700">{book.description}</p>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Details</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start space-x-3">
                          <BookOpen size={20} className="text-gray-400 mt-0.5" />
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Title</h3>
                            <p className="text-gray-800">{book.title}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <User size={20} className="text-gray-400 mt-0.5" />
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Author</h3>
                            <p className="text-gray-800">{book.author}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Clock size={20} className="text-gray-400 mt-0.5" />
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Publication Year</h3>
                            <p className="text-gray-800">{book.publishYear}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-3">
                          <Calendar size={20} className="text-gray-400 mt-0.5" />
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Added to Library</h3>
                            <p className="text-gray-800">{new Date(book.addedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Borrowing Information</h2>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <ul className="list-disc pl-6 text-gray-700 space-y-2">
                          <li>Standard borrowing period is 30 days</li>
                          <li>Books can be extended if no one is waiting</li>
                          <li>Late returns may incur fees</li>
                          <li>Handle books with care</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardBody>
                <CardFooter>
                  <p className="text-sm text-gray-500">Kitapla ilgili sorularınız için kütüphane personeline başvurabilirsiniz.</p>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardBody>
              <h3 className="text-lg font-medium text-gray-900">Book not found</h3>
              <p className="mt-1 text-gray-500">
                The book you're looking for does not exist or has been removed.
              </p>
              <div className="mt-6">
                <Button onClick={() => navigate('/user/browse')}>
                  Browse Books
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </UserLayout>
  );
};

export default BookDetails;