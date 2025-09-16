# Proplytics Web Application - Manual Test Plan

## Overview
This comprehensive manual test plan covers all features and functionality of the Proplytics real estate investment management application. Follow this checklist systematically to ensure the application is bug-free, functional, and user-friendly before launch.

---

## 1. Authentication Flow

### 1.1 Signup Process
- [ ] **Action**: Navigate to homepage and click "Sign up" button
- [ ] **Expected Result**: Signup modal opens with email and password fields

- [ ] **Action**: Enter valid email format (e.g., test@example.com) and matching passwords
- [ ] **Expected Result**: Account creation succeeds, success toast appears, redirects to portfolio summary

- [ ] **Action**: Enter invalid email format (e.g., "invalid-email")
- [ ] **Expected Result**: Error message appears: "Please enter a valid email address"

- [ ] **Action**: Enter valid email but mismatched passwords
- [ ] **Expected Result**: Error message appears about password mismatch

- [ ] **Action**: Enter existing email address
- [ ] **Expected Result**: Error message: "An account with this email already exists"

- [ ] **Action**: Enter password less than 6 characters
- [ ] **Expected Result**: Error message: "Password should be at least 6 characters long"

- [ ] **Action**: Click "X" or outside modal to close signup
- [ ] **Expected Result**: Modal closes without creating account

### 1.2 Login Process
- [ ] **Action**: Navigate to homepage and click "Log in" button
- [ ] **Expected Result**: Login modal opens with email and password fields

- [ ] **Action**: Enter correct credentials (demo@proplytics.com / any password)
- [ ] **Expected Result**: Login succeeds, success toast appears, redirects to portfolio summary

- [ ] **Action**: Enter incorrect email address
- [ ] **Expected Result**: Error message: "No account found with this email address"

- [ ] **Action**: Enter correct email but wrong password
- [ ] **Expected Result**: Error message: "Incorrect password. Please try again"

- [ ] **Action**: Enter invalid email format
- [ ] **Expected Result**: Error message: "Please enter a valid email address"

- [ ] **Action**: Click "Switch to Signup" link in login modal
- [ ] **Expected Result**: Login modal closes, signup modal opens

### 1.3 Logout Process
- [ ] **Action**: While logged in, click user profile icon in header
- [ ] **Expected Result**: User dropdown menu opens

- [ ] **Action**: Click "Sign Out" button
- [ ] **Expected Result**: User is logged out, redirected to homepage, success toast appears

### 1.4 Protected Routes
- [ ] **Action**: While logged out, try to navigate to `/portfolio-summary`
- [ ] **Expected Result**: User is redirected to login page or homepage

- [ ] **Action**: While logged out, try to navigate to `/my-properties`
- [ ] **Expected Result**: User is redirected to login page or homepage

- [ ] **Action**: While logged out, try to navigate to `/calculator`
- [ ] **Expected Result**: User is redirected to login page or homepage

- [ ] **Action**: While logged out, try to navigate to `/data`
- [ ] **Expected Result**: User is redirected to login page or homepage

- [ ] **Action**: While logged out, try to navigate to `/calendar`
- [ ] **Expected Result**: User is redirected to login page or homepage

---

## 2. Homepage & Global UI

### 2.1 Modal Functionality
- [ ] **Action**: Click "Log in" button on homepage
- [ ] **Expected Result**: Login modal opens with proper styling and form fields

- [ ] **Action**: Click "Sign up" button on homepage
- [ ] **Expected Result**: Signup modal opens with proper styling and form fields

- [ ] **Action**: Click "X" button in modal
- [ ] **Expected Result**: Modal closes immediately

- [ ] **Action**: Click outside modal area
- [ ] **Expected Result**: Modal closes immediately

- [ ] **Action**: Press Escape key while modal is open
- [ ] **Expected Result**: Modal closes immediately

### 2.2 Header Navigation
- [ ] **Action**: Click "Proplytics" logo in header
- [ ] **Expected Result**: Navigates to homepage

