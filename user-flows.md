# PIF Meals System - User Flows & Wireframes

## Student User Flow

### 1. Landing Page / Meal Request Entry
**Wireframe Description:**
```
┌─────────────────────────────────────────┐
│ BANNED BOOKS PIF MEALS                  │
│                                         │
│ "Wala pa ba stipend mo?                 │
│ O kinapos ang budget?                   │
│ Me libreng meal ka bukas dito sa        │
│ Banned Books..."                        │
│                                         │
│ [📊 123 Meals Available]                │
│ [🤝 45 Students Pledged to Pay Forward] │
│                                         │
│ [CLICK TO AVAIL MEAL] ──────────────────┤
└─────────────────────────────────────────┘
```

### 2. Student Registration/Login
**Flow:** Click "Avail Meal" → Registration Form
```
┌─────────────────────────────────────────┐
│ GET YOUR FREE MEAL                      │
│                                         │
│ Name: [________________]                │
│ Mobile: [______________]                │
│ Email: [_______________]                │
│ Course: [_____________]                 │
│ Year: [_______________]                 │
│ Student ID: [_________]                 │
│                                         │
│ Upload Proof of Enrollment:             │
│ [📎 Choose File] ──────────────────────┤
│                                         │
│ [CONTINUE] ─────────────────────────────┤
└─────────────────────────────────────────┘
```

### 3. Meal Scheduling
**Flow:** Registration → Date/Time Selection
```
┌─────────────────────────────────────────┐
│ CHOOSE YOUR MEAL DATE & TIME            │
│                                         │
│ Available Date:                         │
│ [📅 Tomorrow] [📅 Jan 15] [📅 Jan 16]   │
│                                         │
│ Available Time Slots:                   │
│ ○ 11:00 AM - 1:00 PM                   │
│ ○ 5:00 PM - 7:00 PM                    │
│                                         │
│ Selected: Tomorrow, 11:00 AM - 1:00 PM  │
│                                         │
│ [CONFIRM BOOKING] ──────────────────────┤
└─────────────────────────────────────────┘
```

### 4. Voucher Generation
**Flow:** Schedule Confirmation → Voucher Display
```
┌─────────────────────────────────────────┐
│ 🎫 VOUCHER GENERATED!                   │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ BANNED BOOKS PIF MEAL OF THE DAY    │ │
│ │                                     │ │
│ │ Reference: BB-1K2L3M4N-XYZ9         │ │
│ │ Student: Juan Dela Cruz             │ │
│ │ Date: January 15, 2024              │ │
│ │ Time: 11:00 AM - 1:00 PM            │ │
│ │                                     │ │
│ │ Present this voucher + ID to staff  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [DOWNLOAD PDF] [SAVE TO PHONE]          │
└─────────────────────────────────────────┘
```

### 5. Pay-It-Forward Pledge Prompt
**Flow:** Voucher Generated → PIF Prompt
```
┌─────────────────────────────────────────┐
│ 💝 WOULD YOU LIKE TO PAY IT FORWARD?    │
│                                         │
│ "Would you like to promise to pay this  │
│ forward by providing a free meal to     │
│ another UP student, when you are able?" │
│                                         │
│ [YES!] ─────────────────────────────────┤
│                                         │
│ [NO, MAYBE SOME OTHER TIME!] ───────────┤
└─────────────────────────────────────────┘
```

### 6. Pledge Confirmation (if Yes selected)
```
┌─────────────────────────────────────────┐
│ 🌟 THANK YOU!                           │
│                                         │
│ "1 PIF Meal Pledge saved under your     │
│ name!"                                  │
│                                         │
│ Your pledge will be counted publicly    │
│ and inspire others to give back.        │
│                                         │
│ [DONE] ─────────────────────────────────┤
└─────────────────────────────────────────┘
```

### 7. Student Dashboard
**Flow:** View Active Vouchers & History
```
┌─────────────────────────────────────────┐
│ MY MEALS                                │
│                                         │
│ Active Vouchers:                        │
│ ┌─────────────────────────────────────┐ │
│ │ BB-1K2L3M4N-XYZ9                    │ │
│ │ Tomorrow, 11:00 AM - 1:00 PM        │ │
│ │ Status: Active                      │ │
│ │ [VIEW DETAILS]                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ My PIF Pledges: 1                       │
│ Meals Claimed: 0                        │
│                                         │
│ [REQUEST NEW MEAL] ─────────────────────┤
└─────────────────────────────────────────┘
```

---

## Donor User Flow

