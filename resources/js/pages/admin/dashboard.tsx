import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Ticket,
    Users,
    Heart,
    DollarSign,
    Clock,
    CheckCircle,
    AlertCircle,
    Search,
} from 'lucide-react';
import { router, Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface Metrics {
    available_meals_today: number;
    available_meals_tomorrow: number;
    pending_claims: number;
    active_pledges: number;
    recent_donations_amount: string;
}

interface Voucher {
    id: string;
    reference_number: string;
    student_name: string;
    student_course: string;
    time_slot: string;
    status: string;
    created_at: string;
}

interface Activity {
    id: string;
    reference_number: string;
    student_name: string;
    claimed_by: string;
    claimed_at: string;
}

interface SystemHealth {
    total_users: number;
    total_vouchers_today: number;
    total_donations_this_month: number;
    database_status: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

interface Props {
    metrics: Metrics;
    todays_vouchers: Voucher[];
    recent_activity: Activity[];
    system_health: SystemHealth;
}

export default function AdminDashboard({
    metrics,
    todays_vouchers,
    recent_activity,
    system_health
}: Props) {
    const [quickClaimRef, setQuickClaimRef] = useState('');
    const [isClaimingVoucher, setIsClaimingVoucher] = useState(false);

    const handleQuickClaim = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickClaimRef.trim()) return;

        setIsClaimingVoucher(true);
        
        try {
            await router.post('/admin/vouchers/quick-claim', {
                reference_number: quickClaimRef
            });
            setQuickClaimRef('');
        } catch (error) {
            console.error('Error claiming voucher:', error);
        } finally {
            setIsClaimingVoucher(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
            case 'claimed':
                return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Claimed</Badge>;
            case 'expired':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expired</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Welcome to the PIF Meals admin panel. Monitor vouchers, manage inventory, and track system health.
                    </p>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Available Meals</CardTitle>
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.available_meals_today}</div>
                            <p className="text-xs text-muted-foreground">Today • {metrics.available_meals_tomorrow} tomorrow</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Claims</CardTitle>
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{metrics.pending_claims}</div>
                            <p className="text-xs text-muted-foreground">Need attention</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Pledges</CardTitle>
                            <Heart className="h-4 w-4 text-pink-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.active_pledges}</div>
                            <p className="text-xs text-muted-foreground">Pay-it-forward commitments</p>
                        </CardContent>
                    </Card>

                </div>

                {/* Quick Claim Section */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5" />
                            <span>Quick Claim Voucher</span>
                        </CardTitle>
                        <CardDescription>
                            Enter a reference number to quickly claim a voucher
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleQuickClaim} className="flex space-x-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Enter reference number (e.g., BB-240901-A1B2)"
                                    value={quickClaimRef}
                                    onChange={(e) => setQuickClaimRef(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button 
                                type="submit" 
                                disabled={isClaimingVoucher || !quickClaimRef.trim()}
                            >
                                {isClaimingVoucher ? 'Claiming...' : 'Claim Voucher'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Today's Vouchers */}
                <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Today's Vouchers</CardTitle>
                                        <CardDescription>
                                            All vouchers scheduled for today
                                        </CardDescription>
                                    </div>
                                    <Button asChild variant="outline">
                                        <a href="/admin/vouchers">View All</a>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Reference</TableHead>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Course</TableHead>
                                                <TableHead>Time Slot</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {todays_vouchers.length > 0 ? (
                                                todays_vouchers.map((voucher) => (
                                                    <TableRow key={voucher.id}>
                                                        <TableCell className="font-medium">
                                                            {voucher.reference_number}
                                                        </TableCell>
                                                        <TableCell>{voucher.student_name}</TableCell>
                                                        <TableCell>{voucher.student_course}</TableCell>
                                                        <TableCell>{voucher.time_slot}</TableCell>
                                                        <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                                                        <TableCell>
                                                            <Button 
                                                                asChild 
                                                                variant="outline" 
                                                                size="sm"
                                                            >
                                                                <a href={`/admin/vouchers/${voucher.id}`}>
                                                                    View
                                                                </a>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                                        No vouchers scheduled for today
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                    {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>
                                    Latest voucher claims and system events
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Reference</TableHead>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Claimed By</TableHead>
                                                <TableHead>Date & Time</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recent_activity.length > 0 ? (
                                                recent_activity.map((activity) => (
                                                    <TableRow key={activity.id}>
                                                        <TableCell className="font-medium">
                                                            {activity.reference_number}
                                                        </TableCell>
                                                        <TableCell>{activity.student_name}</TableCell>
                                                        <TableCell>{activity.claimed_by}</TableCell>
                                                        <TableCell>{formatDateTime(activity.claimed_at)}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                        No recent activity
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                    {/* System Health */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{system_health.total_users}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Vouchers Today</CardTitle>
                                    <Ticket className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{system_health.total_vouchers_today}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Donations This Month</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{system_health.total_donations_this_month}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Database Status</CardTitle>
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold capitalize text-green-600">
                                        {system_health.database_status}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                </div>
            </div>
        </AppLayout>
    );
}
