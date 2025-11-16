# Analytics Page Baseline Design

**Last Updated:** Current session
**Source Directory:** `proplytics-app/src/` (This is the active Next.js app root)

## ⚠️ IMPORTANT: File Location
- **ALWAYS edit files in:** `proplytics-app/src/`
- **DO NOT edit files in:** `src/` (this is a duplicate/old directory)
- The dev server runs from `proplytics-app/` directory

## Current Baseline Design Features

### 1. Analytics Page Structure (`proplytics-app/src/app/analytics/page.jsx`)
- Uses `AssumptionsPanel` component (NOT AssumptionsBar)
- Property selection with thumbnails (PropertySelectCard component)
- Three tabs: Sensitivity Analysis, Scenario Analysis, Insights
- All major sections are dropdowns
- AssumptionsPanel above BaselineForecast chart
- SavedScenariosPanel, SensitivityDashboard, and YoYAnalysis as dropdowns below

### 2. AssumptionsPanel (`proplytics-app/src/components/calculators/AssumptionsPanel.jsx`)
- **Layout:**
  - Preset Templates and Analysis Mode in same row (grid layout)
  - Input fields in single horizontal row
  - Compact Save Scenario button (inline, small size)
  
- **Preset Templates:**
  - Conservative, Moderate, Aggressive
  - Displayed as pills with icons
  
- **Analysis Mode:**
  - Custom Analysis, Rent Change, Expense Change, Unit Vacancy
  - Displayed as pills with icons

### 3. BaselineForecast (`proplytics-app/src/components/calculators/BaselineForecast.jsx`)
- Compact metric toggle buttons (Net Cash Flow, Mortgage Balance, Total Equity)
- Buttons show only title, no values
- Chart with toggleable metrics
- Export functionality

### 4. SavedScenariosPanel (`proplytics-app/src/components/calculators/SavedScenariosPanel.jsx`)
- **Dropdown format** with:
  - Header button showing scenario count or current scenario name
  - TrendingUp icon
  - ChevronDown icon that rotates
  - Default state: open (isOpen: true)

### 5. SensitivityDashboard (`proplytics-app/src/components/calculators/SensitivityDashboard.jsx`)
- **Dropdown format** with:
  - Header button with Target icon
  - ChevronDown icon that rotates
  - Default state: open (isOpen: true)
  - Comparison metrics displayed when open

### 6. YoYAnalysis (`proplytics-app/src/components/calculators/YoYAnalysis.jsx`)
- **Dropdown format** with:
  - Header button with TrendingUp icon
  - ChevronDown icon that rotates
  - Default state: open (isOpen: true)

## Key Design Principles
1. All major sections are collapsible dropdowns
2. Compact, streamlined UI elements
3. Single-row layouts where possible
4. Consistent icon usage (lucide-react)
5. Clean, elevated, precise aesthetic

## Files to Always Check Before Making Changes
1. `proplytics-app/src/app/analytics/page.jsx` - Main analytics page
2. `proplytics-app/src/components/calculators/AssumptionsPanel.jsx` - Assumptions component
3. `proplytics-app/src/components/calculators/BaselineForecast.jsx` - Forecast chart
4. `proplytics-app/src/components/calculators/SavedScenariosPanel.jsx` - Saved scenarios dropdown
5. `proplytics-app/src/components/calculators/SensitivityDashboard.jsx` - Sensitivity dropdown
6. `proplytics-app/src/components/calculators/YoYAnalysis.jsx` - YoY analysis dropdown

## Common Issues to Avoid
- ❌ Editing files in `src/` instead of `proplytics-app/src/`
- ❌ Using AssumptionsBar instead of AssumptionsPanel
- ❌ Reverting to sidebar layouts instead of dropdowns
- ❌ Making sections full-width instead of compact
- ❌ Adding back removed features (like step numbers, old property selector)

## Verification Checklist
Before considering changes complete, verify:
- [ ] Changes are in `proplytics-app/src/` directory
- [ ] Analytics page uses AssumptionsPanel (not AssumptionsBar)
- [ ] All three sections (SavedScenariosPanel, SensitivityDashboard, YoYAnalysis) are dropdowns
- [ ] Preset Templates and Analysis Mode are in same row
- [ ] Input fields are in single horizontal row
- [ ] Save Scenario button is compact (inline, small)
- [ ] Metric toggle buttons show only titles

