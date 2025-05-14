import { Message } from '../types';

// Kullanıcının mesajlarını getir
export const getUserMessages = async (userId: string): Promise<Message[]> => {
  const response = await fetch(`http://localhost:8000/messages/user/${userId}`);
  if (!response.ok) throw new Error('Mesajlar alınamadı');
  return await response.json();
};

// Mesaj gönder
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string
): Promise<Message> => {
  const response = await fetch('http://localhost:8000/messages/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ senderId: Number(senderId), receiverId: Number(receiverId), content }),
  });
  if (!response.ok) throw new Error('Mesaj gönderilemedi');
  return await response.json();
};

// Mesajı okundu olarak işaretle
export const markMessageAsRead = async (messageId: string): Promise<Message | undefined> => {
  const response = await fetch(`http://localhost:8000/messages/read/${messageId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Mesaj okundu olarak işaretlenemedi');
  return await response.json();
};

// Okunmamış mesaj sayısı
export const getUnreadMessageCount = async (userId: string): Promise<number> => {
  const response = await fetch(`http://localhost:8000/messages/unread/${userId}`);
  if (!response.ok) throw new Error('Okunmamış mesaj sayısı alınamadı');
  const data = await response.json();
  return data.unreadCount;
};

// Kullanıcının okunmamış mesaj sayısını getir (yeni endpoint)
export const getUnreadMessageCountV2 = async (userId: string | number): Promise<number> => {
  const response = await fetch(`http://localhost:8000/messages/unread/count/${userId}`);
  if (!response.ok) throw new Error('Okunmamış mesaj sayısı alınamadı');
  const data = await response.json();
  return data.unreadCount;
};