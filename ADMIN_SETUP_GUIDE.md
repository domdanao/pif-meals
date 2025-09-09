# PIF Meals Admin Panel Setup & Usage Guide

## 🚀 Quick Setup

### Step 1: Create Admin Users

You have **3 ways** to create admin users:

#### Option A: Using Database Seeder (Recommended for first setup)
```bash
# Run the seeder to create default admin accounts
php artisan db:seed --class=AdminUserSeeder
```
This creates:
- **Admin**: `admin@pif-meals.test` / `password`
- **Staff**: `staff@pif-meals.test` / `password` 
- **Student**: `student@uplb.edu.ph` / `password` (for testing)

#### Option B: Using Artisan Command (For additional admins)
```bash
# Create a new admin user
php artisan make:admin "John Doe" john@example.com

# Create a staff user with phone
php artisan make:admin "Jane Smith" jane@example.com --role=staff --phone="+639123456789"

# Create with custom password
php artisan make:admin "Bob Admin" bob@example.com --password=mysecretpassword
```

#### Option C: Manual Database Creation
```sql
INSERT INTO users (id, name, email, password, role, is_active, email_verified_at, created_at, updated_at) 
VALUES (
    gen_random_uuid(),
    'Your Name',
    'your.email@example.com',
    '$2y$12$your_hashed_password_here',
    'admin',
    true,
    NOW(),
    NOW(),
    NOW()
);
```

### Step 2: Start Your Application
```bash
# Make sure your application is running
php artisan serve

# Or if using Vite for frontend assets
npm run dev
```

## 🎯 How to Access the Admin Panel

### 1. Login to Your Account
1. Visit: `http://localhost:8000/login`
2. Enter admin credentials:
   - Email: `admin@pif-meals.test`
   - Password: `password`

### 2. Access Admin Dashboard
- **Direct URL**: `http://localhost:8000/admin/dashboard`
- **Or navigate**: After login, go to `/admin/dashboard`

## 📊 Admin Panel Features

### 🏠 **Dashboard** (`/admin/dashboard`)
- **Real-time metrics**: Available meals, pending claims, active pledges
- **Quick voucher claiming**: Enter reference number to claim instantly
- **Today's vouchers**: View all vouchers scheduled for today
- **Recent activity**: Latest voucher claims and system events
- **System health**: Database status, user counts, donation metrics

### 🎫 **Voucher Management** (`/admin/vouchers`)
- **View all vouchers** with advanced filtering
- **Search by**: Reference number, student name, course
- **Filter by**: Status, date, time slot
- **Bulk operations**: Claim, void, or expire multiple vouchers
- **Individual actions**: Claim, void, expire single vouchers
- **Pagination**: Navigate through large voucher lists

### 👥 **User Roles & Permissions**

#### **Admin Users** (Full Access)
- ✅ All dashboard metrics and insights
- ✅ Complete voucher management (view, claim, void, expire)
- ✅ Bulk voucher operations
- ✅ User management (when implemented)
- ✅ System settings (when implemented)
- ✅ Reports and analytics (when implemented)

#### **Staff Users** (Operational Access)
- ✅ Dashboard with key metrics
- ✅ Voucher claiming and management
- ✅ Bulk voucher operations
- ✅ Today's voucher schedule
- ❌ User management
- ❌ System settings

## 🛠️ Common Admin Tasks

### **Claim a Voucher**
1. **Quick Method**: Use dashboard quick claim box
   - Enter reference number (e.g., `BB-240908-A1B2`)
   - Click "Claim Voucher"

2. **Detailed Method**: Go to voucher management
   - Find voucher in list or search
   - Click actions menu (⋯) → "Claim"

### **Void a Voucher**
1. Go to voucher management
2. Find voucher → Actions menu → "Void"
3. Enter reason for voiding
4. Confirm action

### **Bulk Operations**
1. Go to voucher management (`/admin/vouchers`)
2. Select vouchers using checkboxes
3. Click "Bulk Claim" or "Bulk Void"
4. Confirm the action

### **Filter Vouchers**
- **By Status**: Active, Claimed, Expired, Cancelled
- **By Date**: Select specific date
- **By Time Slot**: Choose from available time slots
- **By Search**: Reference number, student name, course

## 🔧 Troubleshooting

### **Can't Access Admin Panel**
- ✅ Check user role is `admin` or `staff`
- ✅ Verify email is verified (`email_verified_at` is not null)
- ✅ Ensure user is active (`is_active` = true)
- ✅ Clear browser cache and cookies

### **Routes Not Working**
```bash
# Clear and rebuild routes
php artisan route:clear
php artisan route:cache
```

### **Frontend Not Loading**
```bash
# Rebuild frontend assets
npm run build
# Or for development
npm run dev
```

### **Database Issues**
```bash
# Run migrations if needed
php artisan migrate

# Seed admin users again
php artisan db:seed --class=AdminUserSeeder
```

## 🔐 Security Best Practices

### **Change Default Passwords**
```bash
# Create new admin with secure password
php artisan make:admin "Your Name" your.secure.email@domain.com --password=your_secure_password
```

### **Remove Test Accounts**
After setup, consider removing test accounts:
```sql
DELETE FROM users WHERE email IN (
    'admin@pif-meals.test',
    'staff@pif-meals.test', 
    'student@uplb.edu.ph'
);
```

### **Environment Variables**
Ensure your `.env` has proper security settings:
```env
APP_ENV=production
APP_DEBUG=false
SESSION_SECURE_COOKIE=true
```

## 📱 Mobile Usage

The admin panel is **mobile-responsive** and works great on tablets and phones:

- **Touch-friendly** interface
- **Large buttons** for easy tapping
- **Responsive tables** that scroll horizontally
- **Mobile navigation** with collapsible sidebar

Perfect for staff using tablets at the service counter!

## 🆘 Need Help?

### **Check Admin User Status**
```bash
# Check if user exists and has correct role
php artisan tinker
>>> App\Models\User::where('email', 'admin@pif-meals.test')->first();
```

### **Reset User Password**
```bash
php artisan tinker
>>> $user = App\Models\User::where('email', 'your@email.com')->first();
>>> $user->password = Hash::make('newpassword');
>>> $user->save();
```

### **Verify Routes**
```bash
# See all admin routes
php artisan route:list --name=admin
```

## 🎉 You're Ready!

Your admin panel is now set up and ready to use! Staff can efficiently manage vouchers, and administrators have full oversight of the system.

**Happy voucher management!** 🎫✨
