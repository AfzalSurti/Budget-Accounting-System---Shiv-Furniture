# Auto-Analytic Seed Data Summary

## Overview

The seed file has been enhanced with comprehensive auto-analytic rules to properly test the cost center assignment feature. Now you'll see different products, categories, contacts, and tags triggering different analytic accounts.

---

## 📦 Product Categories Added

1. **Living Room Furniture** (furnitureCategory)
2. **Office Furniture** (officeCategory)
3. **Outdoor & Garden** (outdoorCategory)
4. **Accessories & Hardware** (accessoriesCategory)

---

## 🏷️ Contact Tags Added

1. **Premium Client** (premiumTag)
2. **Corporate** (corporateTag)
3. **Wholesale** (wholesaleTag)
4. **Event Sponsor** (eventTag)

---

## 👥 Special Contacts Added

### Vendors

- **Premium Wood Importers** (premiumVendor) - Tagged: Premium Client
- **Grand Exhibition Co.** (eventVendor) - Tagged: Event Sponsor

### Customers

- **TechCorp Solutions** (corporateCustomer) - Tagged: Corporate
- **Wholesale Furniture Hub** (wholesaleCustomer) - Tagged: Wholesale

---

## 📦 Products Added

1. **Sheesham 3-Seater Sofa** (SKU: LRF-001) - Category: Living Room Furniture
2. **Teak Executive Desk** (SKU: OFF-001) - Category: Office Furniture
3. **Ergo Study Chair** (SKU: OFF-002) - Category: Office Furniture
4. **Garden Teak Bench** (SKU: OUT-001) - Category: Outdoor & Garden
5. **Brass Cabinet Hinge** (SKU: ACC-001) - Category: Accessories & Hardware
6. **Marble Coffee Table** (SKU: LRF-002) - Category: Living Room Furniture

---

## 💼 Analytic Accounts (Cost Centers) Added

1. **Manufacturing** (CC-100) - manufacturingCC
2. **Sales & Marketing** (CC-200) - salesCC
3. **Administration** (CC-300) - adminCC
4. **Operations** (CC-400) - operationsCC
5. **Corporate Sales** (CC-210) - corporateSalesCC
6. **Retail Sales** (CC-220) - retailSalesCC
7. **Events & Sponsorships** (CC-600) - eventsCC
8. **R&D** (CC-500) - rndCC

---

## 🎯 Auto-Analytic Rules Created

### Vendor Bill & Purchase Order Rules

| Priority | Match Criteria                   | Assigned Cost Center  | Rule Logic                                 |
| -------- | -------------------------------- | --------------------- | ------------------------------------------ |
| 5        | Contact: Premium Wood Importers  | R&D                   | Highest priority - specific premium vendor |
| 10       | Category: Living Room Furniture  | Manufacturing         | Manufacturing products                     |
| 15       | Contact: Grand Exhibition Co.    | Events & Sponsorships | Event vendor expenses                      |
| 20       | Category: Office Furniture       | Administration        | Office supplies                            |
| 30       | Category: Outdoor & Garden       | Operations            | Outdoor operations                         |
| 40       | Category: Accessories & Hardware | Operations            | Operational accessories                    |

### Customer Invoice & Sales Order Rules

| Priority | Match Criteria                   | Assigned Cost Center | Rule Logic                                   |
| -------- | -------------------------------- | -------------------- | -------------------------------------------- |
| 5        | Contact: TechCorp Solutions      | Corporate Sales      | Highest priority - specific corporate client |
| 10       | Product: Sheesham 3-Seater Sofa  | Sales & Marketing    | Specific premium product                     |
| 15       | Contact: Wholesale Furniture Hub | Retail Sales         | Wholesale customer                           |
| 20       | Product: Teak Executive Desk     | Corporate Sales      | Executive desk product                       |
| 25       | Tag: Corporate                   | Corporate Sales      | Any corporate tagged contact                 |
| 30       | Tag: Wholesale                   | Retail Sales         | Any wholesale tagged contact                 |
| 35       | Tag: Premium Client              | Sales & Marketing    | Premium clients                              |
| 40       | Category: Outdoor & Garden       | Operations           | Outdoor sales                                |

---

## 🧪 Testing Scenarios

### Test 1: Living Room Furniture Purchase

**Create a Purchase Order with:**

- Product: Sheesham 3-Seater Sofa
- **Expected Result:** Cost Center = **Manufacturing** (CC-100)

### Test 2: Office Furniture Purchase

**Create a Purchase Order with:**

- Product: Ergo Study Chair
- **Expected Result:** Cost Center = **Administration** (CC-300)

### Test 3: Premium Vendor Override

**Create a Purchase Order with:**

- Vendor: Premium Wood Importers
- Any product/category
- **Expected Result:** Cost Center = **R&D** (CC-500) (overrides category due to higher priority)

### Test 4: Corporate Customer Sale

**Create a Sales Order with:**

- Customer: TechCorp Solutions
- Any product
- **Expected Result:** Cost Center = **Corporate Sales** (CC-210)

### Test 5: Wholesale Customer Sale

**Create a Sales Order with:**

- Customer: Wholesale Furniture Hub
- Any product
- **Expected Result:** Cost Center = **Retail Sales** (CC-220)

### Test 6: Specific Product Sale

**Create a Sales Order with:**

- Product: Teak Executive Desk
- Any customer (except TechCorp)
- **Expected Result:** Cost Center = **Corporate Sales** (CC-210)

### Test 7: Tagged Customer

**Create a Sales Order with:**

- Customer with "Corporate" tag
- Any product
- **Expected Result:** Cost Center = **Corporate Sales** (CC-210)

---

## 🔄 Priority System Explained

**Lower number = Higher priority**

- Priority 5: Highest - specific contacts (overrides everything)
- Priority 10-20: High - specific products or important categories
- Priority 25-35: Medium - tags and general rules
- Priority 40+: Low - fallback category rules

When multiple rules match:

1. The rule with the **lowest priority number** wins
2. Contact-specific rules override product rules
3. Product-specific rules override category rules
4. Tag rules are evaluated after contact and product rules

---

## ✅ Success Indicators

You should now see:

- ✅ **Different cost centers** for different product categories
- ✅ **Different cost centers** for different customer types
- ✅ **Different cost centers** for different vendor types
- ✅ **Priority-based overrides** working correctly
- ✅ **Tag-based assignments** functioning

---

## 🎉 What Changed

Previously, all products were being assigned to:

- **Manufacturing** (same cost center for everything)

Now you'll see proper distribution across:

- **Manufacturing** (Living Room furniture purchases)
- **Administration** (Office furniture purchases)
- **Operations** (Outdoor & accessories)
- **R&D** (Premium vendor purchases)
- **Corporate Sales** (Corporate customers)
- **Retail Sales** (Wholesale customers)
- **Sales & Marketing** (Premium products & clients)
- **Events & Sponsorships** (Event vendor expenses)

This provides a realistic test environment for the auto-analytic feature! 🚀
