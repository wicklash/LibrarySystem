import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import AdminLayout from '../../components/Layout/AdminLayout';
import { Card } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { MessageSquare, Send, User, ArrowLeft, Search } from 'lucide-react';
import { getUserMessages, sendMessage, markMessageAsRead } from '../../services/messageService';
import { getAllUsers } from '../../services/userService';
import { Message, User as UserType } from '../../types';

const AdminMessages: React.FC = () => {
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  
  // Get admin user (for sending messages)
  const adminUser = users.find(u => u.role === 'admin');

  useEffect(() => {
    const fetchUsersAndMessages = async () => {
      setIsLoading(true);
      try {
        const userList = await getAllUsers();
        setUsers(userList);

        const admin = userList.find(u => u.role === 'admin');
        if (!admin) {
          setIsLoading(false);
          return;
        }

        const data = await getUserMessages(admin.id);

        // Mesajları okundu olarak işaretle
        const updatedMessages = await Promise.all(
          data.map(async (message) => {
            if (message.receiverId === admin.id && !message.read) {
              await markMessageAsRead(message.id);
              return { ...message, read: true };
            }
            return message;
          })
        );
        setAllMessages(updatedMessages);
      } catch (error) {
        console.error('Error fetching users or messages:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsersAndMessages();
  }, []);

  const getUserById = (userId: string): UserType | undefined => {
    return users.find(user => user.id === userId);
  };

  // Filter chats based on search query
  const filteredChats = users
    .filter(user => user.role !== 'admin')
    .filter(user => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    });

  // Get messages for the current chat
  const getCurrentChatMessages = (): Message[] => {
    if (!currentChat || !adminUser) return [];
    
    return allMessages.filter(
      message =>
        (message.senderId === adminUser.id && message.receiverId === currentChat) ||
        (message.receiverId === adminUser.id && message.senderId === currentChat)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  // Get unread message count for a chat
  const getUnreadCount = (userId: string): number => {
    if (!adminUser) return 0;
    
    return allMessages.filter(
      message => message.senderId === userId && message.receiverId === adminUser.id && !message.read
    ).length;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminUser || !currentChat || !newMessage.trim()) {
      return;
    }
    
    setSendingMessage(true);
    
    try {
      const sentMessage = await sendMessage(adminUser.id, currentChat, newMessage);
      setAllMessages([...allMessages, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleChatSelect = async (userId: string) => {
    if (!adminUser) return;
    
    setCurrentChat(userId);
    
    // Mark messages as read when chat is opened
    const updatedMessages = await Promise.all(
      allMessages.map(async (message) => {
        if (
          message.senderId === userId &&
          message.receiverId === adminUser.id &&
          !message.read
        ) {
          await markMessageAsRead(message.id);
          return { ...message, read: true };
        }
        return message;
      })
    );
    
    setAllMessages(updatedMessages);
  };

  return (
    <AdminLayout title="Messages">
      <div className="animate-fade-in">
        <div className="mb-8">
          <p className="text-gray-600">
            Communicate with library users, answer their questions, and address their concerns.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 h-[calc(100vh-260px)] min-h-[500px] gap-6">
          {/* Users list */}
          <Card className={`${currentChat ? 'hidden lg:flex' : 'flex'} flex-col h-full`}>
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                  fullWidth
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                </div>
              ) : filteredChats.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {filteredChats.map(user => {
                    const unreadCount = getUnreadCount(user.id);
                    return (
                      <button
                        key={user.id}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 focus:outline-none ${
                          currentChat === user.id ? 'bg-primary-50' : ''
                        }`}
                        onClick={() => handleChatSelect(user.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.username}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                          {unreadCount > 0 && (
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white text-xs font-medium">
                                {unreadCount}
                              </span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery
                      ? "No users match your search criteria."
                      : "There are no conversations yet."}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Chat area */}
          <Card className={`${!currentChat ? 'hidden lg:flex' : 'flex'} flex-col h-full lg:col-span-2`}>
            {currentChat ? (
              <>
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <button
                      className="lg:hidden p-1 mr-2 rounded-full hover:bg-gray-100"
                      onClick={() => setCurrentChat(null)}
                      aria-label="Back to user list"
                      title="Back to user list"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                      {getUserById(currentChat)?.username.charAt(0).toUpperCase()}
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {getUserById(currentChat)?.username}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {getUserById(currentChat)?.email}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {getCurrentChatMessages().map((message) => {
                    const isAdminMessage = adminUser && message.senderId === adminUser.id;
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isAdminMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`rounded-lg px-4 py-2 max-w-[80%] ${
                            isAdminMessage
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="text-sm">{message.content}</div>
                          <div className="mt-1 text-xs text-right opacity-75">
                            {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
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
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No conversation selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a user from the list to view and respond to their messages.
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;