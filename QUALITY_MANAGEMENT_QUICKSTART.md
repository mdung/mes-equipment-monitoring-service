# Quality Management - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Access Quality Management
1. Log in to MES system
2. Click **Quality Management** in sidebar (Award icon 🏆)

### Step 2: Record Your First Defect
1. Click **Defect Management** tab
2. Click **Record Defect** button
3. Fill in:
   ```
   Category: Select from dropdown (e.g., "Dimensional Defect")
   Description: "Part dimension out of spec"
   Quantity: 5
   Location: "Assembly Line 1"
   ```
4. Click **Record Defect**

### Step 3: Create Root Cause Analysis
1. Click **Root Cause Analysis** tab
2. Click **New RCA** button
3. Select the defect you just created
4. Fill in 5 Whys:
   ```
   Problem: "Parts are out of dimensional spec"
   Why 1: "Machine calibration was off"
   Why 2: "Calibration schedule was missed"
   Why 3: "No reminder system in place"
   Why 4: "Maintenance tracking not automated"
   Why 5: "No preventive maintenance system"
   
   Root Cause: "Lack of automated maintenance tracking"
   Corrective Action: "Recalibrate machine immediately"
   Preventive Action: "Implement automated maintenance reminders"
   ```
5. Assign owner and target date
6. Click **Create RCA**

### Step 4: View Quality Trends
1. Click **Quality Trends** tab
2. Select time period (30 days)
3. View:
   - **Pareto Chart**: See which defect categories are most common
   - **Trend Chart**: See defect patterns over time

### Step 5: Monitor with SPC Charts
1. Click **SPC Charts** tab
2. Click **Record Data** button
3. Fill in:
   ```
   Equipment: Select equipment
   Parameter: "Temperature"
   Measured Value: 75.5
   Unit: "°C"
   Upper Control Limit: 80
   Lower Control Limit: 70
   Target: 75
   ```
4. Click **Record Data**
5. View control chart with your data point

## 📊 Common Tasks

### Recording Defects
**When to use**: Found a quality issue during production

**Steps**:
1. Defect Management → Record Defect
2. Select category (severity auto-assigned)
3. Enter description and quantity
4. Link to production order (optional)
5. Submit

**Result**: Defect tracked, statistics updated, appears in trends

### Performing Root Cause Analysis
**When to use**: Need to investigate why defects occurred

**Steps**:
1. Root Cause Analysis → New RCA
2. Select defect to analyze
3. Ask "Why?" 5 times
4. Document root cause
5. Plan corrective and preventive actions
6. Assign owner and deadline

**Result**: Systematic problem-solving, action plan created

### Viewing Pareto Charts
**When to use**: Want to prioritize which defects to address first

**Steps**:
1. Quality Trends → View Pareto Chart
2. Select time period
3. Identify top categories (80/20 rule)

**Result**: Focus on high-impact defects

### Monitoring Process with SPC
**When to use**: Need to ensure process stays in control

**Steps**:
1. SPC Charts → Select equipment and parameter
2. Record measurements regularly
3. Monitor for out-of-control points
4. Investigate when limits are exceeded

**Result**: Early detection of process issues

## 🎯 Quick Tips

✅ **Record defects immediately** - Don't wait, capture while fresh

✅ **Use correct severity** - CRITICAL for safety/function, MAJOR for performance, MINOR for cosmetic

✅ **Complete 5 Whys** - Don't stop at surface causes, dig deeper

✅ **Set realistic targets** - RCA completion dates should be achievable

✅ **Monitor SPC daily** - Regular monitoring prevents issues

✅ **Review Pareto weekly** - Focus improvement efforts on top defects

✅ **Link to orders** - Traceability helps with investigations

✅ **Update RCA status** - Keep team informed of progress

## 📈 Dashboard Overview

### Defect Management
- 📊 Statistics: Total, Critical, Open defects
- 📝 Table: All recent defects with details
- 🎨 Color-coded severity levels
- 🔄 Status workflow tracking

### Root Cause Analysis
- 🔍 5 Whys framework
- 📋 Problem statement
- 🎯 Root cause identification
- ✅ Action planning
- 👤 Owner assignment

