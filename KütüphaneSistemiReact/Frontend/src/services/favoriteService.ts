import { Book } from '../types';

const API_URL = 'http://localhost:8000';

export const getFavorites = async (userId: number): Promise<Book[]> => {
    const response = await fetch(`${API_URL}/favorites/user/${userId}`);
    if (!response.ok) throw new Error('Favoriler alınamadı');
    return await response.json() as Book[];
};

export const addToFavorites = async (userId: number, bookId: number): Promise<void> => {
    const response = await fetch(`${API_URL}/favorites/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, book_id: bookId })
    });
    if (!response.ok) throw new Error('Favorilere eklenemedi');
};

export const removeFromFavorites = async (userId: number, bookId: number): Promise<void> => {
    const response = await fetch(`${API_URL}/favorites/${userId}/${bookId}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Favorilerden silinemedi');
};

export const checkFavorite = async (userId: number, bookId: number): Promise<boolean> => {
    const response = await fetch(`${API_URL}/favorites/check/${userId}/${bookId}`);
    if (!response.ok) throw new Error('Favori kontrolü başarısız');
    const data = await response.json() as { is_favorite: boolean };
    return data.is_favorite;
};