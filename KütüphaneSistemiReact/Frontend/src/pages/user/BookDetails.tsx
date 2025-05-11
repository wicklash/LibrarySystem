import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import UserLayout from '../../components/Layout/UserLayout';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { BookOpen, User, Calendar, ArrowLeft, Clock, CheckCircle, Heart, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { getBookById, borrowBook, getBookReviews, addReview, likeReview, dislikeReview } from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';
import { Book } from '../../types';
import { addToFavorites, removeFromFavorites, checkFavorite } from '../../services/favoriteService';

interface Review {
  Id: number;
  BookId: number;
  UserId: number;
  Rating: number;
  Comment: string;
  Likes: number;
  Dislikes: number;
  CreatedAt: string;
  Username?: string; // Backend'den gelen kullanıcı adı
}

const BookDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [borrowStatus, setBorrowStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Ortalama puan hesaplama
  const averageRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.Rating, 0) / reviews.length).toFixed(1) : null;

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

  // Check if this book is in favorites
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (book && user) {
        try {
          const isFav = await checkFavorite(Number(user.id), Number(book.id));
          setIsFavorite(isFav);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }
    };

    checkFavoriteStatus();
  }, [book, user]);

  // Yorumları yükle
  useEffect(() => {
    const fetchReviews = async () => {
      if (id) {
        try {
          const data = await getBookReviews(id);
          setReviews(data);
        } catch (error) {
          console.error('Error fetching reviews:', error);
        }
      }
    };

    if (showReviews) {
      fetchReviews();
    }
  }, [id, showReviews, submitting]);

  const handleToggleFavorite = async () => {
    if (!book || !user) return;
    
    try {
      if (isFavorite) {
        await removeFromFavorites(Number(user.id), Number(book.id));
      } else {
        await addToFavorites(Number(user.id), Number(book.id));
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !book || userRating === 0 || !userComment.trim()) return;
    
    setSubmitting(true);
    try {
      await addReview(book.id, user.id, userRating, userComment);
      setUserRating(0);
      setUserComment('');
      // Yorumları yeniden yükle
      const updatedReviews = await getBookReviews(book.id);
      setReviews(updatedReviews);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeDislike = async (reviewId: number, type: 'like' | 'dislike') => {
    try {
      if (type === 'like') {
        await likeReview(reviewId.toString());
      } else {
        await dislikeReview(reviewId.toString());
      }
      // Yorumları yeniden yükle
      if (book) {
        const updatedReviews = await getBookReviews(book.id);
    setReviews(updatedReviews);
      }
    } catch (error) {
      console.error('Error updating review:', error);
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
                    
                    <div className="mt-6 flex flex-col gap-2">
                      <Button
                        fullWidth
                        variant="outline"
                        onClick={handleToggleFavorite}
                        className={isFavorite ? 'border-red-500 text-red-500 hover:bg-red-50' : 'border-gray-300 text-gray-500 hover:bg-gray-100'}
                      >
                        <Heart fill={isFavorite ? 'red' : 'none'} color={isFavorite ? 'red' : 'gray'} size={20} className="mr-2" />
                        {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                      </Button>
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

        {/* Yorumlar ve Puanlama Bölümü */}
        <div className="mt-10">
          <button
            className="text-primary-700 font-semibold flex items-center mb-4 hover:underline"
            onClick={() => setShowReviews((v) => !v)}
          >
            <Star className="mr-2 text-yellow-400" fill="#facc15" />
            {showReviews ? 'Yorumları Gizle' : 'Yorumları Göster'}
            {averageRating && (
              <span className="ml-4 flex items-center text-lg font-bold">
                {averageRating}
                <Star className="ml-1 text-yellow-400" fill="#facc15" size={20} />
                <span className="ml-2 text-base font-normal">({reviews.length} Değerlendirme)</span>
              </span>
            )}
          </button>
          {showReviews && (
            <div className="bg-white rounded-lg shadow p-6">
              {/* Ortalama puan */}
              {averageRating && (
                <div className="flex items-center mb-4">
                  <span className="text-3xl font-bold mr-2">{averageRating}</span>
                  <div className="flex">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={24} className={i <= Math.round(Number(averageRating)) ? 'text-yellow-400' : 'text-gray-300'} fill={i <= Math.round(Number(averageRating)) ? '#facc15' : 'none'} />
                    ))}
                  </div>
                  <span className="ml-4 text-gray-600">{reviews.length} Değerlendirme</span>
                </div>
              )}
              {/* Yorum ekleme formu */}
              <form onSubmit={handleReviewSubmit} className="mb-6">
                <div className="flex items-center mb-2">
                  {[1,2,3,4,5].map(i => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setUserRating(i)}
                      className="focus:outline-none"
                    >
                      <Star size={28} className={i <= userRating ? 'text-yellow-400' : 'text-gray-300'} fill={i <= userRating ? '#facc15' : 'none'} />
                    </button>
                  ))}
                </div>
                <textarea
                  className="w-full border rounded p-2 mb-2"
                  rows={2}
                  placeholder="Yorumunuzu yazın..."
                  value={userComment}
                  onChange={e => setUserComment(e.target.value)}
                />
                <Button type="submit" disabled={submitting || userRating === 0 || !userComment.trim()}>
                  {submitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}
                </Button>
              </form>
              {/* Yorumlar listesi */}
              {reviews.length === 0 ? (
                <p className="text-gray-500">Henüz yorum yok.</p>
              ) : (
                <div className="space-y-6">
                  {reviews.slice().reverse().map((r) => (
                    <div key={r.Id} className="border-b pb-4">
                      <div className="flex items-center mb-1">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-800 text-lg font-bold mr-3">
                          {r.Username?.slice(0,2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} size={18} className={i <= r.Rating ? 'text-yellow-400' : 'text-gray-300'} fill={i <= r.Rating ? '#facc15' : 'none'} />
                            ))}
                          </div>
                          <span className="text-gray-700 font-medium">{r.Username}</span>
                          <span className="ml-2 text-gray-400 text-xs">{new Date(r.CreatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="ml-14 text-gray-800 mb-2">{r.Comment}</div>
                      <div className="ml-14 flex items-center gap-4 text-gray-500">
                        <button type="button" className="flex items-center hover:text-blue-600" onClick={() => handleLikeDislike(r.Id, 'like')}>
                          <ThumbsUp size={18} className="mr-1" />
                          ({r.Likes || 0})
                        </button>
                        <button type="button" className="flex items-center hover:text-red-600" onClick={() => handleLikeDislike(r.Id, 'dislike')}>
                          <ThumbsDown size={18} className="mr-1" />
                          ({r.Dislikes || 0})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default BookDetails;