import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Shield, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface PageProps {
    auth: {
        user: User;
    };
}

export default function Dashboard() {
    const { auth } = usePage<PageProps>().props;
    const isAdminOrStaff = ['admin', 'staff'].includes(auth.user.role);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Welcome Section */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {auth.user.name}!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        You're logged in as a <span className="capitalize font-medium">{auth.user.role}</span>
                    </p>
                </div>

                {/* Admin Panel Access */}
                {isAdminOrStaff && (
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2 text-blue-900 dark:text-blue-100">
                                <Shield className="h-6 w-6" />
                                <span>Admin Panel</span>
                            </CardTitle>
                            <CardDescription className="text-blue-700 dark:text-blue-300">
                                Access the admin panel to manage vouchers, users, and system settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild className="bg-blue-600 hover:bg-blue-700">
                                <Link href="/admin/dashboard">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Go to Admin Panel
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Actions Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Settings</CardTitle>
                            <CardDescription>
                                Update your account information and preferences
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button asChild variant="outline">
                                <Link href="/settings/profile">
                                    <Users className="h-4 w-4 mr-2" />
                                    Edit Profile
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {auth.user.role === 'student' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Request a Meal</CardTitle>
                                <CardDescription>
                                    Request a free meal voucher from the PIF Meals program
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild>
                                    <Link href="/students/request-meal">
                                        Request Meal
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {auth.user.role === 'donor' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Make a Donation</CardTitle>
                                <CardDescription>
                                    Fund meals for students in need
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild>
                                    <Link href={donate.url()}>
                                        Donate Now
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* System Status for Admin/Staff */}
                {isAdminOrStaff && (
                    <Card>
                        <CardHeader>
                            <CardTitle>System Overview</CardTitle>
                            <CardDescription>
                                Quick overview of the PIF Meals system
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <p className="text-muted-foreground mb-4">
                                    Access the admin panel for detailed metrics and management tools
                                </p>
                                <Button asChild size="lg">
                                    <Link href="/admin/dashboard">
                                        Open Admin Dashboard
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
