# Mortgage Calculator Features

## Overview
The PropLytics mortgage calculator has been redesigned with two versions:

1. **Desktop Version** (`/mortgage-calculator`) - Full-featured calculator with PropLytics design system
2. **Mobile Version** (`/mortgage-calculator-mobile`) - Mobile-optimized version matching the reference design

## Features

### Interactive Sliders
- **Mortgage Amount**: Range $100K-$2M with real-time updates
- **Interest Rate**: Range 1-10% with "Find a Rate" link
- **Amortization**: Range 5-30 years with gradient track (red to green)
- **First Payment Date**: Date picker with "Set to Today" option

### Real-time Calculations
- Monthly payment updates instantly as sliders change
- Principal and interest breakdown
- Total payment calculations
- Effective amortization period

### Visual Elements
- **Donut Chart**: Canvas-based pie chart showing principal vs interest
- **Color-coded Legend**: Blue for principal, pink for interest
- **Tab Navigation**: Switch between Payment Summary, Term, and Total views
- **Responsive Design**: Works on both desktop and mobile

### Design System Integration
- Uses PropLytics brand colors (#205A3E)
- Consistent with existing component patterns
- Full dark mode support
- Proper accessibility features

## Usage

### Accessing the Calculators
1. Navigate to `/calculator` in the sidebar
2. Choose between:
   - **Mortgage Calculator** - Desktop version
   - **Mortgage Calculator (Mobile)** - Mobile version

### Desktop Version Features
- Clean, card-based layout
- Information icons with tooltips
- Hover effects and transitions
- Integrated with sidebar navigation

### Mobile Version Features
- Dark theme matching reference design
- Touch-optimized sliders
- Mobile-specific header with back button
- Compact layout for small screens

## Technical Implementation

### Components
- `SliderInput` - Reusable slider component with labels and value display
- `MobileSliderInput` - Mobile-optimized slider variant
- Canvas-based chart rendering
- Real-time calculation engine

### Styling
- Custom CSS for slider appearance
- Dark mode support for charts
- Responsive breakpoints
- PropLytics design system integration

### State Management
- React hooks for form data
- Real-time calculation updates
- Chart re-rendering on data changes
- Dark mode detection and updates

## Browser Support
- Modern browsers with ES6+ support
- Canvas API for chart rendering
- CSS custom properties for theming
- Touch events for mobile interaction

## Future Enhancements
- Additional payment frequency options
- Extra payment calculations
- Amortization schedule view
- Export/share functionality
- Property integration for pre-filled data
