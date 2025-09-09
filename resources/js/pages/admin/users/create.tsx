import { useState } from 'react';
import { router, Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Plus, ArrowLeft } from 'lucide-react';

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
        title: 'Create User',
        href: '/admin/users/create',
    },
];

interface Props {
    roles: string[];
}

interface FormData {
    name: string;
    email: string;
    phone: string;
    role: string;
    password: string;
    password_confirmation: string;
    course: string;
    year_level: string;
    student_id: string;
    is_active: boolean;
}

interface FormErrors {
    [key: string]: string;
}

export default function UserCreate({ roles }: Props) {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        phone: '',
        role: 'student',
        password: '',
        password_confirmation: '',
        course: '',
        year_level: '',
        student_id: '',
        is_active: true,
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            await router.post('/admin/users', formData, {
                onError: (errors) => {
                    setErrors(errors as FormErrors);
                    setIsSubmitting(false);
                },
                onSuccess: () => {
                    // Will redirect automatically
                },
            });
        } catch (error) {
            console.error('Failed to create user:', error);
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const isStudentRole = formData.role === 'student';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Create New User
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Add a new user to the system
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <a href="/admin/users">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Users
                        </a>
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                            <CardDescription>
                                Enter the details for the new user account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Basic Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Enter full name"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">{errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="Enter email address"
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500">{errors.email}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleInputChange('phone', e.target.value)}
                                        placeholder="Enter phone number"
                                        className={errors.phone ? 'border-red-500' : ''}
                                    />
                                    {errors.phone && (
                                        <p className="text-sm text-red-500">{errors.phone}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">Role *</Label>
                                    <Select 
                                        value={formData.role} 
                                        onValueChange={(value) => handleInputChange('role', value)}
                                    >
                                        <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.role && (
                                        <p className="text-sm text-red-500">{errors.role}</p>
                                    )}
                                </div>
                            </div>

                            {/* Password */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange('password', e.target.value)}
                                        placeholder="Enter password"
                                        className={errors.password ? 'border-red-500' : ''}
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-500">{errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm Password *</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={formData.password_confirmation}
                                        onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                                        placeholder="Confirm password"
                                        className={errors.password_confirmation ? 'border-red-500' : ''}
                                    />
                                    {errors.password_confirmation && (
                                        <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>

                            {/* Student-specific fields */}
                            {isStudentRole && (
                                <div className="border-t pt-4">
                                    <h4 className="text-lg font-medium mb-4">Student Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="course">Course</Label>
                                            <Input
                                                id="course"
                                                type="text"
                                                value={formData.course}
                                                onChange={(e) => handleInputChange('course', e.target.value)}
                                                placeholder="e.g., Computer Science"
                                                className={errors.course ? 'border-red-500' : ''}
                                            />
                                            {errors.course && (
                                                <p className="text-sm text-red-500">{errors.course}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="year_level">Year Level</Label>
                                            <Select 
                                                value={formData.year_level} 
                                                onValueChange={(value) => handleInputChange('year_level', value)}
                                            >
                                                <SelectTrigger className={errors.year_level ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select year level" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="1st Year">1st Year</SelectItem>
                                                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                                                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                                                    <SelectItem value="4th Year">4th Year</SelectItem>
                                                    <SelectItem value="5th Year">5th Year</SelectItem>
                                                    <SelectItem value="Graduate">Graduate</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {errors.year_level && (
                                                <p className="text-sm text-red-500">{errors.year_level}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="student_id">Student ID</Label>
                                            <Input
                                                id="student_id"
                                                type="text"
                                                value={formData.student_id}
                                                onChange={(e) => handleInputChange('student_id', e.target.value)}
                                                placeholder="Enter student ID number"
                                                className={errors.student_id ? 'border-red-500' : ''}
                                            />
                                            {errors.student_id && (
                                                <p className="text-sm text-red-500">{errors.student_id}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Account Status */}
                            <div className="border-t pt-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="is_active"
                                        checked={formData.is_active}
                                        onCheckedChange={(checked) => handleInputChange('is_active', !!checked)}
                                    />
                                    <Label htmlFor="is_active">Account is active</Label>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Active users can log in and use the system
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 mt-6">
                        <Button type="button" variant="outline" asChild>
                            <a href="/admin/users">Cancel</a>
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                'Creating...'
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create User
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