### 1. Donor Landing Page
```
┌─────────────────────────────────────────┐
│ SUPPORT UPLB STUDENTS                   │
│                                         │
│ [Freedom Wall Screenshots]              │
│                                         │
│ "Are you a UP Alumni? Many students in  │
│ UPLB do not have enough money for meals,│
│ and we would like to support them..."   │
│                                         │
│ 💰 PHP 65 = Ingredients for 1 meal     │
│ 🍽️ PHP 100 = Complete meal value        │
│ 🤝 Banned Books provides facilities     │
│                                         │
│ [DONATE NOW] ──────────────────────────┤
└─────────────────────────────────────────┘
```

### 2. Meal Preview
```
┌─────────────────────────────────────────┐
│ SAMPLE MEALS WE SERVE                   │
│                                         │
│ [📸 Meal Photo 1] [📸 Meal Photo 2]     │
│ [📸 Meal Photo 3] [📸 Meal Photo 4]     │
│                                         │
│ Today's Menu:                           │
│ • Adobong Manok with Rice              │
│ • Vegetables                            │
│ • Drink                                 │
│                                         │
│ [PROCEED TO DONATE] ────────────────────┤
└─────────────────────────────────────────┘
```

### 3. Donation Selection
```
┌─────────────────────────────────────────┐
│ HOW MANY MEALS WOULD YOU LIKE TO FUND?  │
│                                         │
│ Number of meals: [____] (1-100)         │
│                                         │
│ Cost breakdown:                         │
│ Meals: 5 × PHP 65 = PHP 325            │
│ Platform fee: PHP 15                    │
│ Total: PHP 340                          │
│                                         │
│ Your impact:                            │
│ • 5 students will receive free meals    │
│ • Banned Books will prepare & serve     │
│ • Students can pledge to pay forward    │
│                                         │
│ [CONTINUE TO PAYMENT] ──────────────────┤
└─────────────────────────────────────────┘
```

### 4. Donor Registration & Payment
```
┌─────────────────────────────────────────┐
│ DONOR INFORMATION                       │
│                                         │
│ Name: [________________]                │
│ Email: [_______________]                │
│ Phone: [______________]                 │
│                                         │
│ Are you a UP Alumni? ○ Yes ○ No         │
│ Batch Year (optional): [____]           │
│                                         │
│ Payment Method:                         │
│ ○ GCash    ○ Credit Card    ○ PayPal    │
│                                         │
│ [PAY PHP 340] ─────────────────────────┤
└─────────────────────────────────────────┘
```

### 5. Payment Confirmation
```
┌─────────────────────────────────────────┐
│ 🎉 DONATION SUCCESSFUL!                 │
│                                         │
│ "Thank you for your payment. Banned     │
│ Books will match your funds by          │
│ preparing, serving, and cleaning-up     │
│ after 5 meals."                         │
│                                         │
│ Donation ID: DON-2024-001234            │
│ Amount: PHP 340                         │
│ Meals Funded: 5                         │
│                                         │
│ You'll receive email updates when       │
│ students claim their meals.             │
│                                         │
│ [VIEW DASHBOARD] ───────────────────────┤
└─────────────────────────────────────────┘
```

### 6. Donor Dashboard
```
┌─────────────────────────────────────────┐
│ MY DONATIONS                            │
│                                         │
│ Total Donated: PHP 1,275                │
│ Meals Funded: 18                        │
│ Meals Claimed: 12                       │
│ Meals Remaining: 6                      │
│                                         │
│ Recent Donations:                       │
│ ┌─────────────────────────────────────┐ │
│ │ Jan 15, 2024 - 5 meals - PHP 340   │ │
│ │ Status: 3 claimed, 2 available     │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [DONATE MORE MEALS] ────────────────────┤
└─────────────────────────────────────────┘
```

---

## Staff User Flow

### 1. Staff Login
```
┌─────────────────────────────────────────┐
│ BANNED BOOKS STAFF LOGIN                │
│                                         │
│ Email: [_______________]                │
│ Password: [____________]                │
│                                         │
│ [LOGIN] ────────────────────────────────┤
│                                         │
│ Forgot password? [Reset]                │
└─────────────────────────────────────────┘
```

