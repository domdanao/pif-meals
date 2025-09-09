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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Search,
    Filter,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    MoreHorizontal,
    Download,
    RefreshCw,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Voucher {
    id: string;
    reference_number: string;
    student_name: string;
    student_course: string;
    student_year: string;
    student_phone: string;
    scheduled_date: string;
    scheduled_date_formatted: string;
    time_slot: string;
    status: string;
    claimed_at?: string;
    claimed_by?: string;
    created_at: string;
    can_claim: boolean;
    can_void: boolean;
}

interface TimeSlot {
    id: string;
    display_name: string;
    start_time: string;
    end_time: string;
}

interface Stats {
    active: number;
    claimed: number;
    expired: number;
    cancelled: number;
}

interface Filters {
    status?: string;
    date?: string;
    time_slot_id?: string;
    search?: string;
}

interface PaginationData {
    data: Voucher[];
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
        title: 'Vouchers',
        href: '/admin/vouchers',
    },
];

interface Props {
    vouchers: PaginationData;
    time_slots: TimeSlot[];
    filters: Filters;
    stats: Stats;
}

export default function VoucherIndex({ vouchers, time_slots, filters, stats }: Props) {
    const [selectedVouchers, setSelectedVouchers] = useState<string[]>([]);
    const [bulkAction, setBulkAction] = useState<'claim' | 'expire' | 'void' | null>(null);
    const [bulkReason, setBulkReason] = useState('');
    const [isProcessingBulk, setIsProcessingBulk] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [dateFilter, setDateFilter] = useState(filters.date || '');
    const [timeSlotFilter, setTimeSlotFilter] = useState(filters.time_slot_id || 'all');

    const handleSearch = useCallback(() => {
        const params: Record<string, any> = {};
        if (searchQuery) params.search = searchQuery;
        if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
        if (dateFilter) params.date = dateFilter;
        if (timeSlotFilter && timeSlotFilter !== 'all') params.time_slot_id = timeSlotFilter;

        router.get('/admin/vouchers', params, {
            preserveState: true,
            replace: true,
        });
    }, [searchQuery, statusFilter, dateFilter, timeSlotFilter]);

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setDateFilter('');
        setTimeSlotFilter('all');
        router.get('/admin/vouchers', {}, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSelectVoucher = (voucherId: string, checked: boolean) => {
        setSelectedVouchers(prev => 
            checked 
                ? [...prev, voucherId]
                : prev.filter(id => id !== voucherId)
        );
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectedVouchers(checked ? vouchers.data.map(v => v.id) : []);
    };

    const handleBulkAction = async () => {
        if (!bulkAction || selectedVouchers.length === 0) return;

        setIsProcessingBulk(true);
        
        try {
            await router.post('/admin/vouchers/bulk-action', {
                action: bulkAction,
                voucher_ids: selectedVouchers,
                reason: bulkReason,
            });
            
            setSelectedVouchers([]);
            setBulkAction(null);
            setBulkReason('');
        } catch (error) {
            console.error('Bulk action failed:', error);
        } finally {
            setIsProcessingBulk(false);
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
            case 'cancelled':
                return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Cancelled</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const handleSingleAction = async (voucherId: string, action: string) => {
        const reason = action === 'void' ? prompt('Enter void reason:') : '';
        if (action === 'void' && !reason) return;

        try {
            await router.patch(`/admin/vouchers/${voucherId}/${action}`, { reason });
        } catch (error) {
            console.error(`Failed to ${action} voucher:`, error);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Voucher Management" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Voucher Management
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Manage meal vouchers, track claims, and handle voucher operations
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => router.reload()}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Active</p>
                                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Claimed</p>
                                    <p className="text-2xl font-bold text-blue-600">{stats.claimed}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Expired</p>
                                    <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
                                </div>
                                <XCircle className="h-8 w-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Cancelled</p>
                                    <p className="text-2xl font-bold text-gray-600">{stats.cancelled}</p>
                                </div>
                                <XCircle className="h-8 w-8 text-gray-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg">Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <Label htmlFor="search">Search</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="search"
                                        placeholder="Reference, student name..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
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
                                        <SelectItem value="claimed">Claimed</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                />
                            </div>
                            <div>
                                <Label htmlFor="time-slot">Time Slot</Label>
                                <Select value={timeSlotFilter} onValueChange={setTimeSlotFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All time slots" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All time slots</SelectItem>
                                        {time_slots.map((slot) => (
                                            <SelectItem key={slot.id} value={slot.id}>
                                                {slot.display_name}
                                            </SelectItem>
                                        ))}
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

                {/* Bulk Actions */}
                {selectedVouchers.length > 0 && (
                    <Card className="mb-6">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-muted-foreground">
                                    {selectedVouchers.length} voucher(s) selected
                                </p>
                                <div className="flex space-x-2">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => setBulkAction('claim')}
                                            >
                                                Bulk Claim
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Bulk Claim Vouchers</DialogTitle>
                                                <DialogDescription>
                                                    Are you sure you want to claim {selectedVouchers.length} voucher(s)?
                                                </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setBulkAction(null)}>
                                                    Cancel
                                                </Button>
                                                <Button onClick={handleBulkAction} disabled={isProcessingBulk}>
                                                    {isProcessingBulk ? 'Processing...' : 'Claim Vouchers'}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => setBulkAction('void')}
                                            >
                                                Bulk Void
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Bulk Void Vouchers</DialogTitle>
                                                <DialogDescription>
                                                    Please provide a reason for voiding {selectedVouchers.length} voucher(s).
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <Label htmlFor="void-reason">Reason</Label>
                                                <Textarea
                                                    id="void-reason"
                                                    placeholder="Enter reason for voiding these vouchers..."
                                                    value={bulkReason}
                                                    onChange={(e) => setBulkReason(e.target.value)}
                                                />
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setBulkAction(null)}>
                                                    Cancel
                                                </Button>
                                                <Button 
                                                    onClick={handleBulkAction} 
                                                    disabled={isProcessingBulk || !bulkReason.trim()}
                                                >
                                                    {isProcessingBulk ? 'Processing...' : 'Void Vouchers'}
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Voucher Table */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Vouchers</CardTitle>
                            <div className="text-sm text-muted-foreground">
                                Showing {vouchers.from}-{vouchers.to} of {vouchers.total} vouchers
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedVouchers.length === vouchers.data.length && vouchers.data.length > 0}
                                                onCheckedChange={handleSelectAll}
                                            />
                                        </TableHead>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Course</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Time Slot</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Claimed</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vouchers.data.length > 0 ? (
                                        vouchers.data.map((voucher) => (
                                            <TableRow key={voucher.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedVouchers.includes(voucher.id)}
                                                        onCheckedChange={(checked) => 
                                                            handleSelectVoucher(voucher.id, !!checked)
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {voucher.reference_number}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{voucher.student_name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {voucher.student_phone}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {voucher.student_course} - {voucher.student_year}
                                                </TableCell>
                                                <TableCell>{voucher.scheduled_date_formatted}</TableCell>
                                                <TableCell>{voucher.time_slot}</TableCell>
                                                <TableCell>{getStatusBadge(voucher.status)}</TableCell>
                                                <TableCell>
                                                    {voucher.claimed_at ? (
                                                        <div className="text-sm">
                                                            <p>{voucher.claimed_at}</p>
                                                            <p className="text-muted-foreground">by {voucher.claimed_by}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
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
                                                                <a href={`/admin/vouchers/${voucher.id}`}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </a>
                                                            </DropdownMenuItem>
                                                            {voucher.can_claim && (
                                                                <DropdownMenuItem 
                                                                    onClick={() => handleSingleAction(voucher.id, 'claim')}
                                                                >
                                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                                    Claim
                                                                </DropdownMenuItem>
                                                            )}
                                                            {voucher.status === 'active' && (
                                                                <DropdownMenuItem 
                                                                    onClick={() => handleSingleAction(voucher.id, 'expire')}
                                                                >
                                                                    <Clock className="mr-2 h-4 w-4" />
                                                                    Mark Expired
                                                                </DropdownMenuItem>
                                                            )}
                                                            {voucher.can_void && (
                                                                <DropdownMenuItem 
                                                                    onClick={() => handleSingleAction(voucher.id, 'void')}
                                                                >
                                                                    <XCircle className="mr-2 h-4 w-4" />
                                                                    Void
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                                                No vouchers found matching your filters
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        
                        {/* Pagination */}
                        {vouchers.last_page > 1 && (
                            <div className="flex justify-center mt-6">
                                <div className="flex space-x-2">
                                    {Array.from({ length: vouchers.last_page }, (_, i) => i + 1).map((page) => (
                                        <Button
                                            key={page}
                                            variant={page === vouchers.current_page ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => router.get('/admin/vouchers', {
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
