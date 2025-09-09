# PIF Meals System - Architecture Document

## Technology Stack Recommendation

### Frontend
- **Framework**: Next.js 14+ (React with App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand or React Query
- **File Upload**: react-dropzone
- **Date/Time**: date-fns
- **Forms**: React Hook Form + Zod validation

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Next.js API Routes or Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js or Auth0
- **File Storage**: AWS S3 or Cloudinary
- **Payment**: Stripe or PayMongo (for Philippines)
- **Email**: Resend or SendGrid

### Infrastructure
- **Hosting**: Vercel (full-stack) or Railway
- **Database**: Supabase or Railway PostgreSQL
- **CDN**: Vercel Edge Network
- **Monitoring**: Sentry + Vercel Analytics

## Database Schema

```sql
-- Users table (handles all user types)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'donor', 'staff', 'admin')),
    
    -- Student-specific fields
    course VARCHAR(100),
    year_level VARCHAR(10),
    student_id VARCHAR(50),
    
    -- Profile
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Meal donations from donors
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    meal_count INTEGER NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_reference VARCHAR(255),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Available meal slots funded by donations
CREATE TABLE meal_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donation_id UUID NOT NULL REFERENCES donations(id),
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'claimed', 'expired')),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP -- for meal expiry logic
);

-- Time slots for meal service
CREATE TABLE time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    display_name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Insert default time slots
INSERT INTO time_slots (start_time, end_time, display_name) VALUES
('11:00:00', '13:00:00', '11am - 1pm'),
('17:00:00', '19:00:00', '5pm - 7pm');

-- Student meal vouchers
CREATE TABLE vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number VARCHAR(20) UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES users(id),
    meal_inventory_id UUID NOT NULL REFERENCES meal_inventory(id),
    time_slot_id UUID NOT NULL REFERENCES time_slots(id),
    
    -- Scheduling
    scheduled_date DATE NOT NULL,
    
    -- Status tracking
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'expired', 'cancelled')),
    claimed_at TIMESTAMP,
    claimed_by_staff_id UUID REFERENCES users(id),
    
    -- Student info snapshot (for staff reference)
    student_name VARCHAR(255) NOT NULL,
    student_course VARCHAR(100),
    student_year VARCHAR(10),
    student_phone VARCHAR(20),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pay-it-forward pledges from students
CREATE TABLE pledges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    voucher_id UUID NOT NULL REFERENCES vouchers(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'cancelled')),
    fulfilled_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- File uploads for proof of enrollment
CREATE TABLE student_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    voucher_id UUID REFERENCES vouchers(id),
    file_url TEXT NOT NULL,
    file_type VARCHAR(10) NOT NULL,
    file_size INTEGER,
    original_filename VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System counters and metrics (for public display)
CREATE TABLE system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(50) UNIQUE NOT NULL,
    metric_value INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initialize default metrics
INSERT INTO system_metrics (metric_name, metric_value) VALUES
('total_meals_available', 0),
('total_meals_claimed', 0),
('total_pledges_active', 0),
('total_donations_received', 0);

-- Indexes for performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_vouchers_reference ON vouchers(reference_number);
CREATE INDEX idx_vouchers_student_date ON vouchers(student_id, scheduled_date);
CREATE INDEX idx_vouchers_status_date ON vouchers(status, scheduled_date);
CREATE INDEX idx_meal_inventory_status ON meal_inventory(status);
CREATE INDEX idx_donations_status ON donations(payment_status);
```

## API Design

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Student Endpoints
- `POST /api/students/vouchers` - Request meal voucher
- `GET /api/students/vouchers` - Get student's vouchers
- `POST /api/students/pledges` - Create PIF pledge
- `POST /api/students/documents` - Upload proof of enrollment

### Donor Endpoints
- `POST /api/donors/donations` - Create donation
- `GET /api/donors/donations` - Get donor's donation history
- `POST /api/donors/payments/webhook` - Payment webhook

### Staff Endpoints
- `GET /api/staff/vouchers` - Get vouchers by date/status
- `PATCH /api/staff/vouchers/:id/claim` - Mark voucher as claimed
- `GET /api/staff/inventory` - Get meal inventory status
- `GET /api/staff/metrics` - Get system metrics

### Public Endpoints
- `GET /api/public/metrics` - Get public counters
- `GET /api/public/time-slots` - Get available time slots

## System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js API)  │◄──►│   (PostgreSQL)  │
│                 │    │                  │    │                 │
│ - Student UI    │    │ - Authentication │    │ - Users         │
│ - Donor UI      │    │ - Voucher Logic  │    │ - Vouchers      │
│ - Staff UI      │    │ - Payment Proc.  │    │ - Donations     │
│ - Public Views  │    │ - File Uploads   │    │ - Pledges       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌────────┴────────┐             │
         │              │   External      │             │
         └──────────────┤   Services      ├─────────────┘
                        │                 │
                        │ - File Storage  │
                        │ - Payment API   │
                        │ - Email Service │
                        │ - SMS Service   │
                        └─────────────────┘
```

## Key Features Implementation

### Unique Reference Number Generation
```typescript
const generateReference = (): string => {
  const prefix = 'BB'; // Banned Books
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
```

### Real-time Counter Updates
- Use Server-Sent Events or WebSocket for live updates
- Update system_metrics table via database triggers
- Cache frequently accessed metrics

### Date/Time Validation
```typescript
const isValidBookingDate = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  return date >= tomorrow;
}
```

### File Upload Security
- Validate file types (PDF, JPG, PNG only)
- Limit file size (max 5MB)
- Scan for malware
- Generate secure URLs with expiration

## Security Considerations
- Input validation on all endpoints
- Rate limiting for API calls
- CSRF protection
- File upload validation
- SQL injection prevention (Prisma ORM)
- Secure payment processing
- Role-based access control
- Data encryption at rest and in transit
