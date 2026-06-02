import {UserWire} from '@gustav/types';
import {useState, useEffect} from 'react';
import toast from 'react-hot-toast';

import {userSdk} from '../sdk';

export function AdminUsers() {
  const [users, setUsers] = useState<UserWire[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    isSuperAdmin: false,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userSdk.listUsers();
      setUsers(data);
    } catch {
      // Error handled by SDK
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await userSdk.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleResetPassword = async (id: number) => {
    try {
      await userSdk.resetPassword(id);
      toast.success('Password reset email sent');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset password');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userSdk.createUser(newUser);
      setShowCreateModal(false);
      setNewUser({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        isSuperAdmin: false,
      });
      fetchUsers();
      toast.success('User created');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  if (loading && users.length === 0)
    return (
      <div className="text-gray-500 animate-pulse font-bold">
        Loading users...
      </div>
    );

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            User Management
          </h2>
          <p className="text-sm text-gray-400 font-medium">
            Create, manage and audit platform users
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-zinc-900 dark:bg-white dark:text-zinc-900 text-white text-sm font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-zinc-950/20 active:scale-95"
        >
          Create User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-zinc-800/20">
              <th className="py-4 px-8 font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                Identity
              </th>
              <th className="py-4 px-8 font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                Status
              </th>
              <th className="py-4 px-8 font-bold text-gray-400 uppercase tracking-wider text-[10px] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-zinc-800/50">
            {users.map(user => (
              <tr
                key={user.id}
                className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/10 transition-colors"
              >
                <td className="py-5 px-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center font-black text-gray-400 dark:text-zinc-500 uppercase">
                      {user.username.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-400 font-medium">
                        @{user.username} • {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-5 px-8">
                  {user.isSuperAdmin ? (
                    <span className="inline-flex items-center bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase px-2 py-1 rounded-md border border-amber-500/20">
                      Super Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase px-2 py-1 rounded-md border border-indigo-500/20">
                      User
                    </span>
                  )}
                </td>
                <td className="py-5 px-8 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      className="p-2 text-indigo-500 hover:bg-indigo-500/10 rounded-lg transition-all group"
                      title="Reset Password"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                      title="Delete User"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black mb-1 dark:text-white tracking-tight">
              Create New User
            </h3>
            <p className="text-sm text-gray-400 font-medium mb-6">
              Initialize a new platform identity
            </p>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.firstName}
                    onChange={e =>
                      setNewUser({...newUser, firstName: e.target.value})
                    }
                    className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newUser.lastName}
                    onChange={e =>
                      setNewUser({...newUser, lastName: e.target.value})
                    }
                    className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={newUser.username}
                  onChange={e =>
                    setNewUser({...newUser, username: e.target.value})
                  }
                  className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={e =>
                    setNewUser({...newUser, email: e.target.value})
                  }
                  className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none dark:text-white transition-all"
                />
              </div>
              <div className="flex items-center space-x-3 py-2">
                <input
                  type="checkbox"
                  id="isSuperAdmin"
                  checked={newUser.isSuperAdmin}
                  onChange={e =>
                    setNewUser({...newUser, isSuperAdmin: e.target.checked})
                  }
                  className="w-5 h-5 rounded-lg border-gray-200 dark:border-zinc-700 text-indigo-500 focus:ring-indigo-500/20 transition-all cursor-pointer"
                />
                <label
                  htmlFor="isSuperAdmin"
                  className="text-sm font-bold text-gray-600 dark:text-zinc-400 cursor-pointer"
                >
                  Grant Super Admin privileges
                </label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 font-bold py-3 rounded-xl transition-all hover:bg-gray-200 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95"
                >
                  Create Identity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
