import { Message } from '../types';
import { messages } from '../data/mockData';

// Get messages for a user
export const getUserMessages = (userId: string): Promise<Message[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userMessages = messages.filter(
        message => message.receiverId === userId || message.senderId === userId
      );
      resolve(userMessages);
    }, 500);
  });
};

// Send a message
export const sendMessage = (
  senderId: string,
  receiverId: string,
  content: string
): Promise<Message> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newMessage: Message = {
        id: (messages.length + 1).toString(),
        senderId,
        receiverId,
        content,
        read: false,
        createdAt: new Date().toISOString(),
      };
      
      messages.push(newMessage);
      resolve(newMessage);
    }, 500);
  });
};

// Mark message as read
export const markMessageAsRead = (messageId: string): Promise<Message | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = messages.findIndex(message => message.id === messageId);
      
      if (index !== -1) {
        const updatedMessage = { ...messages[index], read: true };
        messages[index] = updatedMessage;
        resolve(updatedMessage);
      } else {
        resolve(undefined);
      }
    }, 300);
  });
};

// Get unread message count
export const getUnreadMessageCount = (userId: string): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const count = messages.filter(
        message => message.receiverId === userId && !message.read
      ).length;
      resolve(count);
    }, 300);
  });
};