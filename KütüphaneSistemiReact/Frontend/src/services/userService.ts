import { User } from '../types';

export const getAllUsers = async (): Promise<User[]> => {
  const response = await fetch('http://localhost:8000/users');
  if (!response.ok) throw new Error('Kullanıcılar alınamadı');
  return await response.json();
}; 