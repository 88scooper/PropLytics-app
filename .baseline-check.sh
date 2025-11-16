#!/bin/bash
# Quick check to verify we're working in the correct directory
# Run this before making changes: bash .baseline-check.sh

echo "🔍 Analytics Baseline Verification"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: package.json not found. Are you in proplytics-app directory?"
    exit 1
fi

echo "✅ Found package.json - correct directory"
echo ""

# Check key files exist
FILES=(
    "src/app/analytics/page.jsx"
    "src/components/calculators/AssumptionsPanel.jsx"
    "src/components/calculators/BaselineForecast.jsx"
    "src/components/calculators/SavedScenariosPanel.jsx"
    "src/components/calculators/SensitivityDashboard.jsx"
    "src/components/calculators/YoYAnalysis.jsx"
)

echo "Checking key files:"
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file - MISSING!"
    fi
done

echo ""
echo "📋 Remember:"
echo "  - Always edit files in: proplytics-app/src/"
echo "  - Never edit files in: src/ (duplicate directory)"
echo "  - Use AssumptionsPanel (not AssumptionsBar)"
echo "  - All sections should be dropdowns"
echo ""