- [ ] **Action**: Click "Features" link in header
- [ ] **Expected Result**: Page scrolls to features section

- [ ] **Action**: Click "Get Started" link in header
- [ ] **Expected Result**: Page scrolls to CTA section

- [ ] **Action**: Click "Log in" button in header
- [ ] **Expected Result**: Login modal opens

- [ ] **Action**: Click "Sign up" button in header
- [ ] **Expected Result**: Signup modal opens

### 2.3 Dark/Light Mode Toggle
- [ ] **Action**: Click theme toggle button in user menu (while logged in)
- [ ] **Expected Result**: Theme switches between light and dark mode

- [ ] **Action**: Refresh page after changing theme
- [ ] **Expected Result**: Selected theme persists after page refresh

- [ ] **Action**: Test theme toggle on homepage (if available)
- [ ] **Expected Result**: Theme changes apply to entire page

- [ ] **Action**: Test theme toggle on portfolio summary page
- [ ] **Expected Result**: Theme changes apply to entire page including sidebar

### 2.4 Responsiveness
- [ ] **Action**: View homepage on desktop (1920x1080)
- [ ] **Expected Result**: Layout displays properly with all elements visible

- [ ] **Action**: View homepage on tablet (768x1024)
- [ ] **Expected Result**: Layout adapts appropriately, navigation may collapse

- [ ] **Action**: View homepage on mobile (375x667)
- [ ] **Expected Result**: Mobile-optimized layout, hamburger menu appears

- [ ] **Action**: Test hamburger menu on mobile
- [ ] **Expected Result**: Menu opens/closes properly, all links accessible

---

## 3. Portfolio Summary Page (/portfolio-summary)

### 3.1 Data Accuracy
- [ ] **Action**: Navigate to portfolio summary page
- [ ] **Expected Result**: Page loads with all metric cards displaying data

- [ ] **Action**: Verify "Total Estimated Portfolio Value" card
- [ ] **Expected Result**: Shows calculated value based on property data (should be around $2.4M)

- [ ] **Action**: Verify "Monthly Net Cash Flow" card
- [ ] **Expected Result**: Shows positive cash flow amount (should be around $5,000+)

- [ ] **Action**: Verify "Total Properties" card
- [ ] **Expected Result**: Shows "3" properties

- [ ] **Action**: Verify "Average Occupancy Rate" card
- [ ] **Expected Result**: Shows 100% occupancy rate

- [ ] **Action**: Verify "Average Cap Rate" card
- [ ] **Expected Result**: Shows calculated cap rate percentage

### 3.2 Tooltips
- [ ] **Action**: Hover over info icon next to "Total Estimated Portfolio Value"
- [ ] **Expected Result**: Tooltip appears with descriptive text

- [ ] **Action**: Hover over info icon next to "Monthly Net Cash Flow"
- [ ] **Expected Result**: Tooltip appears with descriptive text

- [ ] **Action**: Hover over info icon next to "Average Cap Rate"
- [ ] **Expected Result**: Tooltip appears with descriptive text

- [ ] **Action**: Move mouse away from tooltip
- [ ] **Expected Result**: Tooltip disappears

### 3.3 Dashboard Customization
- [ ] **Action**: Click gear icon in top-right corner
- [ ] **Expected Result**: Settings dropdown opens with metric list

- [ ] **Action**: Uncheck a visible metric (e.g., "Total Mortgage Debt")
- [ ] **Expected Result**: Metric disappears from dashboard

- [ ] **Action**: Check a hidden metric
- [ ] **Expected Result**: Metric appears on dashboard

- [ ] **Action**: Drag and drop a metric to reorder
- [ ] **Expected Result**: Metric moves to new position, order is preserved

- [ ] **Action**: Click outside settings dropdown
- [ ] **Expected Result**: Dropdown closes

### 3.4 ROI Time Period Selection
- [ ] **Action**: Click on ROI dropdown (if available)
- [ ] **Expected Result**: Dropdown opens with time period options

