# MASTER DEPLOYMENT CHECKLIST - Copy & Paste Ready

**Everything you need to add to your Sky Blueprint repository**

---

## 📊 SUMMARY OF ALL CHANGES

| File | Change | Lines | Time |
|------|--------|-------|------|
| index.html | Replace prices ZAR→USD | 85, 250-290, 387 | 5 min |
| index.html | Add referral.js script | ~9 | 1 min |
| app.js | Fix AI Mentor function | ~1605-1632 | 5 min |
| app.js | Add setupAIKey function | ~800 | 2 min |
| app.js | Track conversions | ~in signup | 1 min |
| referral.js | Upload new file | NEW | 1 min |
| referral-backend.js | Upload new file (optional) | NEW | 1 min |
| **TOTAL TIME** | | | **16 min** |

---

## ✅ STEP-BY-STEP DEPLOYMENT

### STEP 1: Index.html Price Updates (5 min)

**Location**: index.html - Multiple lines

**What to do**: Find and replace using GitHub's editor

```
Find and Replace 6 times:

1. Find: R55/month
   Replace: $2.99/month

2. Find: R1,980
   Replace: $99

3. Find: R450
   Replace: $24.99

4. Find: R750
   Replace: $42.99

5. Find: R950
   Replace: $54.99

6. Find: <strong>R55</strong><span>Per Month Only</span>
   Replace: <strong>$2.99</strong><span>Per Month Only</span>
```

**Verification**: After changes, search for "R5" or "ZAR" - should find nothing

---

### STEP 2: Add Referral Script to index.html (1 min)

**Location**: index.html, line ~9 (in `<head>` section)

**Find this**:
```html
<link rel="stylesheet" href="style.css?v=9">
```

**Add after it**:
```html
<script src="referral.js"></script>
```

**Complete section should look like**:
```html
<link rel="stylesheet" href="style.css?v=9">
<script src="referral.js"></script>
</head>
```

---

### STEP 3: Fix AI Business Mentor in app.js (5 min)

**Location**: app.js, line ~1605

**Find this function**:
```javascript
async function sendAI() {
  const inp = document.getElementById('ci');
  const msg = inp.value.trim();
  if (!msg) return;
  inp.value = '';
  const cw = document.getElementById('cw');
  cw.innerHTML += `<div class="chat-bubble user">${msg}</div><div class="chat-bubble bot" id="ai-typing">Thinking...</div>`;
  cw.scrollTop = cw.scrollHeight;
  aiHistory.push({role:'user',content:msg});
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-6', max_tokens:1000,
        system:'You are a warm, practical AI Business Mentor for Sky Blueprint, specialising in South African entrepreneurship. You know SA business law, CIPC registration (R175 fee, cipc.co.za), SARS eFiling, SMME funding (SEFA, IDC, NEF, Khula), BEE/BBBEE compliance, load shedding business strategies, and general business growth for the African market. Give clear, actionable advice using South African context. Mention rands, SA government departments, and local resources. Be encouraging and specific.',
        messages:aiHistory
      })
    });
    const data = await res.json();
    const reply = data.content?.[0]?.text || 'Sorry, I could not respond. Please try again.';
    aiHistory.push({role:'assistant',content:reply});
    document.getElementById('ai-typing').outerHTML = `<div class="chat-bubble bot">${reply.replace(/\n/g,'<br>')}</div>`;
  } catch(e) {
    document.getElementById('ai-typing').outerHTML = `<div class="chat-bubble bot">⚠️ Connection error. Please check your internet and try again.</div>`;
  }
  cw.scrollTop = cw.scrollHeight;
}
```

