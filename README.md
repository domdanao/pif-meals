# PIF Meals - Pay It Forward Meals System

A Laravel-based web application that connects UPLB students in need with UP Alumni donors through Banned Books Reading Room, creating a sustainable community-driven meal assistance program.

## 📋 Project Overview

The PIF Meals system enables:
- **Students** to request free meals by uploading proof of enrollment
- **Donors** to fund meals for students with transparent impact tracking
- **Staff** at Banned Books to manage meal inventory and voucher verification
- **Public visibility** through real-time counters and transparency dashboard

## 🏗️ Architecture

- **Backend**: Laravel 11 with PHP 8.2+
- **Database**: SQLite (development) / PostgreSQL (production)
- **Frontend**: Blade templates with Alpine.js and Tailwind CSS
- **File Storage**: Local storage (development) / AWS S3 (production)
- **Payment Processing**: PayMongo or Stripe for Philippine market
- **Authentication**: Laravel's built-in authentication system

## 🚀 Getting Started

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js and npm
- SQLite (for development)

### Installation

1. **Clone and Install Dependencies**
```bash
cd /Users/dominickdanao/Projects/pif-meals
composer install
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
php artisan key:generate
```

3. **Configure Environment**
Update your `.env` file:
```env
APP_NAME="PIF Meals"
APP_ENV=local
APP_DEBUG=true
APP_TIMEZONE=Asia/Manila
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=/Users/dominickdanao/Projects/pif-meals/database/database.sqlite

MAIL_MAILER=smtp
# Configure your mail settings

# File storage (use local for development)
FILESYSTEM_DISK=local

# Payment processing (configure for production)
PAYMONGO_SECRET_KEY=
PAYMONGO_PUBLIC_KEY=
```

4. **Database Setup**
```bash
# Create SQLite database
touch database/database.sqlite

# Run migrations and seed default data
php artisan migrate
php artisan db:seed --class=DefaultDataSeeder
```

5. **Build Assets**
```bash
npm run build
```

6. **Start Development Server**
```bash
php artisan serve
```

Visit `http://localhost:8000` to see the application.

## 📊 Database Schema

### Core Tables
- **users** - Students, donors, staff, and admins
- **donations** - Monetary contributions from donors
- **meal_inventory** - Available meals funded by donations
- **vouchers** - Student meal vouchers with scheduling
- **time_slots** - Available meal times (11am-1pm, 5pm-7pm)
- **pledges** - Pay-it-forward commitments from students
- **student_documents** - Proof of enrollment uploads
- **system_metrics** - Public counters and statistics

### Key Relationships
- Donations create meal inventory items
- Students request vouchers that consume meal inventory
- Vouchers are scheduled for specific time slots
- Students can make pledges after receiving vouchers

## 🔄 User Flows

### Student Journey
1. **Landing Page** → View available meals counter
2. **Registration** → Fill form + upload proof of enrollment
3. **Scheduling** → Choose date (tomorrow+) and time slot
4. **Voucher** → Receive unique reference number
5. **Pledge Prompt** → Optional pay-it-forward commitment
6. **Claiming** → Present ID + voucher to staff

### Donor Journey
1. **Landing Page** → See student need + impact messaging
2. **Donation** → Choose meal count (1-100) and payment method
3. **Payment** → Process through PayMongo/Stripe
4. **Confirmation** → Receive donation receipt and impact updates
5. **Dashboard** → Track meals funded vs. claimed

### Staff Journey
1. **Login** → Access staff dashboard
2. **Daily View** → See today's scheduled vouchers
3. **Verification** → Verify student ID and mark meals as claimed
4. **Inventory** → Monitor available meals and upcoming schedule

## 🛠️ Development Commands

### Database Operations
```bash
# Create new migration
php artisan make:migration create_new_table

# Run migrations
php artisan migrate

# Fresh migration with seeding
php artisan migrate:fresh --seed

# Access database browser
php artisan db:browser
```

### Model and Controller Generation
```bash
# Create model with migration and controller
php artisan make:model NewModel -mcr

# Create service class
php artisan make:class Services/VoucherService
```

### Asset Building
```bash
# Development build with watching
npm run dev

# Production build
npm run build
```

### Testing
```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature
```

## 🎯 Key Features Implementation

### Unique Reference Number Generation
Each voucher gets a unique reference like `BB-240115-XYZ9`:
```php
// In Voucher model
public static function generateReferenceNumber(): string
{
    do {
        $prefix = 'BB'; // Banned Books
        $timestamp = Carbon::now()->format('ymd');
        $random = strtoupper(Str::random(4));
        $reference = "{$prefix}-{$timestamp}-{$random}";
    } while (self::where('reference_number', $reference)->exists());
    return $reference;
}
```

### Real-time Counters
System metrics are automatically updated when:
```php
// When meal is claimed
SystemMetric::incrementCounter('total_meals_claimed');

// When donation is completed
SystemMetric::incrementCounter('total_meals_available', $donation->meal_count);

// When pledge is made
SystemMetric::incrementCounter('total_pledges_active');
```

### Date/Time Validation
Students can only book meals for tomorrow or later:
```php
// In voucher validation
$tomorrow = Carbon::tomorrow();
$rules = [
    'scheduled_date' => "required|date|after_or_equal:{$tomorrow->format('Y-m-d')}"
];
```

## 🔐 Security Features

- **Role-based Access Control** - Student/Donor/Staff/Admin permissions
- **File Upload Validation** - PDF/JPG/PNG only, max 5MB
- **CSRF Protection** - Enabled on all forms
- **Input Validation** - Comprehensive validation rules
- **SQL Injection Prevention** - Eloquent ORM protection

## 📱 Mobile Responsiveness

The application is built mobile-first with:
- **Tailwind CSS** responsive utilities
- **Touch-friendly** buttons and interactions
- **Mobile-optimized** file uploads and camera integration
- **Progressive Web App** capabilities (future enhancement)

## 🚀 Deployment

### Production Environment
1. **Server Requirements**
   - PHP 8.2+ with required extensions
   - PostgreSQL database
   - Web server (Apache/Nginx)
   - SSL certificate

2. **Environment Configuration**
```env
APP_ENV=production
APP_DEBUG=false
DB_CONNECTION=pgsql
DB_HOST=your-db-host
DB_DATABASE=pif_meals_prod
FILESYSTEM_DISK=s3
AWS_BUCKET=pif-meals-storage
```

3. **Deployment Steps**
```bash
# Install production dependencies
composer install --no-dev --optimize-autoloader

# Build production assets
npm run build

# Run migrations
php artisan migrate --force

# Cache configuration and routes
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set proper permissions
chmod -R 755 storage bootstrap/cache
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For questions or issues:
- **Technical Issues**: Create a GitHub issue
- **Business Logic**: Contact project maintainers
- **Banned Books Partnership**: Contact Banned Books Reading Room

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

---

**Built with ❤️ for the UP community**

*"Every meal makes a difference in a student's day. Thank you to all donors and students paying it forward!"*