- [ ] **Action**: Select different time period (e.g., 5 years)
- [ ] **Expected Result**: ROI value updates to reflect selected period

### 3.5 Schedule Card
- [ ] **Action**: Look for schedule/events section on portfolio summary
- [ ] **Expected Result**: Events are displayed if available

- [ ] **Action**: Test date range dropdown (30, 60, 90 days) if present
- [ ] **Expected Result**: Events update based on selected range

---

## 4. Property Management Flow

### 4.1 My Properties Page (/my-properties)
- [ ] **Action**: Navigate to "My Properties" from sidebar
- [ ] **Expected Result**: Page loads showing 3 property cards

- [ ] **Action**: Verify all three properties are displayed:
  - Richmond St E (311 Richmond St E)
  - Tretti Way (30 Tretti Way)
  - Wilson Ave (Wilson Ave)
- [ ] **Expected Result**: All property cards show correct addresses and basic info

- [ ] **Action**: Click on "Richmond St E" property card
- [ ] **Expected Result**: Navigates to `/my-properties/richmond-st-e-403`

- [ ] **Action**: Click on "Tretti Way" property card
- [ ] **Expected Result**: Navigates to `/my-properties/tretti-way-403`

- [ ] **Action**: Click on "Wilson Ave" property card
- [ ] **Expected Result**: Navigates to `/my-properties/wilson-ave-403`

- [ ] **Action**: Click "Add New Property" button
- [ ] **Expected Result**: Button responds (may show console log or open form)

### 4.2 Property Detail Pages (/my-properties/[propertyId])
- [ ] **Action**: Navigate to Richmond St E property detail page
- [ ] **Expected Result**: Page loads with correct property image and details

- [ ] **Action**: Verify property details are displayed:
  - Address: 403-311 Richmond St E, Toronto, ON M5A4S8
  - Purchase Price: $615,000
  - Market Value: $800,000
  - Monthly Rent: $3,450
- [ ] **Expected Result**: All details match expected values

- [ ] **Action**: Test "Upload Photo" functionality
- [ ] **Expected Result**: File picker opens or upload interface appears

- [ ] **Action**: Verify layout is clean and all data sections are present
- [ ] **Expected Result**: Property info, financial details, and tenant info are well-organized

- [ ] **Action**: Navigate to other property detail pages
- [ ] **Expected Result**: Each page shows correct property-specific data

---

## 5. Data & Calendar Pages

### 5.1 Data Page (/data)
- [ ] **Action**: Navigate to "Data" from sidebar
- [ ] **Expected Result**: Page loads with property selection dropdown

- [ ] **Action**: Test property selection dropdown
- [ ] **Expected Result**: Dropdown shows available properties

- [ ] **Action**: Select a property from dropdown
- [ ] **Expected Result**: Property data populates in form fields

- [ ] **Action**: Click "Download Excel" button
- [ ] **Expected Result**: Excel file downloads or download process initiates

- [ ] **Action**: Click "Upload Excel" button
- [ ] **Expected Result**: File upload interface appears

- [ ] **Action**: Test form field inputs
- [ ] **Expected Result**: All form fields accept input and validate properly

### 5.2 Calendar Page (/calendar)
- [ ] **Action**: Navigate to "Calendar" from sidebar
- [ ] **Expected Result**: Calendar page loads with month view

- [ ] **Action**: Verify existing events are displayed
- [ ] **Expected Result**: Sample events show on calendar (Property Tax Due, Insurance Renewal, etc.)

- [ ] **Action**: Click on a date with events
- [ ] **Expected Result**: Events for that date are highlighted or shown in sidebar

- [ ] **Action**: Click on a date without events
- [ ] **Expected Result**: Date is selected, form is ready for new event

- [ ] **Action**: Fill out "Add Event" form with:
  - Date: Select future date
  - Time: Enter time (optional)
  - Description: "Test Event"
  - Property: Select from dropdown
  - Notify: Check/uncheck
- [ ] **Expected Result**: Form accepts all inputs

