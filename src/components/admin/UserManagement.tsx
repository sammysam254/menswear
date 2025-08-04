import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  role?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        role: roles?.find(role => role.user_id === profile.user_id)?.role || 'user'
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: 'admin' });

      if (error) throw error;

      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, role: 'admin' } : user
      ));

      toast({
        title: "Success",
        description: "User promoted to admin successfully",
      });
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: "Error",
        description: "Failed to promote user to admin",
        variant: "destructive",
      });
    }
  };

  const removeAdmin = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role: 'user' });

      if (error) throw error;

      setUsers(users.map(user => 
        user.user_id === userId ? { ...user, role: 'user' } : user
      ));

      toast({
        title: "Success",
        description: "Admin privileges removed successfully",
      });
    } catch (error) {
      console.error('Error removing admin:', error);
      toast({
        title: "Error",
        description: "Failed to remove admin privileges",
        variant: "destructive",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      // Delete from profiles table (this will cascade to user_roles)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(users.filter(user => user.user_id !== userId));

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-primary mb-4">User Management</h2>
      
      {/* Add User Section */}
      <div className="mb-6 p-4 border rounded-lg">
        <h3 className="font-semibold mb-3">Add New Admin Access</h3>
        <div className="flex gap-3">
          <Input
            placeholder="Enter user email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            className="flex-1"
          />
          <Select value={newUserRole} onValueChange={(value: 'user' | 'admin') => setNewUserRole(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={() => {
              // Find user by email and promote/demote
              const user = users.find(u => u.email === newUserEmail);
              if (user) {
                if (newUserRole === 'admin') {
                  promoteToAdmin(user.user_id);
                } else {
                  removeAdmin(user.user_id);
                }
                setNewUserEmail('');
              } else {
                toast({
                  title: "Error",
                  description: "User not found with that email",
                  variant: "destructive",
                });
              }
            }}
            disabled={!newUserEmail}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Update Role
          </Button>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="text-center py-8">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No users found</div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {user.role === 'admin' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeAdmin(user.user_id)}
                  >
                    Remove Admin
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => promoteToAdmin(user.user_id)}
                  >
                    Make Admin
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteUser(user.user_id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default UserManagement;