**Delete the entire function above and replace with**:
```javascript
async function sendAI() {
  const inp = document.getElementById('ci');
  const msg = inp.value.trim();
  if (!msg) return;
  inp.value = '';
  const cw = document.getElementById('cw');
  cw.innerHTML += `<div class="chat-bubble user">${msg}</div><div class="chat-bubble bot" id="ai-typing">Thinking...</div>`;
  cw.scrollTop = cw.scrollHeight;
  aiHistory.push({role:'user',content:msg});
  
  // Get API key from browser storage
  const apiKey = localStorage.getItem('anthropic_api_key');
  
  if (!apiKey) {
    document.getElementById('ai-typing').outerHTML = `<div class="chat-bubble bot">⚠️ API key not configured. Please go to Account → Setup AI Mentor Key to enable this feature.</div>`;
    return;
  }
  
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':`Bearer ${apiKey}`
      },
      body:JSON.stringify({
        model:'claude-sonnet-4-6', 
        max_tokens:1000,
        system:'You are a warm, practical AI Business Mentor for Sky Blueprint, specialising in South African entrepreneurship. You know SA business law, CIPC registration, SARS eFiling, SMME funding (SEFA, IDC, NEF, Khula), BEE/BBBEE compliance, load shedding business strategies, and general business growth. Give clear, actionable advice using South African context. Mention local resources. Be encouraging and specific.',
        messages:aiHistory
      })
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error?.message || 'API request failed');
    }
    
    const data = await res.json();
    const reply = data.content?.[0]?.text || 'Sorry, I could not respond. Please try again.';
    aiHistory.push({role:'assistant',content:reply});
    document.getElementById('ai-typing').outerHTML = `<div class="chat-bubble bot">${reply.replace(/\n/g,'<br>')}</div>`;
  } catch(e) {
    console.error('AI Mentor error:', e);
    document.getElementById('ai-typing').outerHTML = `<div class="chat-bubble bot">⚠️ ${e.message || 'Connection error. Please check your internet and try again.'}</div>`;
  }
  cw.scrollTop = cw.scrollHeight;
}
```

---

### STEP 4: Add API Key Setup Function in app.js (2 min)

**Location**: app.js, after a function like `showAccount()` (around line ~800)

**Add this new function**:
```javascript
function setupAIKey() {
  const apiKey = prompt('Enter your Anthropic API key (get it free from console.anthropic.com):\n\nExample: sk_live_...', '');
  if (apiKey && apiKey.trim()) {
    localStorage.setItem('anthropic_api_key', apiKey.trim());
    alert('✅ API key saved!\n\nAI Mentor is now ready to use. Go to the "AI Business Mentor" tool and start asking questions!');
  } else {
    alert('⚠️ API key not saved. AI Mentor requires an API key to work.\n\nGet one free at: console.anthropic.com');
  }
}
```

---

### STEP 5: Track Referral Conversions in app.js (1 min)

**Location**: app.js, in your signup/payment success function

**Find the area where user is saved** (search for `localStorage.setItem('user_id'` or similar):

**Add this line after user data is saved**:
```javascript
// Track referral conversion (for affiliate earnings)
recordReferralConversion(userId, 2.99, 'monthly');
```

**Example context**:
```javascript
function saveUserData(firstName, lastName, email, phone) {
  const userId = 'user_' + Date.now();
  localStorage.setItem('user_id', userId);
  localStorage.setItem('first_name', firstName);
  localStorage.setItem('last_name', lastName);
  localStorage.setItem('email', email);
  localStorage.setItem('phone', phone);
  
  // ADD THIS LINE:
  recordReferralConversion(userId, 2.99, 'monthly');
  
  // Continue with rest of function...
}
```

---

### STEP 6: Upload referral.js (1 min)

**What**: New file to upload

**Where**: Repository root (same level as index.html, app.js)

**File**: See `referral.js` in the provided files

**How**:
1. Go to your GitHub repo home
2. Click "Add file" → "Upload files"
3. Drag and drop `referral.js`
4. Commit message: "Add: Referral affiliate system"
5. Commit

---

### STEP 7: Upload referral-backend.js (OPTIONAL - 1 min)

**What**: Backend support for referral payouts (if using Node.js)

**Where**: Repository root or `/backend/` folder

**File**: See `referral-backend.js` in provided files

**Note**: Only needed if you have a backend server. Skip if using GitHub Pages only.

---