- [ ] **Action**: Submit the event form
- [ ] **Expected Result**: Event is added to calendar, success toast appears

- [ ] **Action**: Click "Add to Calendar" button for existing event
- [ ] **Expected Result**: .ics file downloads for calendar import

- [ ] **Action**: Test month navigation (previous/next)
- [ ] **Expected Result**: Calendar updates to show different months

- [ ] **Action**: Delete an existing event
- [ ] **Expected Result**: Event is removed, success toast appears

---

## 6. Financial Calculators (/calculator)

### 6.1 Calculator Navigation
- [ ] **Action**: Navigate to "Calculator" from sidebar
- [ ] **Expected Result**: Calculator page loads with list of available calculators

- [ ] **Action**: Verify all calculators are listed:
  - Mortgage Calculator (Desktop)
  - Mortgage Calculator (Mobile)
  - Refinance Calculator
  - Mortgage Break Calculator
  - HELOC Calculator
- [ ] **Expected Result**: All calculators are visible and properly labeled

### 6.2 Property Selection
- [ ] **Action**: Select a property from the dropdown
- [ ] **Expected Result**: Property data populates across all calculators

- [ ] **Action**: Clear property selection
- [ ] **Expected Result**: All calculator fields are cleared

### 6.3 Mortgage Calculator (Desktop)
- [ ] **Action**: Click on "Mortgage Calculator" link
- [ ] **Expected Result**: Navigates to dedicated mortgage calculator page

- [ ] **Action**: Test interactive sliders:
  - Mortgage Amount: $100K-$2M range
  - Interest Rate: 1-10% range
  - Amortization: 5-30 years
- [ ] **Expected Result**: Sliders move smoothly, values update in real-time

- [ ] **Action**: Verify donut chart displays
- [ ] **Expected Result**: Chart shows principal vs interest breakdown

- [ ] **Action**: Test tab navigation (Payment Summary, Term, Total)
- [ ] **Expected Result**: Tabs switch content appropriately

### 6.4 Mortgage Calculator (Mobile)
- [ ] **Action**: Click on "Mortgage Calculator (Mobile)" link
- [ ] **Expected Result**: Navigates to mobile-optimized version

- [ ] **Action**: Test touch-optimized sliders
- [ ] **Expected Result**: Sliders respond to touch input

- [ ] **Action**: Verify mobile-specific header with back button
- [ ] **Expected Result**: Back button navigates to calculator list

### 6.5 Refinance Calculator
- [ ] **Action**: Click to expand Refinance Calculator
- [ ] **Expected Result**: Calculator form opens with input fields

- [ ] **Action**: Enter sample data:
  - Current Balance: $400,000
  - Remaining Years: 20
  - Current Rate: 5.5%
  - New Rate: 4.5%
  - Refi Cost: $3,000
- [ ] **Expected Result**: Calculations update automatically

- [ ] **Action**: Verify results show:
  - Current vs New Payment
  - Monthly Savings
  - Break-even period
  - Interest Savings
- [ ] **Expected Result**: All calculations appear logical and accurate

### 6.6 Mortgage Break Calculator
- [ ] **Action**: Click to expand Mortgage Break Calculator
- [ ] **Expected Result**: Calculator form opens

- [ ] **Action**: Enter sample data:
  - Remaining Balance: $400,000
  - Contract Rate: 5.5%
  - Comparison Rate: 3.5%
  - Months Remaining: 24
- [ ] **Expected Result**: Penalty calculations update automatically

- [ ] **Action**: Verify results show:
  - Three Months Interest
  - Interest Rate Differential
  - Estimated Penalty (higher of the two)
- [ ] **Expected Result**: Penalty calculation appears accurate

### 6.7 HELOC Calculator
- [ ] **Action**: Click to expand HELOC Calculator
- [ ] **Expected Result**: Calculator form opens

- [ ] **Action**: Enter sample data:
  - Property Value: $800,000
  - Current Balance: $400,000
  - HELOC Rate: 7.5%
