import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserLayout from '../../components/Layout/UserLayout';
import { Card, CardBody } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { Book, Search, Filter } from 'lucide-react';
import { getAllBooks } from '../../services/bookService';
import { Book as BookType } from '../../types';

const BrowseBooks: React.FC = () => {
  const [books, setBooks] = useState<BookType[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<BookType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const data = await getAllBooks();
        setBooks(data);
        setFilteredBooks(data);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Extract unique categories
  const categories = ['All', ...new Set(books.map(book => book.category))];

  // Filter books based on search query and category
  useEffect(() => {
    let result = books;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        book =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.description.toLowerCase().includes(query)
      );
    }
    
    // Filter by category
    if (selectedCategory && selectedCategory !== 'All') {
      result = result.filter(book => book.category === selectedCategory);
    }
    
    setFilteredBooks(result);
  }, [searchQuery, selectedCategory, books]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === 'All' ? '' : category);
  };

  return (
    <UserLayout title="Browse Books">
      <div className="animate-fade-in">
        <div className="mb-8">
          <p className="text-gray-600">
            Explore our collection of books and find your next great read.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search by title, author, or keyword..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10 w-full"
                  fullWidth
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <Filter size={18} className="text-gray-500 mr-2" />
                <span className="text-sm text-gray-500 mr-2">Filter by:</span>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        (category === 'All' && !selectedCategory) || selectedCategory === category
                          ? 'bg-primary-100 text-primary-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.map((book) => (
              <Card
                key={book.id}
                className="h-full transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="aspect-[2/3] w-full relative overflow-hidden rounded-t-lg">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 right-0 p-2">
                    {book.availableCopies > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Not Available
                      </span>
                    )}
                  </div>
                </div>
                <CardBody>
                  <div className="mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-primary-50 text-primary-700 rounded">
                      {book.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1 line-clamp-1">{book.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">{book.description}</p>
                  <div className="mt-auto">
                    <Link to={`/user/book/${book.id}`}>
                      <Button fullWidth>
                        <Book size={16} className="mr-2" />
                        View Details
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
              <Book className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No books found</h3>
              <p className="mt-1 text-gray-500">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <div className="mt-6">
                <Button onClick={() => { setSearchQuery(''); setSelectedCategory(''); }}>
                  Clear Filters
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </UserLayout>
  );
};

export default BrowseBooks;