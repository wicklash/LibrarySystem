import React, { useEffect, useState } from 'react';
import UserLayout from '../../components/Layout/UserLayout';
import { Card, CardBody } from '../../components/UI/Card';
import { Link } from 'react-router-dom';
import { getFavorites } from '../../services/favoriteService';
import { useAuth } from '../../context/AuthContext';
import { Book } from '../../types';

const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        try {
          const data = await getFavorites(Number(user.id));
          setFavorites(data);
        } catch (error) {
          console.error('Error fetching favorites:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchFavorites();
  }, [user]);

  if (isLoading) {
    return (
      <UserLayout title="Favorites">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Favorites">
      <div className="animate-fade-in">
        <h2 className="text-2xl font-semibold mb-4">Favori Kitaplarınız</h2>
        {favorites.length === 0 ? (
          <p className="text-gray-600">Henüz favori kitap eklemediniz.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((book) => (
              <Card key={book.id} className="h-full transform transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                <Link to={`/user/book/${book.id}`}>
                  <div className="aspect-[2/3] w-full relative overflow-hidden rounded-t-lg">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardBody>
                    <h3 className="text-lg font-semibold mb-1 line-clamp-1">{book.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{book.author}</p>
                  </CardBody>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default Favorites; 