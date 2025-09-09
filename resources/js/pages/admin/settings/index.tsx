import { useState } from 'react';
import { router, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Save, Settings, Mail, Users, Clock } from 'lucide-react';

interface SystemSettings {
    site_name: string;
    site_description: string;
    admin_email: string;
    registration_enabled: boolean;
    voucher_expiry_days: number;
    max_vouchers_per_user: number;
    meal_request_time_limit: number;
    notification_email_enabled: boolean;
    maintenance_mode: boolean;
    timezone: string;
}

interface Props {
    settings?: SystemSettings;
    timezones?: string[];
}

interface FormData extends SystemSettings {}

interface FormErrors {
    [key: string]: string;
}

export default function SystemSettingsIndex({ settings, timezones }: Props) {
    // Default settings in case none are provided
    const defaultSettings: SystemSettings = {
        site_name: 'PIF Meals',
        site_description: 'Free meal voucher system for students',
        admin_email: 'admin@example.com',
        registration_enabled: true,
        voucher_expiry_days: 30,
        max_vouchers_per_user: 5,
        meal_request_time_limit: 2,
        notification_email_enabled: true,
        maintenance_mode: false,
        timezone: 'UTC',
    };
    
    const currentSettings = settings || defaultSettings;
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Admin',
            href: '/admin/dashboard',
        },
        {
            title: 'System Settings',
            href: '/admin/settings',
        },
    ];

    const [formData, setFormData] = useState<FormData>({
        ...currentSettings,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            await router.patch('/admin/settings', formData, {
                onError: (errors) => {
                    setErrors(errors as FormErrors);
                    setIsSubmitting(false);
                },
                onSuccess: () => {
                    // Will redirect automatically or show success message
                },
            });
        } catch (error) {
            console.error('Failed to update settings:', error);
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof FormData, value: string | number | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'email', label: 'Email', icon: Mail },
        { id: 'vouchers', label: 'Vouchers', icon: Users },
        { id: 'advanced', label: 'Advanced', icon: Clock },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="System Settings" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            System Settings
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Configure system-wide settings and preferences
                        </p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-6 border-b">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-white dark:bg-gray-800 border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                            >
                                <Icon className="h-4 w-4 mr-2" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <form onSubmit={handleSubmit} className="max-w-4xl">
                    {/* General Settings */}
                    {activeTab === 'general' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>General Settings</CardTitle>
                                <CardDescription>
                                    Basic site configuration and information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="site_name">Site Name</Label>
                                        <Input
                                            id="site_name"
                                            type="text"
                                            value={formData.site_name}
                                            onChange={(e) => handleInputChange('site_name', e.target.value)}
                                            placeholder="Enter site name"
                                            className={errors.site_name ? 'border-red-500' : ''}
                                        />
                                        {errors.site_name && (
                                            <p className="text-sm text-red-500">{errors.site_name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="timezone">Timezone</Label>
                                        <Select 
                                            value={formData.timezone} 
                                            onValueChange={(value) => handleInputChange('timezone', value)}
                                        >
                                            <SelectTrigger className={errors.timezone ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select timezone" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {timezones ? (
                                                    timezones.map((tz) => (
                                                        <SelectItem key={tz} value={tz}>
                                                            {tz}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="UTC">UTC</SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.timezone && (
                                            <p className="text-sm text-red-500">{errors.timezone}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="site_description">Site Description</Label>
                                    <Textarea
                                        id="site_description"
                                        value={formData.site_description}
                                        onChange={(e) => handleInputChange('site_description', e.target.value)}
                                        placeholder="Enter site description"
                                        className={errors.site_description ? 'border-red-500' : ''}
                                        rows={3}
                                    />
                                    {errors.site_description && (
                                        <p className="text-sm text-red-500">{errors.site_description}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="registration_enabled"
                                        checked={formData.registration_enabled}
                                        onCheckedChange={(checked) => handleInputChange('registration_enabled', !!checked)}
                                    />
                                    <Label htmlFor="registration_enabled">Allow user registration</Label>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Email Settings */}
                    {activeTab === 'email' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Email Settings</CardTitle>
                                <CardDescription>
                                    Configure email notifications and administration
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="admin_email">Admin Email Address</Label>
                                    <Input
                                        id="admin_email"
                                        type="email"
                                        value={formData.admin_email}
                                        onChange={(e) => handleInputChange('admin_email', e.target.value)}
                                        placeholder="Enter admin email"
                                        className={errors.admin_email ? 'border-red-500' : ''}
                                    />
                                    {errors.admin_email && (
                                        <p className="text-sm text-red-500">{errors.admin_email}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        This email will receive system notifications and admin alerts
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="notification_email_enabled"
                                        checked={formData.notification_email_enabled}
                                        onCheckedChange={(checked) => handleInputChange('notification_email_enabled', !!checked)}
                                    />
                                    <Label htmlFor="notification_email_enabled">Enable email notifications</Label>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Voucher Settings */}
                    {activeTab === 'vouchers' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Voucher Settings</CardTitle>
                                <CardDescription>
                                    Configure voucher behavior and limits
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="voucher_expiry_days">Voucher Expiry (Days)</Label>
                                        <Input
                                            id="voucher_expiry_days"
                                            type="number"
                                            min="1"
                                            value={formData.voucher_expiry_days}
                                            onChange={(e) => handleInputChange('voucher_expiry_days', parseInt(e.target.value) || 0)}
                                            className={errors.voucher_expiry_days ? 'border-red-500' : ''}
                                        />
                                        {errors.voucher_expiry_days && (
                                            <p className="text-sm text-red-500">{errors.voucher_expiry_days}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            Number of days before vouchers expire
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="max_vouchers_per_user">Max Vouchers Per User</Label>
                                        <Input
                                            id="max_vouchers_per_user"
                                            type="number"
                                            min="1"
                                            value={formData.max_vouchers_per_user}
                                            onChange={(e) => handleInputChange('max_vouchers_per_user', parseInt(e.target.value) || 0)}
                                            className={errors.max_vouchers_per_user ? 'border-red-500' : ''}
                                        />
                                        {errors.max_vouchers_per_user && (
                                            <p className="text-sm text-red-500">{errors.max_vouchers_per_user}</p>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            Maximum number of active vouchers per user
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="meal_request_time_limit">Meal Request Time Limit (Hours)</Label>
                                    <Input
                                        id="meal_request_time_limit"
                                        type="number"
                                        min="1"
                                        max="24"
                                        value={formData.meal_request_time_limit}
                                        onChange={(e) => handleInputChange('meal_request_time_limit', parseInt(e.target.value) || 0)}
                                        className={errors.meal_request_time_limit ? 'border-red-500' : ''}
                                    />
                                    {errors.meal_request_time_limit && (
                                        <p className="text-sm text-red-500">{errors.meal_request_time_limit}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        Hours before meal time that requests must be submitted
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Advanced Settings */}
                    {activeTab === 'advanced' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Advanced Settings</CardTitle>
                                <CardDescription>
                                    System maintenance and advanced configuration
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4 p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="maintenance_mode"
                                            checked={formData.maintenance_mode}
                                            onCheckedChange={(checked) => handleInputChange('maintenance_mode', !!checked)}
                                        />
                                        <Label htmlFor="maintenance_mode" className="text-yellow-800 dark:text-yellow-200">
                                            Enable maintenance mode
                                        </Label>
                                    </div>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                        ⚠️ When enabled, only administrators can access the system. 
                                        Regular users will see a maintenance page.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Cache Management</Label>
                                    <div className="flex space-x-2">
                                        <Button type="button" variant="outline" size="sm">
                                            Clear Application Cache
                                        </Button>
                                        <Button type="button" variant="outline" size="sm">
                                            Clear View Cache
                                        </Button>
                                        <Button type="button" variant="outline" size="sm">
                                            Clear Route Cache
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Clear various system caches to resolve performance issues
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 mt-6">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                'Saving...'
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Settings
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
