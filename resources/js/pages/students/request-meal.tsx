import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, DocumentIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface RequestMealProps {
    time_slots: Array<{
        id: string;
        display_name: string;
        start_time: string;
        end_time: string;
    }>;
}

interface FormData {
    name: string;
    email: string;
    phone: string;
    course: string;
    year_level: string;
    student_id: string;
    proof_of_enrollment?: File;
    selected_date: string;
    time_slot_id: string;
}

interface ExistingDocument {
    file_url: string;
    original_filename: string;
    file_type: string;
    file_size: string;
    uploaded_at: string;
}

export default function RequestMeal({ time_slots }: RequestMealProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isEmailValidated, setIsEmailValidated] = useState(false);
    const [isExistingUser, setIsExistingUser] = useState(false);
    const [emailValidationMessage, setEmailValidationMessage] = useState('');
    const [fieldsDisabled, setFieldsDisabled] = useState(true);
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [existingDocument, setExistingDocument] = useState<ExistingDocument | null>(null);
    
    const { data, setData, post, processing, errors, reset } = useForm<FormData>({
        name: '',
        email: '',
        phone: '',
        course: '',
        year_level: '',
        student_id: '',
        proof_of_enrollment: undefined,
        selected_date: '',
        time_slot_id: '',
    });

    const onDrop = (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setUploadedFile(file);
            setData('proof_of_enrollment', file);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png'],
            'application/pdf': ['.pdf']
        },
        maxSize: 5 * 1024 * 1024, // 5MB
        multiple: false
    });

    const validateEmail = async (email: string) => {
        if (!email || !email.includes('@')) {
            setIsEmailValidated(false);
            setFieldsDisabled(true);
            setEmailValidationMessage('');
            return;
        }

        setIsCheckingEmail(true);
        try {
            const response = await axios.post('/students/check-email', { email });
            
            if (response.data.exists) {
                // Existing user - populate fields and make them read-only except email
                const userData = response.data.user;
                setData({
                    ...data,
                    name: userData.name,
                    phone: userData.phone,
                    course: userData.course,
                    year_level: userData.year_level,
                    student_id: userData.student_id,
                });
                setIsExistingUser(true);
                setEmailValidationMessage('Welcome back! Your information has been loaded.');
                setFieldsDisabled(false); // Allow editing of all fields for returning users
                
                // Set existing document if available
                if (userData.existing_document) {
                    setExistingDocument(userData.existing_document);
                } else {
                    setExistingDocument(null);
                }
            } else {
                // New user - enable all fields for editing
                setIsExistingUser(false);
                setEmailValidationMessage('New student detected. Please fill in your information below.');
                setFieldsDisabled(false);
                setExistingDocument(null);
            }
            
            setIsEmailValidated(true);
        } catch (error) {
            console.error('Email validation error:', error);
            setEmailValidationMessage('Error validating email. Please try again.');
        }
        setIsCheckingEmail(false);
    };

    // Debounced email validation
    useEffect(() => {
        const timer = setTimeout(() => {
            if (data.email) {
                validateEmail(data.email);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [data.email]);

    const handleNext = () => {
        if (currentStep === 1) {
            // First check if email is validated
            if (!isEmailValidated) {
                setEmailValidationMessage('Please enter and validate your email address first.');
                return;
            }
            
            // Validate step 1
            const requiredFields = ['name', 'email', 'phone', 'course', 'year_level', 'student_id'];
            const hasErrors = requiredFields.some(field => !data[field as keyof FormData]);
            
            // For returning students with existing documents, file upload is optional
            const needsFileUpload = !existingDocument && !uploadedFile;
            
            if (hasErrors || needsFileUpload) {
                return; // Show validation errors
            }
            
            setCurrentStep(2);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate step 2 fields
        if (!data.selected_date || !data.time_slot_id) {
            // Could add error messages here if needed
            return;
        }
        
        post('/students/request-meal');
    };

    return (
        <>
            <Head title="Request Free Meal - PIF Meals" />
            
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="mx-auto max-w-2xl px-6 lg:px-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mb-4">
                            ← Back to Home
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Get Your Free Meal
                        </h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Complete the form below to request a free meal at Banned Books
                        </p>
                    </div>

                    {/* Progress Steps */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center space-x-8">
                            <StepIndicator 
                                step={1} 
                                currentStep={currentStep} 
                                title="Student Info" 
                                completed={currentStep > 1} 
                            />
                            <div className="h-1 w-16 bg-gray-200 dark:bg-gray-700">
                                <div className={cn(
                                    "h-full bg-blue-600 transition-all duration-300",
                                    currentStep > 1 ? "w-full" : "w-0"
                                )} />
                            </div>
                            <StepIndicator 
                                step={2} 
                                currentStep={currentStep} 
                                title="Schedule Meal" 
                                completed={false} 
                            />
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8">
                        {/* General Error Display */}
                        {errors.general && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="text-red-800 dark:text-red-200 font-medium">
                                    {errors.general}
                                </p>
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit}>
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                        Student Information
                                    </h2>

                                    {/* Email First - Always Editable */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email Address *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                                placeholder="juan@up.edu.ph"
                                                required
                                            />
                                            {isCheckingEmail && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                                </div>
                                            )}
                                        </div>
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                        {emailValidationMessage && (
                                            <p className={`mt-1 text-sm ${
                                                isExistingUser 
                                                    ? 'text-green-600' 
                                                    : emailValidationMessage.includes('Error') 
                                                        ? 'text-red-600' 
                                                        : 'text-blue-600'
                                            }`}>
                                                {emailValidationMessage}
                                            </p>
                                        )}
                                    </div>

                                    {/* Other Fields - Disabled Until Email Validated */}
                                    {isEmailValidated && (
                                        <>
                                            {/* Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.name}
                                                    onChange={(e) => setData('name', e.target.value)}
                                                    disabled={fieldsDisabled}
                                                    className={cn(
                                                        "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white",
                                                        fieldsDisabled && "bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                                                    )}
                                                    placeholder="Juan Dela Cruz"
                                                    required
                                                />
                                                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                            </div>

                                            {/* Phone */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Mobile Number *
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    disabled={fieldsDisabled}
                                                    className={cn(
                                                        "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white",
                                                        fieldsDisabled && "bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                                                    )}
                                                    placeholder="09123456789"
                                                    required
                                                />
                                                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                            </div>

                                            {/* Course & Year */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Course *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.course}
                                                        onChange={(e) => setData('course', e.target.value)}
                                                        disabled={fieldsDisabled}
                                                        className={cn(
                                                            "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white",
                                                            fieldsDisabled && "bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                                                        )}
                                                        placeholder="BS Computer Science"
                                                        required
                                                    />
                                                    {errors.course && <p className="mt-1 text-sm text-red-600">{errors.course}</p>}
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Year Level *
                                                    </label>
                                                    <select
                                                        value={data.year_level}
                                                        onChange={(e) => setData('year_level', e.target.value)}
                                                        disabled={fieldsDisabled}
                                                        className={cn(
                                                            "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white",
                                                            fieldsDisabled && "bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                                                        )}
                                                        required
                                                    >
                                                        <option value="">Select Year</option>
                                                        <option value="1st Year">1st Year</option>
                                                        <option value="2nd Year">2nd Year</option>
                                                        <option value="3rd Year">3rd Year</option>
                                                        <option value="4th Year">4th Year</option>
                                                        <option value="5th Year">5th Year</option>
                                                        <option value="Graduate">Graduate</option>
                                                    </select>
                                                    {errors.year_level && <p className="mt-1 text-sm text-red-600">{errors.year_level}</p>}
                                                </div>
                                            </div>

                                            {/* Student ID */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Student ID Number *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.student_id}
                                                    onChange={(e) => setData('student_id', e.target.value)}
                                                    disabled={fieldsDisabled}
                                                    className={cn(
                                                        "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white",
                                                        fieldsDisabled && "bg-gray-100 dark:bg-gray-600 cursor-not-allowed"
                                                    )}
                                                    placeholder="2021-12345"
                                                    required
                                                />
                                                {errors.student_id && <p className="mt-1 text-sm text-red-600">{errors.student_id}</p>}
                                            </div>

                                            {/* File Upload */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Proof of Enrollment *
                                                </label>
                                                
                                                {/* Show existing document if available */}
                                                {existingDocument && !uploadedFile && (
                                                    <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                                        <div className="flex items-start space-x-3">
                                                            <DocumentIcon className="h-6 w-6 text-green-600 dark:text-green-400 mt-0.5" />
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                                    Previously uploaded document:
                                                                </p>
                                                                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                                                    {existingDocument.original_filename} ({existingDocument.file_size})
                                                                </p>
                                                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                                                    Uploaded on {existingDocument.uploaded_at}
                                                                </p>
                                                                <a 
                                                                    href={existingDocument.file_url} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center text-xs text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 mt-2 underline"
                                                                >
                                                                    📄 View/Download Document
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div
                                                    {...getRootProps()}
                                                    className={cn(
                                                        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                                                        fieldsDisabled 
                                                            ? "border-gray-200 dark:border-gray-700 cursor-not-allowed bg-gray-50 dark:bg-gray-800"
                                                            : isDragActive 
                                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" 
                                                                : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
                                                    )}
                                                >
                                                    <input {...getInputProps()} disabled={fieldsDisabled} />
                                                    {uploadedFile ? (
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <DocumentIcon className="h-8 w-8 text-green-500" />
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {uploadedFile.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <CloudArrowUpIcon className={cn(
                                                                "mx-auto h-12 w-12",
                                                                fieldsDisabled ? "text-gray-300" : "text-gray-400"
                                                            )} />
                                                            <p className={cn(
                                                                "mt-2 text-sm",
                                                                fieldsDisabled 
                                                                    ? "text-gray-400" 
                                                                    : "text-gray-600 dark:text-gray-400"
                                                            )}>
                                                                {fieldsDisabled 
                                                                    ? "Please validate your email first"
                                                                    : existingDocument
                                                                        ? "Upload a new document (optional - will replace the previous one)"
                                                                        : isDragActive 
                                                                            ? "Drop your file here" 
                                                                            : "Click to upload or drag and drop"}
                                                            </p>
                                                            {!fieldsDisabled && (
                                                                <p className="text-xs text-gray-500">
                                                                    PDF, JPG, PNG up to 5MB
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                {errors.proof_of_enrollment && <p className="mt-1 text-sm text-red-600">{errors.proof_of_enrollment}</p>}
                                            </div>
                                        </>
                                    )}

                                    {/* Next Button */}
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            disabled={processing || !isEmailValidated || isCheckingEmail}
                                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {isCheckingEmail ? 'Validating...' : 'Continue →'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                        Schedule Your Meal
                                    </h2>

                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                                        <div className="flex items-start space-x-2">
                                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                <strong>Important:</strong> Meals can only be scheduled for tomorrow or later. 
                                                Please arrive during your selected time slot with a valid ID.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Date Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            Choose Date *
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {/* Generate next 7 days starting from tomorrow */}
                                            {Array.from({ length: 7 }, (_, i) => {
                                                const date = new Date();
                                                date.setDate(date.getDate() + i + 1);
                                                const dateString = date.toISOString().split('T')[0];
                                                const displayDate = date.toLocaleDateString('en-US', { 
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                });
                                                
                                                return (
                                                    <div key={dateString} className="relative">
                                                        <input
                                                            type="radio"
                                                            id={`date-${dateString}`}
                                                            name="selected_date"
                                                            value={dateString}
                                                            checked={data.selected_date === dateString}
                                                            onChange={(e) => setData('selected_date', e.target.value)}
                                                            className="sr-only peer"
                                                        />
                                                        <label htmlFor={`date-${dateString}`} className="flex flex-col items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 peer-checked:border-blue-500 dark:peer-checked:border-white peer-checked:bg-blue-50 dark:peer-checked:bg-gray-600">
                                                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {displayDate}
                                                            </span>
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Time Slot Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            Choose Time Slot *
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {time_slots.map((slot) => (
                                                <div key={slot.id} className="relative">
                                                    <input
                                                        type="radio"
                                                        id={`slot-${slot.id}`}
                                                        name="time_slot_id"
                                                        value={slot.id}
                                                        checked={data.time_slot_id === slot.id}
                                                        onChange={(e) => setData('time_slot_id', e.target.value)}
                                                        className="sr-only peer"
                                                    />
                                                    <label htmlFor={`slot-${slot.id}`} className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 peer-checked:border-blue-500 dark:peer-checked:border-white peer-checked:bg-blue-50 dark:peer-checked:bg-gray-600">
                                                        <span className="font-medium text-gray-900 dark:text-white">
                                                            {slot.display_name}
                                                        </span>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Navigation Buttons */}
                                    <div className="flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(1)}
                                            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            ← Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing || !data.selected_date || !data.time_slot_id}
                                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            {processing ? 'Processing...' : 'Request Meal'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

interface StepIndicatorProps {
    step: number;
    currentStep: number;
    title: string;
    completed: boolean;
}

function StepIndicator({ step, currentStep, title, completed }: StepIndicatorProps) {
    return (
        <div className="flex flex-col items-center">
            <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold",
                completed 
                    ? "border-blue-500 bg-blue-500 text-white"
                    : currentStep === step
                        ? "border-blue-500 text-blue-500"
                        : "border-gray-300 text-gray-400"
            )}>
                {completed ? '✓' : step}
            </div>
            <p className={cn(
                "mt-2 text-sm font-medium",
                currentStep >= step ? "text-blue-600" : "text-gray-400"
            )}>
                {title}
            </p>
        </div>
    );
}