### 2. Staff Dashboard
```
┌─────────────────────────────────────────┐
│ STAFF DASHBOARD                         │
│                                         │
│ Today's Meal Schedule (Jan 15, 2024):   │
│                                         │
│ 11:00 AM - 1:00 PM: 8 vouchers         │
│ 5:00 PM - 7:00 PM: 12 vouchers         │
│                                         │
│ Quick Stats:                            │
│ • Total Available Meals: 123           │
│ • Vouchers Today: 20                    │
│ • Claimed Today: 5                      │
│                                         │
│ [VIEW TODAY'S VOUCHERS] ────────────────┤
│ [MEAL INVENTORY] ──────────────────────┤
│ [SYSTEM METRICS] ──────────────────────┤
└─────────────────────────────────────────┘
```

### 3. Voucher Management (Today's View)
```
┌─────────────────────────────────────────┐
│ TODAY'S VOUCHERS - Jan 15, 2024         │
│                                         │
│ 11:00 AM - 1:00 PM Slot:               │
│ ┌─────────────────────────────────────┐ │
│ │ BB-1K2L3M4N-XYZ9 | Juan Dela Cruz  │ │
│ │ BSCS 3rd Year | 09123456789        │ │
│ │ Status: [ACTIVE] [MARK AS CLAIMED]  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ BB-5P6Q7R8S-ABC3 | Maria Santos    │ │
│ │ BS Biology 2nd Year | 09198765432  │ │
│ │ Status: [CLAIMED ✓] Claimed: 11:45 │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [REFRESH] [EXPORT LIST] ────────────────┤
└─────────────────────────────────────────┘
```

### 4. Claim Verification Process
**Flow:** Student presents ID → Staff verifies → Mark claimed
```
┌─────────────────────────────────────────┐
│ VERIFY STUDENT IDENTITY                 │
│                                         │
│ Voucher: BB-1K2L3M4N-XYZ9               │
│ Student: Juan Dela Cruz                 │
│ Course: BSCS 3rd Year                   │
│ Scheduled: Today, 11:00 AM - 1:00 PM    │
│                                         │
│ Student ID Verification:                │
│ ☑ Student presented valid ID            │
│ ☑ Name matches voucher                  │
│ ☑ Within time slot                      │
│                                         │
│ [CONFIRM & SERVE MEAL] ─────────────────┤
│ [CANCEL] ──────────────────────────────┤
└─────────────────────────────────────────┘
```

### 5. Meal Inventory View
```
┌─────────────────────────────────────────┐
│ MEAL INVENTORY STATUS                   │
│                                         │
│ Available Meals: 123                    │
│ Reserved (Active Vouchers): 45          │
│ Claimed Today: 8                        │
│                                         │
│ Upcoming Meals by Date:                 │
│ Today (Jan 15): 20 vouchers             │
│ Tomorrow (Jan 16): 15 vouchers          │
│ Jan 17: 10 vouchers                     │
│                                         │
│ Recent Donations:                       │
│ • Jan 15: +25 meals (Donor: Anonymous) │
│ • Jan 14: +10 meals (Donor: Alumni)    │
│                                         │
│ [EXPORT REPORT] ───────────────────────┤
└─────────────────────────────────────────┘
```

---

## Public Dashboard Flow

### 1. Public Metrics View
```
┌─────────────────────────────────────────┐
│ PIF MEALS TRANSPARENCY DASHBOARD        │
│                                         │
│ 📊 Real-time Impact:                    │
│                                         │
│ [🍽️ 123]  [🤝 45]  [💝 89]  [👥 234]    │
│ Available  Active   Total    Total      │
│ Meals      Pledges  Claimed  Donors     │
│                                         │
│ Recent Activity:                        │
│ • 5 meals claimed today                 │
│ • 12 new pledges this week              │
│ • 25 meals donated yesterday            │
│                                         │
│ "Every meal makes a difference in a     │
│ student's day. Thank you to all donors  │
│ and students paying it forward!"        │
│                                         │
│ [DONATE MEALS] [REQUEST MEAL]           │
└─────────────────────────────────────────┘
```

---

## Mobile Responsive Considerations

All wireframes should be optimized for mobile-first design:
- Stack elements vertically on mobile
- Large touch targets for buttons
- Simplified navigation
- Swipe gestures for image carousels
- Phone number input with proper keyboard
- Camera integration for document upload
- Push notifications for voucher reminders

## Key UX Principles Applied

1. **Simplicity**: Minimal steps from need to meal voucher
2. **Trust**: Clear transparency with public counters
3. **Emotional Connection**: Use empathetic messaging
4. **Social Proof**: Show impact and community participation
5. **Mobile-First**: Primary interface is mobile devices
6. **Accessibility**: Clear contrast, readable fonts, alt text
7. **Real-time Updates**: Live counters and instant feedback
