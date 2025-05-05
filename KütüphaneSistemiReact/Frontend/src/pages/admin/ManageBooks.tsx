import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/Layout/AdminLayout';
import { Card, CardHeader, CardBody } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { PlusCircle, Search, Edit, Trash2, Save, X, AlertCircle } from 'lucide-react';
import { getAllBooks, deleteBook, updateBook, addBook } from '../../services/bookService';
import { Book } from '../../types';

const ManageBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // Form state for adding a new book
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    description: '',
    coverImage: '',
    isbn: '',
    publishYear: new Date().getFullYear(),
    category: '',
    totalCopies: 1,
    availableCopies: 1,
  });
  
  // Form errors
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Temporary state for editing books
  const [editedBooks, setEditedBooks] = useState<{[key: string]: Partial<Book>}>({});

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

  // Filter books based on search query
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = books.filter(
        book =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.isbn.toLowerCase().includes(query) ||
          book.category.toLowerCase().includes(query)
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks(books);
    }
  }, [searchQuery, books]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleAddNewBook = async () => {
    // Validate form
    const errors: {[key: string]: string} = {};
    
    if (!newBook.title) errors.title = 'Title is required';
    if (!newBook.author) errors.author = 'Author is required';
    if (!newBook.description) errors.description = 'Description is required';
    if (!newBook.isbn) errors.isbn = 'ISBN is required';
    if (!newBook.category) errors.category = 'Category is required';
    if (!newBook.coverImage) errors.coverImage = 'Cover image URL is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    try {
      const addedBook = await addBook({
        ...newBook,
        available: true,
      });
      
      setBooks([...books, addedBook]);
      // Reset form
      setNewBook({
        title: '',
        author: '',
        description: '',
        coverImage: '',
        isbn: '',
        publishYear: new Date().getFullYear(),
        category: '',
        totalCopies: 1,
        availableCopies: 1,
      });
      setFormErrors({});
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const handleEditBook = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      setEditingBook(bookId);
      setEditedBooks({
        ...editedBooks,
        [bookId]: { ...book },
      });
    }
  };

  const handleCancelEdit = (bookId: string) => {
    setEditingBook(null);
    const updatedEditedBooks = { ...editedBooks };
    delete updatedEditedBooks[bookId];
    setEditedBooks(updatedEditedBooks);
  };

  const handleSaveEdit = async (bookId: string) => {
    const book = editedBooks[bookId];
    
    try {
      const updatedBook = await updateBook(bookId, book);
      if (updatedBook) {
        setBooks(books.map(b => (b.id === bookId ? updatedBook : b)));
        handleCancelEdit(bookId);
      }
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      const success = await deleteBook(bookId);
      if (success) {
        setBooks(books.filter(book => book.id !== bookId));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    const { value } = e.target;
    setNewBook({
      ...newBook,
      [field]: field === 'publishYear' || field === 'totalCopies' || field === 'availableCopies'
        ? parseInt(value, 10)
        : value,
    });
    
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: '',
      });
    }
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    bookId: string,
    field: string
  ) => {
    const { value } = e.target;
    setEditedBooks({
      ...editedBooks,
      [bookId]: {
        ...editedBooks[bookId],
        [field]: field === 'publishYear' || field === 'totalCopies' || field === 'availableCopies'
          ? parseInt(value, 10)
          : value,
      },
    });
  };

  return (
    <AdminLayout title="Manage Books">
      <div className="animate-fade-in">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="md:flex-1">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search books by title, author, ISBN, or category..."
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
          
          <div>
            <Button onClick={() => setShowAddForm(!showAddForm)}>
              <PlusCircle size={20} className="mr-2" />
              Add New Book
            </Button>
          </div>
        </div>

        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <h3 className="text-lg font-semibold">Add New Book</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Input
                    label="Title"
                    value={newBook.title}
                    onChange={(e) => handleInputChange(e, 'title')}
                    error={formErrors.title}
                    fullWidth
                  />
                  
                  <Input
                    label="Author"
                    value={newBook.author}
                    onChange={(e) => handleInputChange(e, 'author')}
                    error={formErrors.author}
                    fullWidth
                  />
                  
                  <div>
                    <label htmlFor="book-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="book-description"
                      placeholder="Enter a brief description of the book"
                      value={newBook.description}
                      onChange={(e) => handleInputChange(e, 'description')}
                      rows={4}
                      className={`shadow-sm rounded-md border px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        formErrors.description
                          ? 'border-red-300 text-red-900 placeholder-red-300'
                          : 'border-gray-300 placeholder-gray-400'
                      }`}
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                    )}
                  </div>
                  
                  <Input
                    label="Cover Image URL"
                    value={newBook.coverImage}
                    onChange={(e) => handleInputChange(e, 'coverImage')}
                    error={formErrors.coverImage}
                    placeholder="https://example.com/book-cover.jpg"
                    fullWidth
                  />
                </div>
                
                <div className="space-y-4">
                  <Input
                    label="ISBN"
                    value={newBook.isbn}
                    onChange={(e) => handleInputChange(e, 'isbn')}
                    error={formErrors.isbn}
                    fullWidth
                  />
                  
                  <Input
                    label="Publish Year"
                    type="number"
                    value={newBook.publishYear.toString()}
                    onChange={(e) => handleInputChange(e, 'publishYear')}
                    fullWidth
                  />
                  
                  <Input
                    label="Category"
                    value={newBook.category}
                    onChange={(e) => handleInputChange(e, 'category')}
                    error={formErrors.category}
                    fullWidth
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Total Copies"
                      type="number"
                      min="1"
                      value={newBook.totalCopies.toString()}
                      onChange={(e) => handleInputChange(e, 'totalCopies')}
                      fullWidth
                    />
                    
                    <Input
                      label="Available Copies"
                      type="number"
                      min="0"
                      max={newBook.totalCopies.toString()}
                      value={newBook.availableCopies.toString()}
                      onChange={(e) => handleInputChange(e, 'availableCopies')}
                      fullWidth
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddNewBook}>
                  Add Book
                </Button>
              </div>
            </CardBody>
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredBooks.length > 0 ? (
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
                        ISBN / Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Year
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Copies
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
                    {filteredBooks.map((book) => (
                      <tr key={book.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img
                                className="h-10 w-10 rounded-md object-cover"
                                src={editingBook === book.id ? editedBooks[book.id].coverImage : book.coverImage}
                                alt={book.title}
                              />
                            </div>
                            <div className="ml-4">
                              {editingBook === book.id ? (
                                <Input
                                  value={editedBooks[book.id].title as string}
                                  onChange={(e) => handleEditChange(e, book.id, 'title')}
                                  className="w-full"
                                />
                              ) : (
                                <div className="text-sm font-medium text-gray-900">{book.title}</div>
                              )}
                              
                              {editingBook === book.id ? (
                                <Input
                                  value={editedBooks[book.id].author as string}
                                  onChange={(e) => handleEditChange(e, book.id, 'author')}
                                  className="w-full mt-1"
                                />
                              ) : (
                                <div className="text-sm text-gray-500">{book.author}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingBook === book.id ? (
                            <div className="space-y-2">
                              <Input
                                value={editedBooks[book.id].isbn as string}
                                onChange={(e) => handleEditChange(e, book.id, 'isbn')}
                                className="w-full"
                              />
                              <Input
                                value={editedBooks[book.id].category as string}
                                onChange={(e) => handleEditChange(e, book.id, 'category')}
                                className="w-full"
                              />
                            </div>
                          ) : (
                            <>
                              <div className="text-sm text-gray-900">{book.isbn}</div>
                              <div className="text-sm text-gray-500">{book.category}</div>
                            </>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingBook === book.id ? (
                            <Input
                              type="number"
                              value={editedBooks[book.id].publishYear?.toString() as string}
                              onChange={(e) => handleEditChange(e, book.id, 'publishYear')}
                              className="w-20"
                            />
                          ) : (
                            <div className="text-sm text-gray-900">{book.publishYear}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {editingBook === book.id ? (
                            <div className="flex space-x-2">
                              <Input
                                type="number"
                                min="1"
                                value={editedBooks[book.id].totalCopies?.toString() as string}
                                onChange={(e) => handleEditChange(e, book.id, 'totalCopies')}
                                className="w-16"
                              />
                              <span className="text-gray-500 self-center">/</span>
                              <Input
                                type="number"
                                min="0"
                                max={editedBooks[book.id].totalCopies?.toString() as string}
                                value={editedBooks[book.id].availableCopies?.toString() as string}
                                onChange={(e) => handleEditChange(e, book.id, 'availableCopies')}
                                className="w-16"
                              />
                            </div>
                          ) : (
                            <div className="text-sm text-gray-900">
                              {book.availableCopies} / {book.totalCopies}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {book.available ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Available
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Not Available
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingBook === book.id ? (
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="accent"
                                onClick={() => handleSaveEdit(book.id)}
                              >
                                <Save size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCancelEdit(book.id)}
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          ) : deleteConfirm === book.id ? (
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDeleteBook(book.id)}
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDeleteConfirm(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <div className="flex justify-end space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditBook(book.id)}
                              >
                                <Edit size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDeleteConfirm(book.id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Card className="text-center py-12">
            <CardBody>
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No books found</h3>
              <p className="mt-1 text-gray-500">
                {searchQuery
                  ? "No books match your search criteria. Try adjusting your search."
                  : "There are no books in the library. Add a new book to get started."}
              </p>
              <div className="mt-6">
                <Button onClick={() => setShowAddForm(true)}>
                  <PlusCircle size={20} className="mr-2" />
                  Add New Book
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageBooks;