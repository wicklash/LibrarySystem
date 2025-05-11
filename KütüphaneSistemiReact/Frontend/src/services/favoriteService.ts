import axios from 'axios';
import { Book } from '../types';

const API_URL = 'http://localhost:8000';

export const getFavorites = async (userId: number): Promise<Book[]> => {
    const response = await axios.get(`${API_URL}/favorites/user/${userId}`);
    return response.data;
};

export const addToFavorites = async (userId: number, bookId: number): Promise<void> => {
    await axios.post(`${API_URL}/favorites/`, {
        user_id: userId,
        book_id: bookId
    });
};

export const removeFromFavorites = async (userId: number, bookId: number): Promise<void> => {
    await axios.delete(`${API_URL}/favorites/${userId}/${bookId}`);
};

export const checkFavorite = async (userId: number, bookId: number): Promise<boolean> => {
    const response = await axios.get(`${API_URL}/favorites/check/${userId}/${bookId}`);
    return response.data.is_favorite;
};