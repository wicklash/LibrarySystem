import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import UserLayout from '../../components/Layout/UserLayout';
import { getUserById, updateUser } from '../../services/userService';
import {
  User as UserIcon,
  Mail,
  Shield,
  Calendar,
  BookOpen,
  Key,
  Edit2,
  Check,
  X
} from 'lucide-react';

const iconClass = "w-5 h-5 text-indigo-400 mr-2";
const labelClass = "text-slate-500 font-medium";
const valueClass = "text-slate-800 font-semibold";

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [editField, setEditField] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.id) {
      getUserById(parseInt(user.id))
        .then(setUserInfo)
        .catch(() => setUserInfo(null));
    }
  }, [user]);

  const handleSave = async (field: string) => {
    if (!userInfo) return;
    const updateData: any = {};
    if (field === 'username') updateData.username = form.username;
    if (field === 'email') updateData.email = form.email;
    if (field === 'password') updateData.password = form.password;

    try {
      const updated = await updateUser(userInfo.id, updateData);
      setUserInfo(updated);
      setEditField(null);
      // Şifre güncellendiyse inputu temizle
      if (field === 'password') setForm({ ...form, password: '' });
    } catch (err) {
      alert('Güncelleme başarısız!');
    }
  };

  const handleCancel = (field: string) => {
    setForm({
      ...form,
      [field]: userInfo ? userInfo[field as keyof typeof userInfo] || '' : ''
    });
    if (field === 'password') setForm(f => ({ ...f, password: '' }));
    setEditField(null);
  };

  if (!userInfo) return <div>Yükleniyor...</div>;

  // Baş harf
  const initials = userInfo.username
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  // Tarih formatı
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return (
    <UserLayout title="Profile">
      {success && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-semibold text-lg animate-fade-in">
            Profil başarıyla güncellendi!
          </div>
        </div>
      )}
      <div className="bg-slate-100 min-h-screen py-8 px-2">
        {/* Üst Kart */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6 bg-white rounded-xl shadow p-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow">
              {initials}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-slate-900">{userInfo.username}</h1>
              <p className="text-slate-500">{userInfo.email}</p>
              <div className="mt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1)}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  Member since {userInfo.createdAt ? formatDate(userInfo.createdAt).split(',')[0] : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Kart */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow p-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-8">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {/* Sol Sütun */}
              <div className="flex items-center">
                <BookOpen className={iconClass} />
                <span className={labelClass + " mr-2"}>User ID</span>
                <span className={valueClass}>{userInfo.id}</span>
              </div>
              <div className="flex items-center">
                <UserIcon className={iconClass} />
                <span className={labelClass + " mr-2"}>Username</span>
                {editField === 'username' ? (
                  <>
                    <input
                      className="border rounded px-2 py-1 mr-2"
                      value={form.username}
                      onChange={e => setForm({ ...form, username: e.target.value })}
                    />
                    <button onClick={() => handleSave('username')} className="text-emerald-500 mr-1"><Check size={18} /></button>
                    <button onClick={() => handleCancel('username')} className="text-slate-400"><X size={18} /></button>
                  </>
                ) : (
                  <>
                    <span className={valueClass}>{form.username}</span>
                    <Edit2 className="w-4 h-4 text-indigo-300 ml-2 cursor-pointer" onClick={() => setEditField('username')} />
                  </>
                )}
              </div>
              <div className="flex items-center">
                <Mail className={iconClass} />
                <span className={labelClass + " mr-2"}>Email</span>
                {editField === 'email' ? (
                  <>
                    <input
                      className="border rounded px-2 py-1 mr-2"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                    <button onClick={() => handleSave('email')} className="text-emerald-500 mr-1"><Check size={18} /></button>
                    <button onClick={() => handleCancel('email')} className="text-slate-400"><X size={18} /></button>
                  </>
                ) : (
                  <>
                    <span className={valueClass}>{form.email}</span>
                    <Edit2 className="w-4 h-4 text-indigo-300 ml-2 cursor-pointer" onClick={() => setEditField('email')} />
                  </>
                )}
              </div>
              <div className="flex items-center">
                <Key className={iconClass} />
                <span className={labelClass + " mr-2"}>Password</span>
                {editField === 'password' ? (
                  <>
                    <input
                      className="border rounded px-2 py-1 mr-2"
                      type="password"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="New password"
                    />
                    <button onClick={() => handleSave('password')} className="text-emerald-500 mr-1"><Check size={18} /></button>
                    <button onClick={() => handleCancel('password')} className="text-slate-400"><X size={18} /></button>
                  </>
                ) : (
                  <>
                    <span className={valueClass}>••••••••</span>
                    <Edit2 className="w-4 h-4 text-indigo-300 ml-2 cursor-pointer" onClick={() => setEditField('password')} />
                  </>
                )}
              </div>
              <div className="flex items-center">
                <Shield className={iconClass} />
                <span className={labelClass + " mr-2"}>Role</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1)}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className={iconClass} />
                <span className={labelClass + " mr-2"}>Account Created</span>
                <span className={valueClass}>
                  {userInfo.createdAt ? formatDate(userInfo.createdAt) : '-'}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-8">
              <p className="text-sm text-slate-400">
                Last updated: {new Date().toLocaleDateString('en-GB')}
              </p>
              <button
                type="button"
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                disabled={loading}
                onClick={async () => {
                  if (userInfo?.id) {
                    setLoading(true);
                    setSuccess(false);
                    const updated = await getUserById(userInfo.id);
                    setUserInfo(updated);
                    setEditField(null);
                    setForm({
                      username: updated.username,
                      email: updated.email,
                      password: ''
                    });
                    setLoading(false);
                    setSuccess(true);
                    setTimeout(() => setSuccess(false), 2000); // 2 saniye sonra başarı mesajını gizle
                  }
                }}
              >
                {loading ? (
                  <span className="animate-spin mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                ) : null}
                Update Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserProfile;
