import { useState, useCallback } from 'react';
import { router, usePage, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import {
    Search,
    Filter,
    Plus,
    Eye,
    Edit,
    UserCheck,
    UserX,
    Trash,
    MoreHorizontal,
    Crown,
    Shield,
    GraduationCap,
    Heart,
} from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    course?: string;
    year_level?: string;
    student_id?: string;
    is_active: boolean;
    created_at: string;
    email_verified_at?: string;
}

interface Filters {
    role?: string;
    status?: string;
    search?: string;
}

interface PaginationData {
    data: User[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'User Management',
        href: '/admin/users',
    },
];

interface Props {
    users: PaginationData;
    filters: Filters;
    roles: string[];
}

export default function UserIndex({ users, filters, roles }: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

    const handleSearch = useCallback(() => {
        const params: Record<string, any> = {};
        if (searchQuery) params.search = searchQuery;
        if (roleFilter && roleFilter !== 'all') params.role = roleFilter;
        if (statusFilter && statusFilter !== 'all') params.status = statusFilter;

        router.get('/admin/users', params, {
            preserveState: true,
            replace: true,
        });
    }, [searchQuery, roleFilter, statusFilter]);

    const clearFilters = () => {
        setSearchQuery('');
        setRoleFilter('all');
        setStatusFilter('all');
        router.get('/admin/users', {}, {
            preserveState: true,
            replace: true,
        });
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin':
                return <Crown className="h-4 w-4 text-yellow-500" />;
            case 'staff':
                return <Shield className="h-4 w-4 text-blue-500" />;
            case 'student':
                return <GraduationCap className="h-4 w-4 text-green-500" />;
            case 'donor':
                return <Heart className="h-4 w-4 text-pink-500" />;
            default:
                return null;
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Admin</Badge>;
            case 'staff':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Staff</Badge>;
            case 'student':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Student</Badge>;
            case 'donor':
                return <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100">Donor</Badge>;
            default:
                return <Badge variant="secondary">{role}</Badge>;
        }
    };

    const getStatusBadge = (isActive: boolean) => {
        return isActive ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
        ) : (
            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>
        );
    };

    const handleToggleStatus = async (userId: string) => {
        try {
            await router.patch(`/admin/users/${userId}/toggle-status`);
        } catch (error) {
            console.error('Failed to toggle user status:', error);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await router.delete(`/admin/users/${userId}`);
            } catch (error) {
                console.error('Failed to delete user:', error);
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            User Management
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Manage system users, roles, and permissions
                        </p>
                    </div>
                    <Button asChild>
                        <a href="/admin/users/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Add User
                        </a>
                    </Button>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg">Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="search"
                                        placeholder="Name or email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="role">Role</Label>
                                <Select value={roleFilter} onValueChange={setRoleFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All roles" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All roles</SelectItem>
                                        {roles.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {role.charAt(0).toUpperCase() + role.slice(1)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button onClick={handleSearch}>
                                <Filter className="h-4 w-4 mr-2" />
                                Apply Filters
                            </Button>
                            <Button variant="outline" onClick={clearFilters}>
                                Clear Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Users</CardTitle>
                            <div className="text-sm text-muted-foreground">
                                Showing {users.from}-{users.to} of {users.total} users
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.length > 0 ? (
                                        users.data.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                                        {user.phone && (
                                                            <p className="text-sm text-muted-foreground">{user.phone}</p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        {getRoleIcon(user.role)}
                                                        {getRoleBadge(user.role)}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {user.role === 'student' && (
                                                        <div className="text-sm">
                                                            {user.course && <p>{user.course}</p>}
                                                            {user.year_level && <p>{user.year_level}</p>}
                                                            {user.student_id && <p>ID: {user.student_id}</p>}
                                                        </div>
                                                    )}
                                                    {user.role !== 'student' && (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                                                <TableCell>
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem asChild>
                                                                <a href={`/admin/users/${user.id}`}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </a>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <a href={`/admin/users/${user.id}/edit`}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit User
                                                                </a>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => handleToggleStatus(user.id)}
                                                            >
                                                                {user.is_active ? (
                                                                    <>
                                                                        <UserX className="mr-2 h-4 w-4" />
                                                                        Deactivate
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <UserCheck className="mr-2 h-4 w-4" />
                                                                        Activate
                                                                    </>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                onClick={() => handleDeleteUser(user.id)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash className="mr-2 h-4 w-4" />
                                                                Delete User
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                                No users found matching your filters
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        
                        {/* Pagination */}
                        {users.last_page > 1 && (
                            <div className="flex justify-center mt-6">
                                <div className="flex space-x-2">
                                    {Array.from({ length: users.last_page }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={page === users.current_page ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => router.get('/admin/users', {
                                                ...filters,
                                                page
                                            })}
                                        >
                                            {page}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
