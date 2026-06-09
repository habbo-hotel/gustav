import toast from 'react-hot-toast';
import {UserWire} from '@gustav/types';
import {useState, useEffect} from 'react';
import {userSdk} from '../sdk';
import {Card, CardBody} from '../ui/Card';
import {Button} from '../ui/Button';
import {Badge} from '../ui/Badge';
import {Modal} from '../ui/Modal';
import {Input} from '../ui/Input';

export function AdminUsers() {
  const [users, setUsers] = useState<UserWire[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({username: '', email: '', firstName: '', lastName: '', isSuperAdmin: false});

  useEffect(() => { document.title = 'Gustav - Users'; fetchUsers(); }, []);

  const fetchUsers = async () => { try { setLoading(true); const data = await userSdk.listUsers(); setUsers(data); } catch {} finally { setLoading(false); } };

  const handleDeleteUser = async (id: number) => { try { await userSdk.deleteUser(id); setUsers(users.filter(u => u.id !== id)); toast.success('User deleted'); } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to delete user'); } };
  const handleResetPassword = async (id: number) => { try { await userSdk.resetPassword(id); toast.success('Password reset email sent'); } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to reset password'); } };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userSdk.createUser(newUser);
      setShowCreateModal(false);
      setNewUser({username: '', email: '', firstName: '', lastName: '', isSuperAdmin: false});
      fetchUsers();
      toast.success('User created');
    } catch (err) { toast.error(err instanceof Error ? err.message : 'Failed to create user'); }
  };

  if (loading && users.length === 0) return <div className="flex items-center gap-3 text-text-secondary font-bold text-sm p-8"><div className="w-5 h-5 border-2 border-layer-primary border-t-transparent rounded-full animate-spin" />Loading users...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="layer-title text-2xl text-text dark:text-white">Users</h1>
          <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mt-1">Create, manage and audit platform users</p>
        </div>
        <Button icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>} onClick={() => setShowCreateModal(true)}>Create User</Button>
      </div>
      <div className="space-y-3">
        {users.length === 0 ? <Card><CardBody><p className="text-center text-text-secondary font-bold py-8">No users found</p></CardBody></Card>
        : users.map(user => (
          <Card key={user.id} hover>
            <CardBody className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-layer-primary-light text-layer-primary rounded-xl flex items-center justify-center font-black text-sm shrink-0">{user.username.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="font-bold text-text dark:text-white">{user.firstName} {user.lastName}</div>
                  <div className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary mt-0.5">@{user.username} &middot; {user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {user.isSuperAdmin ? <Badge variant="admin">Administrator</Badge> : <Badge variant="user">User</Badge>}
                <Button variant="secondary" size="sm" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>} onClick={() => handleResetPassword(user.id)}>Reset</Button>
                <Button variant="danger" size="sm" icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>} onClick={() => handleDeleteUser(user.id)}>Delete</Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create User" subtitle="Initialize a new platform identity" size="sm"
        footer={<><Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button><Button type="submit" form="create-user-form">Create Identity</Button></>}
      >
        <form id="create-user-form" onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" required value={newUser.firstName} onChange={e => setNewUser({...newUser, firstName: e.target.value})} />
            <Input label="Last Name" required value={newUser.lastName} onChange={e => setNewUser({...newUser, lastName: e.target.value})} />
          </div>
          <Input label="Username" required value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
          <Input label="Email" type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
          <label className="flex items-center gap-3 p-3 bg-l1-bg dark:bg-dark-surface border border-l5-border dark:border-dark-border rounded-lg cursor-pointer">
            <input type="checkbox" checked={newUser.isSuperAdmin} onChange={e => setNewUser({...newUser, isSuperAdmin: e.target.checked})} className="w-4 h-4 rounded border-l5-border text-layer-primary focus:ring-layer-primary/30" />
            <span className="text-xs font-bold text-text dark:text-dark-text uppercase tracking-tight">Grant Administrator privileges</span>
          </label>
        </form>
      </Modal>
    </div>
  );
}