- [ ] **Expected Result**: HELOC calculations update automatically

- [ ] **Action**: Verify results show:
  - Available HELOC amount
  - Monthly Interest Payment
  - 10-Year Interest Cost
- [ ] **Expected Result**: Calculations appear logical (80% of value minus current balance)

---

## 7. Analytics Page (/analytics)

### 7.1 Analytics Overview
- [ ] **Action**: Navigate to "Analytics" from sidebar
- [ ] **Expected Result**: Analytics page loads

- [ ] **Action**: Verify "Charts and insights coming soon" message
- [ ] **Expected Result**: Placeholder content is displayed

- [ ] **Action**: Test "Keep vs. Sell Scenario Analysis" section
- [ ] **Expected Result**: Section is visible with "Start Analysis" button

- [ ] **Action**: Click "Start Analysis" button
- [ ] **Expected Result**: Button responds (may show console log)

---

## 8. Final Polish

### 8.1 Cross-Browser Testing
- [ ] **Action**: Open application in Chrome
- [ ] **Expected Result**: All features work correctly, no layout issues

- [ ] **Action**: Open application in Safari
- [ ] **Expected Result**: All features work correctly, no layout issues

- [ ] **Action**: Open application in Firefox
- [ ] **Expected Result**: All features work correctly, no layout issues

- [ ] **Action**: Test responsive design in each browser
- [ ] **Expected Result**: Layout adapts properly on different screen sizes

### 8.2 Console Error Check
- [ ] **Action**: Open browser developer console (F12)
- [ ] **Expected Result**: Console opens without errors

- [ ] **Action**: Navigate through all main pages while monitoring console
- [ ] **Expected Result**: No red error messages appear

- [ ] **Action**: Test all interactive features while monitoring console
- [ ] **Expected Result**: No JavaScript errors occur

- [ ] **Action**: Check for any warning messages
- [ ] **Expected Result**: Warnings are noted but don't break functionality

### 8.3 Performance Check
- [ ] **Action**: Test page load times on main pages
- [ ] **Expected Result**: Pages load within reasonable time (< 3 seconds)

- [ ] **Action**: Test calculator responsiveness
- [ ] **Expected Result**: Calculations update quickly when inputs change

- [ ] **Action**: Test image loading on property pages
- [ ] **Expected Result**: Property images load properly

### 8.4 Accessibility Check
- [ ] **Action**: Test keyboard navigation (Tab key)
- [ ] **Expected Result**: All interactive elements are accessible via keyboard

- [ ] **Action**: Test form labels and ARIA attributes
- [ ] **Expected Result**: Screen readers can understand form elements

- [ ] **Action**: Check color contrast in both light and dark modes
- [ ] **Expected Result**: Text is readable against backgrounds

---

## Test Completion Checklist

- [ ] All authentication flows tested and working
- [ ] All main pages load without errors
- [ ] All interactive features respond correctly
- [ ] Data displays accurately across all pages
- [ ] Calculators produce logical results
- [ ] Responsive design works on all screen sizes
- [ ] Dark/light mode toggle functions properly
- [ ] No console errors or warnings
- [ ] Cross-browser compatibility verified
- [ ] All navigation links work correctly

---

## Notes for Testers

1. **Demo Mode**: The application currently runs in demo mode with mock authentication. Use any email/password combination to log in.

2. **Sample Data**: The application uses predefined property data for testing. All calculations should be based on this sample data.

3. **Browser Compatibility**: Test in at least Chrome and Safari. Firefox testing is recommended but not critical.

4. **Mobile Testing**: Focus on responsive design rather than full mobile app functionality.

5. **Error Handling**: Pay attention to error messages and ensure they are user-friendly and helpful.

6. **Performance**: Note any slow loading times or unresponsive interactions.

7. **Data Persistence**: Some features may not persist data between sessions in demo mode.

---

**Test Plan Version**: 1.0  
**Last Updated**: [Current Date]  
**Prepared By**: QA Team  
**Application Version**: Proplytics v1.0