### Quality Trends
- 📊 Pareto chart (bar + cumulative line)
- 📈 Trend line chart
- 📅 Time period selection
- 🔢 Total defect counts

### SPC Charts
- 📉 Control chart with limits
- 🎯 Target value line
- ⚠️ Out-of-control alerts
- 📊 Multiple parameters
- 🔴 UCL/LCL visualization

## 🎓 Understanding the Features

### Defect Severity Levels
```
🔴 CRITICAL - Safety or functional issues
   Example: Product doesn't work, safety hazard

🟠 MAJOR - Performance or quality issues
   Example: Reduced performance, appearance defects

🟡 MINOR - Cosmetic or minor issues
   Example: Small scratches, minor blemishes
```

### Defect Status Workflow
```
OPEN → INVESTIGATING → RESOLVED → CLOSED

OPEN: Defect just recorded
INVESTIGATING: Root cause analysis in progress
RESOLVED: Solution implemented
CLOSED: Verified and closed
```

### RCA Status
```
OPEN: RCA started
IN_PROGRESS: Analysis ongoing
COMPLETED: Actions implemented
VERIFIED: Effectiveness confirmed
```

### SPC Control Limits
```
USL (Upper Spec Limit) - Maximum acceptable value
UCL (Upper Control Limit) - Process variation limit
Target - Ideal value
LCL (Lower Control Limit) - Process variation limit
LSL (Lower Spec Limit) - Minimum acceptable value
```

## 🔧 Default Defect Categories

Pre-loaded categories you can use immediately:

1. **Dimensional Defect (DIM)** - MAJOR
   - Parts outside dimensional specifications

2. **Surface Defect (SUR)** - MINOR
   - Surface finish or appearance issues

3. **Material Defect (MAT)** - CRITICAL
   - Material composition or quality issues

4. **Assembly Defect (ASM)** - MAJOR
   - Incorrect assembly or missing components

5. **Functional Defect (FUN)** - CRITICAL
   - Product does not function as intended

6. **Cosmetic Defect (COS)** - MINOR
   - Aesthetic issues that don't affect function

7. **Packaging Defect (PKG)** - MINOR
   - Packaging damage or incorrect packaging

8. **Labeling Defect (LBL)** - MAJOR
   - Incorrect or missing labels

## 📱 Navigation Quick Reference

```
Quality Management
├── Quality Control Plans (Create quality standards)
├── Inspection Checklists (Define inspection procedures)
├── Defect Management (Record and track defects)
├── Root Cause Analysis (Investigate problems)
├── Quality Trends (View Pareto and trends)
└── SPC Charts (Monitor process control)
```

## 🎯 Best Practices

### Daily Tasks
- [ ] Record defects as they occur
- [ ] Review open defects
- [ ] Record SPC measurements
- [ ] Check for out-of-control points

### Weekly Tasks
- [ ] Review Pareto chart
- [ ] Update RCA status
- [ ] Analyze quality trends
- [ ] Prioritize improvement actions

### Monthly Tasks
- [ ] Review all open RCAs
- [ ] Analyze 90-day trends
- [ ] Update quality control plans
- [ ] Review defect categories

## 🆘 Troubleshooting

**Can't see defects?**
- Check time period selection
- Verify defects were recorded
- Refresh the page

**Pareto chart empty?**
- Need at least one defect recorded
- Check selected time period
- Verify defect categories assigned

**SPC chart not showing?**
- Select equipment first
- Select parameter second
- Record at least one data point

**RCA not saving?**
- Fill in required fields (problem statement)
- Select a defect
- Check form validation

## 📞 Need Help?

1. **Check this guide** for common tasks
2. **Review tooltips** in the interface
3. **Check API responses** in browser console
4. **Verify data** in database
5. **Contact support** if issues persist

## 🎉 Success Metrics

Track your quality improvement:
- **Defect Reduction**: Monitor total defects over time
- **RCA Completion**: Track action completion rate
- **Process Control**: Reduce out-of-control points
- **Top Defects**: Focus on Pareto top 20%

---

**Pro Tip**: Start with defect recording, then add RCA for critical defects, and use SPC for key process parameters. Build your quality system incrementally!

**Ready to improve quality? Start with Step 1 above!** 🚀
