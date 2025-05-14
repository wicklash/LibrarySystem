import { User } from '../types';

export const getAllUsers = async (): Promise<User[]> => {
  const response = await fetch('http://localhost:8000/users');
  if (!response.ok) throw new Error('Kullanıcılar alınamadı');
  return await response.json();
}; 

export const getUserById = async (userId: number) => {
  const response = await fetch(`http://localhost:8000/users/${userId}`);
  if (!response.ok) throw new Error('Kullanıcı bilgisi alınamadı');
  return await response.json();
};

export const updateUser = async (userId: number, data: { username?: string; email?: string; password?: string }) => {
  const response = await fetch(`http://localhost:8000/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Kullanıcı güncellenemedi');
  return await response.json();
};

// Kullanıcının aktif ödünç kitap sayısını getir
export const getActiveBorrowCount = async (userId: number): Promise<number> => {
  const response = await fetch(`http://localhost:8000/borrowed/user/${userId}`);
  if (!response.ok) throw new Error('Aktif ödünç kitaplar alınamadı');
  const data = await response.json();
  return data.length;
};