# PIF Meals System - Requirements Document

## Overview
A Pay-It-Forward meals system for UPLB students, connecting donors (UP Alumni) with students in need through Banned Books Reading Room as the service partner.

## Core Stakeholders
1. **Students** - UPLB students who need free meals
2. **Donors** - UP Alumni and supporters who fund meals
3. **Staff** - Banned Books staff who manage meal preparation and distribution

## Functional Requirements

### Student Flow
1. **Meal Request**
   - Present proof of enrollment
   - Fill application form:
     - Name
     - Mobile number
     - Course/year
     - Upload proof of enrollment
   - Choose availment date (earliest tomorrow)
   - Choose time slot (11am-1pm or 5-7pm)

2. **Voucher Generation**
   - System generates "Banned Books PIF Meal of the Day" voucher
   - Contains: unique reference number, date, time, student name

3. **Pay-It-Forward Pledge (Optional)**
   - Post-voucher prompt: "Promise to pay forward when able?"
   - Options: "Yes!" or "No, maybe some other time!"
   - If Yes: "1 PIF Meal Pledge saved under your name!"

4. **Meal Claiming**
   - Show ID to staff at scheduled time
   - Staff verifies and marks meal as "claimed"
   - Meal is served
   - Counter automatically decrements

### Donor Flow
1. **Donation Interface**
   - Context: Screenshots from freedom walls, student need messaging
   - Value proposition: PHP 65 provides ingredients for PHP 100 meal
   - Meal preview: photos, menu samples
   
2. **Donation Process**
   - Select number of meals to fund (1-100)
   - Online payment processing
   - Confirmation: "Banned Books will match your funds by preparing, serving, and cleaning up [number] meals"

### Staff Flow
1. **Meal Inventory Management**
   - View available PIF meals with ref numbers, dates, times, names
   - Mark meals as "claimed" when students present ID
   - Track preparation needs by date/time slot

2. **System Monitoring**
   - Monitor meal availability counters
   - Track PIF pledge counters

## Public Features
- **PIF Meal Counter** - Shows available meals to public
- **PIF Pledge Counter** - Shows total pledges made by students
- **Transparency Dashboard** - Public visibility of system metrics

## Business Rules
- Students can only book meals for tomorrow or later (not same day)
- Each voucher has a unique reference number
- Meals are time-slotted: 11am-1pm, 5-7pm
- Staff verification required for meal claiming
- Automatic inventory management
- Optional pledge system for students

## Technical Considerations
- File upload for proof of enrollment
- Unique voucher generation
- Real-time counter updates
- Payment processing integration
- ID verification workflow
- Date/time scheduling system
- Role-based access (student/donor/staff)
