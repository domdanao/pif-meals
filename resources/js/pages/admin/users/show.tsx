import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Crown,
    Shield,
    GraduationCap,
    Heart,
    Edit,
    UserCheck,
    UserX,
    Mail,
    Phone,
    Calendar,
    FileText,
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
    vouchers?: any[];
    donations?: any[];
    documents?: any[];
}

interface Props {
    user: User;
}

export default function UserShow({ user }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin/dashboard',
        },
        {
            title: 'User Management',
            href: '/admin/users',
        },
        {
            title: user.name,
            href: `/admin/users/${user.id}`,
        },
    ];

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin':
                return <Crown className="h-5 w-5 text-yellow-500" />;
            case 'staff':
                return <Shield className="h-5 w-5 text-blue-500" />;
            case 'student':
                return <GraduationCap className="h-5 w-5 text-green-500" />;
            case 'donor':
                return <Heart className="h-5 w-5 text-pink-500" />;
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`User: ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                        {getRoleIcon(user.role)}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {user.name}
                            </h1>
                            <div className="flex items-center space-x-2 mt-1">
                                {getRoleBadge(user.role)}
                                {getStatusBadge(user.is_active)}
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button asChild>
                            <a href={`/admin/users/${user.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                            </a>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Information */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Information</CardTitle>
                                <CardDescription>
                                    Basic information about this user
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Email</p>
                                            <p className="text-sm text-muted-foreground">{user.email}</p>
                                        </div>
                                    </div>
                                    {user.phone && (
                                        <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">Phone</p>
                                                <p className="text-sm text-muted-foreground">{user.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm font-medium">Joined</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {user.email_verified_at && (
                                        <div className="flex items-center space-x-2">
                                            <Mail className="h-4 w-4 text-green-500" />
                                            <div>
                                                <p className="text-sm font-medium">Email Verified</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {new Date(user.email_verified_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Student-specific information */}
                                {user.role === 'student' && (
                                    <div className="border-t pt-4">
                                        <h4 className="text-sm font-medium mb-2">Student Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {user.course && (
                                                <div>
                                                    <p className="text-sm font-medium">Course</p>
                                                    <p className="text-sm text-muted-foreground">{user.course}</p>
                                                </div>
                                            )}
                                            {user.year_level && (
                                                <div>
                                                    <p className="text-sm font-medium">Year Level</p>
                                                    <p className="text-sm text-muted-foreground">{user.year_level}</p>
                                                </div>
                                            )}
                                            {user.student_id && (
                                                <div>
                                                    <p className="text-sm font-medium">Student ID</p>
                                                    <p className="text-sm text-muted-foreground">{user.student_id}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Activity Summary */}
                        {(user.vouchers || user.donations) && (
                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Activity Summary</CardTitle>
                                    <CardDescription>
                                        Recent activity and statistics for this user
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {user.vouchers && (
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {user.vouchers.length}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Vouchers</p>
                                            </div>
                                        )}
                                        {user.donations && (
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-green-600">
                                                    {user.donations.length}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Donations</p>
                                            </div>
                                        )}
                                        {user.documents && (
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-purple-600">
                                                    {user.documents.length}
                                                </p>
                                                <p className="text-sm text-muted-foreground">Documents</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button asChild className="w-full" variant="outline">
                                    <a href={`/admin/users/${user.id}/edit`}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit User
                                    </a>
                                </Button>
                                <Button 
                                    className="w-full" 
                                    variant="outline"
                                    onClick={() => {
                                        // This would trigger the toggle status action
                                        window.location.href = `/admin/users/${user.id}/toggle-status`;
                                    }}
                                >
                                    {user.is_active ? (
                                        <>
                                            <UserX className="h-4 w-4 mr-2" />
                                            Deactivate User
                                        </>
                                    ) : (
                                        <>
                                            <UserCheck className="h-4 w-4 mr-2" />
                                            Activate User
                                        </>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Account Status */}
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>Account Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Status:</span>
                                        {getStatusBadge(user.is_active)}
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Email Verified:</span>
                                        <Badge variant={user.email_verified_at ? "default" : "secondary"}>
                                            {user.email_verified_at ? "Yes" : "No"}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Role:</span>
                                        {getRoleBadge(user.role)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
