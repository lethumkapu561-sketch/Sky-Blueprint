# DEPLOY EVERYTHING - Complete Ready-to-Use Guide

This file contains EVERYTHING you need to add to your Sky Blueprint repository. Copy and paste directly!

---

## 🚀 DEPLOYMENT STRATEGY

You have 2 options:

### Option A: Quick Updates (Find & Replace) - 10 minutes
- Just find and replace prices
- Add referral script tag
- Update 1 function

### Option B: Complete Overhaul (Full Files) - 30 minutes  
- Use complete updated files provided
- More reliable but requires careful attention

**I recommend: Option A (Quick)** - it's faster and safer.

---

## 📝 OPTION A: QUICK UPDATES (Recommended)

### UPDATE #1: Replace ALL Prices in index.html

**Use GitHub's Find & Replace:**

```
FIND: R55/month
REPLACE WITH: $2.99/month
(do this 5 times)

FIND: R1,980
REPLACE WITH: $99
(do this 3 times)

FIND: R450
REPLACE WITH: $24.99
(do this 2 times)

FIND: R750
REPLACE WITH: $42.99
(do this 1 time)

FIND: R950
REPLACE WITH: $54.99
(do this 1 time)

FIND: <strong>R55</strong><span>Per Month Only</span>
REPLACE WITH: <strong>$2.99</strong><span>Per Month Only</span>
(do this 1 time)
```

### UPDATE #2: Add Referral Script to index.html Head

Find this line in `index.html` (around line 9):
```html
<link rel="stylesheet" href="style.css?v=9">
```

Add AFTER it:
```html
<script src="referral.js"></script>
```

Complete example:
```html
<link rel="stylesheet" href="style.css?v=9">
<script src="referral.js"></script>
</head>
```

### UPDATE #3: Fix AI Business Mentor in app.js

Find function at line ~1605:
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
        system:'You are a warm, practical AI Business Mentor for Sky Blueprint, specialising in South African entrepreneurship...',
        messages:aiHistory
      })
    });
```

Replace the entire `sendAI()` function with this:

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
  
  const apiKey = localStorage.getItem('anthropic_api_key');
  
  if (!apiKey) {
    document.getElementById('ai-typing').outerHTML = `<div class="chat-bubble bot">⚠️ API key not configured. Go to Account settings → Setup AI Mentor Key</div>`;
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
        model:'claude-sonnet-4-6', max_tokens:1000,
        system:'You are a warm, practical AI Business Mentor for Sky Blueprint, specialising in South African entrepreneurship. You know SA business law, CIPC registration, SARS eFiling, SMME funding (SEFA, IDC, NEF, Khula), BEE/BBBEE compliance, load shedding business strategies, and general business growth. Give clear, actionable advice. Be encouraging and specific.',
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
    console.error('AI error:', e);
    document.getElementById('ai-typing').outerHTML = `<div class="chat-bubble bot">⚠️ ${e.message || 'Connection error. Check your API key or internet.'}</div>`;
  }
  cw.scrollTop = cw.scrollHeight;
}
```

### UPDATE #4: Add API Key Setup Function in app.js

Find where account functions are (search for `function showAccount()`) and add AFTER it:

```javascript
function setupAIKey() {
  const apiKey = prompt('Enter your Anthropic API key (get it free from console.anthropic.com):', '');
  if (apiKey && apiKey.trim()) {
    localStorage.setItem('anthropic_api_key', apiKey.trim());
    alert('✅ API key saved! AI Mentor is now ready to use.');
  } else {
    alert('⚠️ API key not saved. AI Mentor will not work without it.');
  }
}
```

### UPDATE #5: Add Referral Tracking to Signup

Find your signup/payment function (search for `function startPaystack(` or `function saveUserData(`).

After the user is saved to localStorage, add:

```javascript
// Track referral conversion if user came from referral link
recordReferralConversion(userId, 2.99, 'monthly');
```

Example context:
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
}
```

### UPDATE #6: Upload referral.js to Repo

1. Go to your GitHub repo
2. Click "Add file" → "Upload files"
3. Drag and drop the `referral.js` file
4. Commit message: "Add: Referral affiliate system"

---

## ✅ THAT'S IT! 

You're done. Test:

1. Hard refresh: **Ctrl+Shift+R**
2. Check prices show $2.99
3. Test API key setup in Account
4. Test referral link: `?ref=test123`

---

## 📦 OPTION B: COMPLETE FILES (If you prefer)

If you want complete ready-to-use files instead, use these exact replacements:

### Complete referral.js
See file: `referral.js` (already provided)

### Complete referral-styles.css  
See file: `referral-styles.css` (already provided)

### What to add to index.html

In the `<head>` section, after stylesheets:
```html
<script src="referral.js"></script>
<link rel="stylesheet" href="referral-styles.css">
```

In the `<nav>` or account section, add referral link:
```html
<a href="#" onclick="event.preventDefault();showReferralDashboard()">💰 Earn Money</a>
```

---

## 🔐 SECURITY CHECKLIST

- [ ] Never commit API key to GitHub
- [ ] Users enter their own API key via Account settings
- [ ] API key stored only in browser localStorage
- [ ] Referral data synced to Paystack (your backend)
- [ ] All transactions go through Paystack (secure)

---

## 🧪 TESTING CHECKLIST

After deployment:

- [ ] Hard refresh site (Ctrl+Shift+R)
- [ ] Check all prices show $
- [ ] Hero button says "$2.99/month"
- [ ] Account → "Setup AI Mentor Key" works
- [ ] AI Mentor responds to questions
- [ ] Referral link `?ref=CODE` tracked
- [ ] No console errors (F12)
- [ ] Mobile responsive

---

## 🚨 IF SOMETHING BREAKS

**Prices still showing R?**
- Hard refresh: Ctrl+Shift+R
- Clear cache: Ctrl+Shift+Delete  
- Wait 3 minutes for GitHub Pages update

**AI Mentor not working?**
- Check API key is saved
- F12 → Console for errors
- Try test API key from console.anthropic.com

**Referral not tracking?**
- Check referral.js loaded (F12 → Network)
- Check URL has ?ref=CODE
- Check localStorage (F12 → Application)

---

## 📞 DEPLOYMENT SUPPORT

**Done with Option A?** → Test and you're live!

**Issues?** → Email: lethumkapu561@gmail.com

**Need API key?** → https://console.anthropic.com

---

## 🎉 QUICK WINS AFTER DEPLOYMENT

1. **Day 1**: AI Mentor works, users happy
2. **Week 1**: Start seeing referrals come in
3. **Month 1**: Passive income flowing from affiliates
4. **Quarter 1**: 20% of new customers from referrals

---

**You've got this! Deploy with confidence. 🚀**
