import { Book } from '../types';

const API_URL = 'http://localhost:8000';

export const getFavorites = async (userId: number): Promise<Book[]> => {
    const response = await fetch(`${API_URL}/favorites/user/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch favorites');
    return await response.json();
};

export const addToFavorites = async (userId: number, bookId: number): Promise<void> => {
    const response = await fetch(`${API_URL}/favorites/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id: userId,
            book_id: bookId
        }),
    });
    if (!response.ok) throw new Error('Failed to add to favorites');
};

export const removeFromFavorites = async (userId: number, bookId: number): Promise<void> => {
    const response = await fetch(`${API_URL}/favorites/${userId}/${bookId}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove from favorites');
};

interface CheckFavoriteResponse {
    is_favorite: boolean;
}

export const checkFavorite = async (userId: number, bookId: number): Promise<boolean> => {
    const response = await fetch(`${API_URL}/favorites/check/${userId}/${bookId}`);
    if (!response.ok) throw new Error('Failed to check favorite');
    const data: CheckFavoriteResponse = await response.json();
    return data.is_favorite;
};