# 🚀 SKY BLUEPRINT UPDATES - ONE-PAGE DEPLOYMENT GUIDE

---

## WHAT YOU'RE ADDING

| Feature | Current | New | Status |
|---------|---------|-----|--------|
| **Prices** | Rands (R) | USD ($) | 🟢 Ready |
| **AI Mentor** | ❌ Broken | ✅ Fixed | 🟢 Ready |
| **Referral Program** | ❌ None | 💰 20% Commission | 🟢 Ready |

---

## ⚡ QUICK START (20 minutes)

### 1️⃣ UPDATE PRICES (5 min)
**File**: `index.html`
**Action**: Find & Replace
```
R55/month       →  $2.99/month
R1,980          →  $99
R450            →  $24.99
R750            →  $42.99
R950            →  $54.99
<strong>R55</strong> → <strong>$2.99</strong>
```

### 2️⃣ ADD REFERRAL SCRIPT (1 min)
**File**: `index.html` (line 9)
**Find**:
```html
<link rel="stylesheet" href="style.css?v=9">
```
**Add after**:
```html
<script src="referral.js"></script>
```

### 3️⃣ FIX AI MENTOR (5 min)
**File**: `app.js` (line ~1605)
**Replace**: `async function sendAI() { ... }`
**With**: 👉 See MASTER_CHECKLIST.md → STEP 3

### 4️⃣ ADD API KEY SETUP (2 min)
**File**: `app.js` (line ~800)
**Add**: New function `setupAIKey()` 👉 See MASTER_CHECKLIST.md → STEP 4

### 5️⃣ TRACK CONVERSIONS (1 min)
**File**: `app.js` (in signup function)
**Add**: `recordReferralConversion(userId, 2.99, 'monthly');`

### 6️⃣ UPLOAD FILES (1 min)
1. Upload `referral.js` to repo root
2. (Optional) Upload `referral-backend.js`

### 7️⃣ TEST (5 min)
```
✅ Hard refresh: Ctrl+Shift+R
✅ Prices show $2.99
✅ AI Mentor setup works
✅ Referral link ?ref=CODE works
```

---

## 📋 FILES YOU HAVE

| File | Purpose | Size | Where |
|------|---------|------|-------|
| `referral.js` | Frontend tracking | 8KB | Repo root |
| `referral-backend.js` | Backend payouts | 12KB | Optional |
| `referral-styles.css` | Dashboard styling | 6KB | Optional |
| `MASTER_CHECKLIST.md` | Exact code | 📄 | Read THIS |
| `DEPLOY_EVERYTHING.md` | Step by step | 📄 | Backup guide |

---

## 🎯 EXACT CODE SECTIONS TO COPY

### Copy Paste #1: sendAI() Function
**Location**: app.js line ~1605
**From**: MASTER_CHECKLIST.md → STEP 3
**Size**: ~40 lines of code
✅ **Includes**: API key auth, error handling

### Copy Paste #2: setupAIKey() Function  
**Location**: app.js line ~800
**From**: MASTER_CHECKLIST.md → STEP 4
**Size**: ~10 lines
✅ **Includes**: API key prompt dialog

### Copy Paste #3: Conversion Tracking
**Location**: app.js (in signup function)
**From**: MASTER_CHECKLIST.md → STEP 5
**Size**: 1 line
✅ **Usage**: `recordReferralConversion(userId, 2.99, 'monthly');`

### Copy Paste #4: referral.js
**Location**: Repo root
**From**: referral.js file
**Size**: ~250 lines
✅ **Includes**: Full referral system

---

## 💰 HOW IT WORKS

```
Customer pays $2.99/month
    ↓
    ├─ Referrer gets $0.60 (20%)
    └─ You get $2.39 (80%)

Scale example:
100 referrals → Referrer earns $60/month
             → You earn $239/month
```

---

## 🔐 GET YOUR API KEY

1. Go to: **https://console.anthropic.com**
2. Sign in (free account)
3. Click: **"API Keys"**
4. Click: **"Create Key"**
5. Copy the key
6. Done! (Users enter it via Account settings)

---

## 🧪 TESTING COMMANDS

### Test 1: Prices
```
Search: $2.99 (should find 5+)
Search: R55 (should find 0)
✅ Hero button shows "$2.99/month"
```

### Test 2: AI Mentor
```
1. Account → Setup AI Mentor Key
2. Paste your API key
3. AI Business Mentor → Ask a question
4. ✅ Should respond in 3-5 seconds
```

### Test 3: Referral
```
1. Visit: skyblueprint.company?ref=test123
2. F12 Console: localStorage.getItem('current_referrer_code')
3. ✅ Should show: "test123"
```

---

## 🚨 COMMON ISSUES

| Issue | Fix |
|-------|-----|
| Prices still show R | Ctrl+Shift+R (hard refresh) |
| AI Mentor not working | Check API key is saved |
| Referral not tracking | Check referral.js loaded |
| Syntax error in code | Check brackets {} and quotes |

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Prices updated (6 replacements)
- [ ] referral.js script tag added
- [ ] sendAI() function replaced
- [ ] setupAIKey() function added
- [ ] Conversion tracking added
- [ ] referral.js uploaded
- [ ] Hard refresh & tested
- [ ] Prices show $
- [ ] AI Mentor works
- [ ] Referral link tracked

---

## 🎬 READY? HERE'S THE PLAN

### PHASE 1: Read (5 min)
1. This page (you're reading it ✅)
2. MASTER_CHECKLIST.md (exact code)

### PHASE 2: Update (15 min)
1. Find & Replace prices
2. Add referral.js script
3. Replace sendAI() function
4. Add setupAIKey() function
5. Add conversion tracking

### PHASE 3: Deploy (5 min)
1. Upload referral.js
2. Commit all changes
3. Hard refresh & test

---

## 📞 NEED HELP?

**For exact code**: → MASTER_CHECKLIST.md
**For guidance**: → DEPLOY_EVERYTHING.md  
**For context**: → SUMMARY.md
**For quick ref**: → QUICK_REFERENCE.md

**Questions**: lethumkapu561@gmail.com

---

## 🎉 AFTER YOU DEPLOY

✅ **Day 1**: Prices in USD, AI Mentor works
✅ **Week 1**: First referrals coming in
✅ **Month 1**: Passive income starting
✅ **Quarter 1**: 20% of new customers from referrals

---

**Total Time: 20 minutes**
**Impact: 3 major features added**
**Revenue: Unlimited referral commission**

## LET'S GO! 🚀

Start with: **MASTER_CHECKLIST.md → STEP 1**
