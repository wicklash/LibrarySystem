import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import UserLayout from '../../components/Layout/UserLayout';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserMessages, sendMessage, markMessageAsRead } from '../../services/messageService';
import { Message } from '../../types';
import { getAllUsers } from '../../services/userService';

const UserMessages: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const fetchAdminAndMessages = async () => {
      if (user) {
        try {
          // Admin kullanıcıyı backend'den çek
          const users = await getAllUsers();
          const admin = users.find(u => u.role === 'admin');
          setAdminUser(admin);
          const data = await getUserMessages(user.id);
          
          // Mark messages as read
          const updatedMessages = await Promise.all(
            data.map(async (message) => {
              if (message.receiverId === user.id && !message.read) {
                await markMessageAsRead(message.id);
                return { ...message, read: true };
              }
              return message;
            })
          );
          
          setMessages(updatedMessages);
        } catch (error) {
          console.error('Error fetching admin or messages:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAdminAndMessages();
  }, [user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !adminUser || !newMessage.trim()) {
      return;
    }
    
    setSendingMessage(true);
    
    try {
      const sentMessage = await sendMessage(user.id, adminUser.id, newMessage);
      setMessages([...messages, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <UserLayout title="Messages">
      <div className="animate-fade-in">
        <div className="mb-8">
          <p className="text-gray-600">
            Contact the library administrator for any questions, requests, or issues.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <h3 className="text-lg font-semibold">Contact Information</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Library Administrator</h4>
                    <p className="text-sm text-gray-600">{adminUser?.username}</p>
                    <p className="text-sm text-gray-600">{adminUser?.email}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Support Hours</h4>
                    <p className="text-sm text-gray-600">Monday - Friday: 9am - 5pm</p>
                    <p className="text-sm text-gray-600">Saturday: 10am - 2pm</p>
                    <p className="text-sm text-gray-600">Sunday: Closed</p>
                  </div>
                  
                  <div className="bg-primary-50 rounded-lg p-4 border border-primary-100">
                    <h4 className="font-medium text-primary-800 mb-1">Response Time</h4>
                    <p className="text-sm text-primary-700">
                      All messages are typically answered within 24 hours during business days.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
          
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <h3 className="text-lg font-semibold">Message History</h3>
              </CardHeader>
              
              <CardBody className="flex-1 overflow-y-auto max-h-[400px]">
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isUserMessage = message.senderId === user?.id;
                      
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isUserMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`rounded-lg px-4 py-2 max-w-[80%] ${
                              isUserMessage
                                ? 'bg-primary-100 text-primary-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <div className="text-sm">{message.content}</div>
                            <div className="flex items-center mt-1 text-xs text-gray-500 justify-end">
                              {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                              {isUserMessage && message.read && (
                                <CheckCircle size={12} className="ml-1 text-green-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No messages yet</h3>
                    <p className="mt-1 text-gray-500">
                      Start a conversation with the library administrator.
                    </p>
                  </div>
                )}
              </CardBody>
              
              <CardFooter className="border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex space-x-2 w-full">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                    fullWidth
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || sendingMessage}
                  >
                    {sendingMessage ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <Send size={20} />
                    )}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserMessages;