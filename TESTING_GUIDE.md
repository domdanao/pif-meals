# PIF Meals - Testing Guide

## 🚀 Current System Status

✅ **READY TO TEST:**
- Landing page with live metrics
- Student meal request flow (2-step process)
- Database with test data

🚧 **COMING SOON:**
- Voucher display page
- Staff interface
- Donor payment system

---

## 🧪 Test the Live System

### 1. View the Landing Page
**URL:** `http://pif-meals.test`

**What to check:**
- Beautiful PIF Meals landing page loads
- Live metrics showing: 10 available meals, 0 pledges, 0 claimed, 0 donors
- "CLICK TO AVAIL MEAL" button works
- Responsive design on mobile/desktop

### 2. Test Student Meal Request Flow
**URL:** `http://pif-meals.test/students/request-meal`

**Step 1 - Student Information:**
```
Name: Juan Dela Cruz
Email: juan@up.edu.ph  
Phone: 09123456789
Course: BS Computer Science
Year Level: 3rd Year
Student ID: 2021-12345
Proof of Enrollment: Upload any PDF/image file
```

**Step 2 - Schedule Meal:**
- Select any date from tomorrow onwards
- Choose either 11am-1pm or 5pm-7pm time slot
- Click "Request Meal"

**Expected Result:**
- Form validation works
- File upload functions
- Step progression works smoothly
- Redirect to voucher page (currently will show error until we build it)

### 3. Check Database Impact
After submitting a meal request:
- Available meals counter should decrease by 1 (10 → 9)
- New user created in database
- New voucher generated with reference number
- Meal inventory status changes to "reserved"

---

## 🗃️ Database Test Data

### Default Users
```
Staff Account:
- Email: staff@bannedbooks.ph
- Password: password123
- Role: staff

Admin Account:  
- Email: admin@pifmeals.ph
- Password: admin123
- Role: admin
```

### Test Meal Inventory
- **10 available meals** funded by test donation
- Each meal worth ₱65 in ingredients
- All meals have "available" status initially

### Time Slots
- **Slot 1:** 11:00 AM - 1:00 PM (11am - 1pm)
- **Slot 2:** 5:00 PM - 7:00 PM (5pm - 7pm)

---

## 🐛 Known Issues & Workarounds

### Issue 1: Voucher Display Page Missing
**Problem:** After meal request, redirect fails because voucher display page doesn't exist yet
**Workaround:** Check database directly to confirm voucher was created

### Issue 2: File Upload Storage
**Problem:** Uploaded files go to storage/app/public but may not be web-accessible
**Workaround:** Run `php artisan storage:link` to create symlink

### Issue 3: Route Helper Missing  
**Problem:** `route()` helper not available in React components
**Status:** Fixed by using direct URLs instead

---

## 🔧 Development Commands

### Reset Database
```bash
php artisan migrate:fresh --seed
```

### Build Frontend
```bash
npm run build
```

### Start Dev Server (if needed)
```bash
npm run dev
```

### Check Storage Links
```bash
php artisan storage:link
```

---

## 📊 Testing Scenarios

### Scenario 1: Happy Path Student Request
1. Student visits landing page
2. Clicks "AVAIL MEAL" 
3. Fills complete form with valid data
4. Uploads valid proof of enrollment
5. Selects tomorrow's date and lunch slot
6. Submits successfully
7. Gets voucher (will error for now)

### Scenario 2: Form Validation
1. Try submitting with empty required fields
2. Upload invalid file types (.txt, .exe, etc.)
3. Upload file larger than 5MB
4. Try selecting today's date (should be blocked)
5. Verify error messages display properly

### Scenario 3: Multiple Student Requests
1. Submit several meal requests
2. Watch available meals counter decrease
3. Verify each gets unique reference number
4. Check database for proper record creation

### Scenario 4: Meal Inventory Depletion
1. Submit 10 meal requests (using up all inventory)
2. Try 11th request - should show "no meals available" error
3. Verify counter shows 0 available meals

---

## 🎯 Next Development Priorities

1. **Voucher Display Page** - Show generated voucher to student
2. **Pay-It-Forward Pledge Prompt** - After voucher generation
3. **Staff Login & Dashboard** - For Banned Books team
4. **Voucher Verification Interface** - For staff to mark claimed
5. **Donor Payment System** - To fund more meals

---

## 📝 Test Results Template

**Date:** _____
**Tester:** _____

| Feature | Status | Notes |
|---------|--------|-------|
| Landing page loads | ⬜ Pass / ⬜ Fail | |
| Student form - Step 1 | ⬜ Pass / ⬜ Fail | |
| File upload works | ⬜ Pass / ⬜ Fail | |
| Student form - Step 2 | ⬜ Pass / ⬜ Fail | |
| Form validation | ⬜ Pass / ⬜ Fail | |
| Database updates | ⬜ Pass / ⬜ Fail | |
| Metrics counter | ⬜ Pass / ⬜ Fail | |

**Overall System:** ⬜ Working ⬜ Issues found

**Issues Discovered:**
- 
- 
- 

**Suggestions:**
-
-
-

---

## 🏆 Success Criteria

The current system is working correctly if:

✅ Landing page displays beautifully with live metrics  
✅ Student can complete 2-step meal request form  
✅ File upload accepts PDF/image files under 5MB  
✅ Form validation prevents invalid submissions  
✅ Database creates user, voucher, and updates inventory  
✅ Available meals counter decreases after each request  
✅ System handles multiple concurrent requests properly  

**Ready for next phase when all criteria are met!** 🚀