## 🔍 VERIFICATION CHECKLIST

After ALL steps, verify:

- [ ] Prices changed (search for "$2.99" should find 5+ results, search for "R55" should find 0)
- [ ] referral.js added to repo
- [ ] referral.js linked in index.html head
- [ ] sendAI() function updated with Bearer token
- [ ] setupAIKey() function added to app.js
- [ ] recordReferralConversion() called in signup
- [ ] No syntax errors (app.js should have matching braces)

---

## 🧪 TESTING AFTER DEPLOYMENT

### Test 1: Prices in USD (1 min)
```
1. Go to https://skyblueprint.company
2. Hard refresh: Ctrl+Shift+R
3. Hero button should say: "Get Started — $2.99/month"
4. Pricing section should show: "$2.99/month" and "$99/year"
```

### Test 2: AI Mentor Works (3 min)
```
1. Log into your test account (or create one)
2. Go to Account → click "Setup AI Mentor Key"
3. Paste your API key from console.anthropic.com
4. Go to "AI Business Mentor" tool
5. Ask: "How do I register a business in South Africa?"
6. Should get response about CIPC in 3-5 seconds
```

### Test 3: Referral Tracking (2 min)
```
1. Open: https://skyblueprint.company?ref=test_ref_code_123
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Type: localStorage.getItem('current_referrer_code')
5. Should show: "test_ref_code_123"
```

### Test 4: Mobile Responsive (2 min)
```
1. Press F12 to open Developer Tools
2. Click mobile icon (top left of DevTools)
3. Test on different screen sizes
4. All should look good
```

---

## 🚀 DEPLOYMENT SEQUENCE

Follow this exact order:

1. **UPDATE PRICES** (index.html) - 5 min
2. **ADD REFERRAL SCRIPT** (index.html) - 1 min  
3. **FIX AI MENTOR** (app.js) - 5 min
4. **ADD API KEY SETUP** (app.js) - 2 min
5. **TRACK CONVERSIONS** (app.js) - 1 min
6. **UPLOAD referral.js** - 1 min
7. **HARD REFRESH & TEST** - 5 min

**TOTAL TIME: 20 minutes**

---

## 🐛 TROUBLESHOOTING

### Prices still show R after hard refresh
```
Solution:
1. Ctrl+Shift+Delete (clear cache)
2. Try Incognito mode (Ctrl+Shift+N)
3. Check GitHub shows $ amounts (not R)
4. Wait 3 minutes for CDN to update
```

### AI Mentor says "API key not configured"
```
Solution:
1. Click "Setup AI Mentor Key"
2. Get free key from console.anthropic.com
3. Paste key (should start with sk_)
4. Refresh page and try again
```

### Referral code not in localStorage
```
Solution:
1. Check referral.js is loaded (F12 → Network)
2. Check URL has ?ref=CODE parameter
3. Check for JavaScript errors (F12 → Console)
4. Try in Incognito mode
```

### JavaScript syntax error
```
Solution:
1. Check braces match ({} [] )
2. Check no quotes are mismatched
3. Paste code carefully, line by line
4. Use F12 Console to see exact error
```

---

## 📞 SUPPORT

**Quick Questions?**
- DEPLOY_EVERYTHING.md
- QUICK_REFERENCE.md

**Technical Help?**
- APP_JS_CHANGES.md (exact code)
- F12 Console for error messages

**Contact**:
- Email: lethumkapu561@gmail.com
- API Docs: https://docs.anthropic.com
- Paystack: https://paystack.com/support

---

## ✨ AFTER SUCCESSFUL DEPLOYMENT

### Day 1 Wins
✅ Prices show USD globally
✅ AI Mentor works for all users
✅ Referral system live

### Week 1 Goals
✅ First referrals coming in
✅ Track top referrers
✅ Verify Paystack integration

### Month 1 Targets
✅ 10+ active referrers
✅ 5-10% new customers from referrals
✅ Passive income flowing

---

**You're ready. Deploy with confidence! 🚀**

Any questions? Feel free to reach out!
