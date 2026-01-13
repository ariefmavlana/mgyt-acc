'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Shield, UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useRequireAuth } from '@/hooks/use-require-auth'; // Assuming this exists or getting companyId from props

interface User {
    id: string;
    nama: string;
    email: string;
    role: string;
    lastLogin: string | null;
}

interface UsersTableProps {
    companyId: string;
}

export function UsersTable({ companyId }: UsersTableProps) {
    const queryClient = useQueryClient();
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('STAFF');

    // Fetch Users
    const { data: users, isLoading } = useQuery({
        queryKey: ['company-users', companyId],
        queryFn: async () => {
            const res = await api.get(`/companies/${companyId}/users`);
            return res.data;
        },
        enabled: !!companyId
    });

    // Add User Mutation
    const addUserMutation = useMutation({
        mutationFn: async (data: { email: string; role: string }) => {
            await api.post(`/companies/${companyId}/users`, data);
        },
        onSuccess: () => {
            toast.success('Pengguna berhasil ditambahkan');
            queryClient.invalidateQueries({ queryKey: ['company-users', companyId] });
            setIsInviteOpen(false);
            setInviteEmail('');
            setInviteRole('STAFF');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal menambahkan pengguna');
        }
    });

    // Remove User Mutation
    const removeUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            await api.delete(`/companies/${companyId}/users/${userId}`);
        },
        onSuccess: () => {
            toast.success('Akses pengguna dicabut');
            queryClient.invalidateQueries({ queryKey: ['company-users', companyId] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Gagal menghapus pengguna');
        }
    });

    const handleInvite = () => {
        if (!inviteEmail) return toast.error('Email wajib diisi');
        addUserMutation.mutate({ email: inviteEmail, role: inviteRole });
    };

    if (isLoading) return <div className="p-4 text-center">Memuat data pengguna...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Daftar Pengguna</h3>
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="mr-2 h-4 w-4" /> Undang Pengguna
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Undang Pengguna Baru</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Email Pengguna</Label>
                                <Input
                                    placeholder="user@example.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                                <p className="text-sm text-muted-foreground">User harus sudah terdaftar di sistem Mgyt Acc.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Peran (Role)</Label>
                                <Select value={inviteRole} onValueChange={setInviteRole}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                        <SelectItem value="MANAGER">Manager</SelectItem>
                                        <SelectItem value="STAFF">Staff</SelectItem>
                                        <SelectItem value="VIEWER">Viewer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsInviteOpen(false)}>Batal</Button>
                            <Button onClick={handleInvite} disabled={addUserMutation.isPending}>
                                {addUserMutation.isPending ? 'Mengundang...' : 'Kirim Undangan'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Peran</TableHead>
                            <TableHead>Terakhir Login</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users?.map((user: User) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.nama}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('id-ID') : '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => {
                                            if (confirm('Apakah Anda yakin ingin menghapus akses pengguna ini?')) {
                                                removeUserMutation.mutate(user.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {users?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Tidak ada pengguna lain di perusahaan ini.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
