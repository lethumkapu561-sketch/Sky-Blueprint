// VERSION: 2026-COVER-LETTER-FIX-v9
console.log("Sky Blueprint app.js VERSION 9 loaded - cover letter ready");
// ── Sky Blueprint App ──
// YOUR PAYSTACK PUBLIC KEY — replace with your real key from paystack.com/dashboard
var PAYSTACK_PUBLIC_KEY = 'pk_live_b07f0d8b9ee7305c57362ec9bbb89fe1eb0f9433';
var OWNER_EMAIL = 'lethumkapu561@gmail.com';
// Paystack payment links/plans
var PAYSTACK_MONTHLY_LINK = 'https://paystack.shop/pay/2g6pr6rq0e';  // R55/month recurring
var PAYSTACK_YEARLY_PLAN = 'PLN_481j8rtfqd47uze';                    // R1,980/year x 3 years

// ── SAFE STORAGE (never throws, works even if browser blocks localStorage) ──
var _memStore = {};
var safeStorage = {
  getItem: function(k) {
    try { return window.localStorage.getItem(k); }
    catch(e) { return _memStore[k] !== undefined ? _memStore[k] : null; }
  },
  setItem: function(k, v) {
    try { window.localStorage.setItem(k, v); }
    catch(e) { _memStore[k] = v; }
  },
  removeItem: function(k) {
    try { window.localStorage.removeItem(k); }
    catch(e) { delete _memStore[k]; }
  }
};
var _sessMem = {};
var safeSession = {
  getItem: function(k) {
    try { return window.sessionStorage.getItem(k); }
    catch(e) { return _sessMem[k] !== undefined ? _sessMem[k] : null; }
  },
  setItem: function(k, v) {
    try { window.sessionStorage.setItem(k, v); }
    catch(e) { _sessMem[k] = v; }
  }
};


var PLAN_CODES = { pro: 'PLN_xxxxxxxxxx', business: 'PLN_xxxxxxxxxx' };
var PRICES = {
  monthly: 5500,       // R55/month — all tools
  yearly: 198000,      // R1,980 — 3 years (R55 x 36 months)
  website_only: 45000, // R450 — website build no domain
  website_com: 75000,  // R750 — website + .com domain
  website_coza: 95000, // R950 — website + .co.za domain
  website_net: 75000,  // R750 — website + .net domain
  website_org: 75000,  // R750 — website + .org domain
  phone: 45000,        // R450 — Find My Phone once-off
}; // amounts in cents (R450=45000, R55=5500, R1980=198000) // in kobo (R99 = 9900)
var currentPlan = 'pro';
var currentUser = null;
// ── Backend URL — update this after deploying to Railway ──
var BACKEND_URL = 'https://sky-blueprint-backend-production.up.railway.app';

// ── Navigation ──
function toggleMobileNav() {
  document.getElementById('mobileMenu').classList.toggle('open');
}
function closeMobileNav() {
  document.getElementById('mobileMenu').classList.remove('open');
}

var _pageHistory = ['home'];

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + name);
  if (page) {
    page.classList.add('active');
    window.scrollTo(0, 0);
    // Track history for back button
    if (_pageHistory[_pageHistory.length - 1] !== name) {
      _pageHistory.push(name);
      if (_pageHistory.length > 10) _pageHistory.shift();
    }
  }
}

function updateNav() {
  var loggedOut = document.getElementById('nav-logged-out');
  var loggedIn = document.getElementById('nav-logged-in');
  var badge = document.getElementById('nav-trial-badge');
  var username = document.getElementById('nav-username');
  // Mobile menu elements
  var mmOut = document.getElementById('mm-logged-out');
  var mmIn = document.getElementById('mm-logged-in');
  var mmBadge = document.getElementById('mm-badge');
  var mmName = document.getElementById('mm-name');

  if (!loggedOut || !loggedIn) return;

  var saved = safeStorage.getItem('sb_current');
  if (saved) {
    var u = JSON.parse(saved);
    currentUser = u;
    loggedOut.style.display = 'none';
    loggedIn.style.display = 'flex';
    if (mmOut) mmOut.style.display = 'none';
    if (mmIn) mmIn.style.display = 'block';

    if (username) username.innerHTML = '' + (u.fname || 'My Account');
    if (mmName) mmName.textContent = '' + (u.fname || '') + ' ' + (u.lname || '');

    // Build the badge text/colour once, use for both desktop + mobile
    var bText, bBg, bColor;
    if (u.plan === 'owner') { bText='Owner'; bBg='rgba(245,158,11,0.15)'; bColor='#f59e0b'; }
    else if (u.plan === 'monthly' || u.plan === 'yearly' || u.plan === 'pro' || u.plan === 'paid' || u.plan === 'business') { bText='✅ Active Plan'; bBg='rgba(16,185,129,0.15)'; bColor='#10b981'; }
    else if (u.plan === 'cancelled') { bText='Plan Ended'; bBg='rgba(239,68,68,0.15)'; bColor='#f87171'; }
    else { bText='Subscribe · R55/month'; bBg='rgba(245,158,11,0.15)'; bColor='#f59e0b'; }

    if (badge) { badge.textContent=bText; badge.style.background=bBg; badge.style.color=bColor; }
    if (mmBadge) { mmBadge.textContent=bText; mmBadge.style.background=bBg; mmBadge.style.color=bColor; }
  } else {
    loggedOut.style.display = 'flex';
    loggedIn.style.display = 'none';
    if (mmOut) mmOut.style.display = 'block';
    if (mmIn) mmIn.style.display = 'none';
  }

  // Also update the dashboard trial banner with live countdown
  updateDashBanner();
}

function updateDashBanner() {
  var banner = document.getElementById('trial-banner');
  if (!banner || !currentUser) return;
  var u = currentUser;

  if (u.plan === 'owner') {
    banner.innerHTML = '<strong>Owner Account</strong> — Full free access to all tools, forever.';
    banner.style.background = 'rgba(245,158,11,0.08)';
    banner.style.borderColor = 'rgba(245,158,11,0.3)';
  } else if (u.plan === 'monthly' || u.plan === 'yearly' || u.plan === 'pro' || u.plan === 'paid' || u.plan === 'business') {
    banner.innerHTML = '✅ <strong>Active Plan</strong> — You have full access to all Sky Blueprint tools.';
    banner.style.background = 'rgba(16,185,129,0.08)';
    banner.style.borderColor = 'rgba(16,185,129,0.3)';
  } else if (u.plan === 'cancelled') {
    banner.innerHTML = '<strong>Plan Ended</strong> — Re-subscribe to use the tools again. ' +
      '<button onclick="startPaystack(\'monthly\')" style="background:linear-gradient(135deg,#38bdf8,#6366f1);color:#fff;border:none;border-radius:8px;padding:7px 16px;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font);margin-left:8px">Subscribe R55/month</button>';
    banner.style.background = 'rgba(239,68,68,0.08)';
    banner.style.borderColor = 'rgba(239,68,68,0.3)';
  } else {
    // No free trial - subscribe to unlock
    banner.innerHTML = '<strong>Subscribe to unlock all tools</strong> — just R55/month, cancel anytime. ' +
      '<button onclick="startPaystack(\'monthly\')" style="background:linear-gradient(135deg,#38bdf8,#6366f1);color:#fff;border:none;border-radius:8px;padding:7px 16px;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font);margin-left:8px">Subscribe R55/month</button>';
    banner.style.background = 'rgba(245,158,11,0.08)';
    banner.style.borderColor = 'rgba(245,158,11,0.3)';
  }
}

function goBack() {
  // Remove current page
  _pageHistory.pop();
  // Get previous page
  var prev = _pageHistory[_pageHistory.length - 1] || 'dashboard';
  // If logged in and going back to home, go to dashboard instead
  if (prev === 'home' && currentUser) prev = 'dashboard';
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  var page = document.getElementById('page-' + prev);
  if (page) { page.classList.add('active'); window.scrollTo(0,0); }
}

function navTo(section) {
  // Go to home page first, then scroll to section
  showPage('home');
  setTimeout(function() {
    var el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

function togglePass(inputId, btn) {
  var input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '';
  } else {
    input.type = 'password';
    btn.textContent = '️';
  }
}

// ── Auth ──
function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  if (!email || !pass) { alert('Please enter your email and password.'); return; }

  // Log in via the SERVER - it checks the password and returns the real plan
  fetch(BACKEND_URL + '/api/auth/login', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ email: email, password: pass })
  })
  .then(function(r){ return r.json().then(function(d){ return { ok: r.ok, d: d }; }); })
  .then(function(res){
    if (!res.ok) { alert(res.d.error || 'Incorrect email or password.'); return; }
    currentUser = res.d.user;
    safeStorage.setItem('sb_token', res.d.token);
    safeStorage.setItem('sb_current', JSON.stringify(currentUser));

    if (currentUser.plan === 'owner') {
      document.getElementById('dash-greeting').textContent = 'Welcome back, Owner Wongalethu!';
    } else {
      document.getElementById('dash-greeting').textContent = 'Hi ' + currentUser.fname + ' ' + (currentUser.lname||'') + ' Welcome back!';
    }

    fetch(BACKEND_URL + '/api/login-notify', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ fname:currentUser.fname, lname:currentUser.lname, email:currentUser.email, action:'login' })
    }).catch(function(){});

    updateNav();
    if (window._pendingTool) { var t = window._pendingTool; window._pendingTool = null; setTimeout(function(){ openTool(t); }, 200); }
    else showPage('dashboard');
  })
  .catch(function(){ alert('Could not connect to log in. Please check your internet and try again.'); });
}

function doSignup() {
  const fname = document.getElementById('su-fname').value.trim();
  const lname = document.getElementById('su-lname').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const phone = document.getElementById('su-phone').value.trim();
  const pass = document.getElementById('su-pass').value;
  if (!fname || !email || !pass) { alert('Please fill in your name, email and password.'); return; }
  if (pass.length < 6) { alert('Password must be at least 6 characters.'); return; }

  // Create the account on the SERVER (secure - plan is controlled server-side)
  fetch(BACKEND_URL + '/api/auth/signup', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ fname, lname, email, phone, password: pass })
  })
  .then(function(r){ return r.json().then(function(d){ return { ok: r.ok, d: d }; }); })
  .then(function(res){
    if (!res.ok) { alert(res.d.error || 'Could not create account.'); return; }
    // Save the session token - this is how the server knows who we are
    currentUser = res.d.user;
    safeStorage.setItem('sb_token', res.d.token);
    safeStorage.setItem('sb_current', JSON.stringify(currentUser));

    document.getElementById('dash-greeting').textContent = 'Hi ' + fname + ' ' + lname + ' Welcome to Sky Blueprint!';
    var banner = document.getElementById('trial-banner');
    if (banner) {
      banner.innerHTML = '<strong>Account Created!</strong> Subscribe to unlock all tools. ' +
        '<button onclick="startPaystack(\'monthly\')" style="background:linear-gradient(135deg,#38bdf8,#6366f1);color:#fff;border:none;border-radius:8px;padding:7px 16px;font-size:12px;font-weight:600;cursor:pointer;font-family:var(--font);margin-left:6px">Subscribe R55/month</button>';
      banner.style.background = 'rgba(16,185,129,0.08)';
      banner.style.borderColor = 'rgba(16,185,129,0.3)';
    }

    fetch(BACKEND_URL + '/api/welcome-email', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, fname: fname, lname: lname })
    }).catch(function(){});
    fetch(BACKEND_URL + '/api/login-notify', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ fname:fname, lname:lname, email:email, action:'signup' })
    }).catch(function(){});

    updateNav();
    if (window._pendingTool) { var t = window._pendingTool; window._pendingTool = null; setTimeout(function(){ openTool(t); }, 200); }
    else showPage('dashboard');
  })
  .catch(function(){ alert('Could not connect to create your account. Please check your internet and try again.'); });
}

function showAccount() {
  if (!currentUser) { showPage('login'); return; }

  var u = currentUser;
  var planNames = {
    owner: 'Owner Account',
    trial: 'Free Trial',
    monthly: 'Monthly Plan (R55/month)',
    yearly: '3-Year Plan',
    pro: 'Pro Plan',
    paid: 'Active Plan',
    business: 'Business Plan'
  };
  var planName = planNames[u.plan] || 'Free Trial';

  // Calculate trial days or subscription info
  var statusHTML = '';
  if (u.plan === 'owner') {
    statusHTML = '<div style="display:inline-block;background:rgba(245,158,11,0.15);color:#f59e0b;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">OWNER</div>';
  } else if (u.plan === 'monthly' || u.plan === 'yearly' || u.plan === 'pro' || u.plan === 'paid' || u.plan === 'business') {
    statusHTML = '<div style="display:inline-block;background:rgba(16,185,129,0.15);color:#10b981;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">✅ ACTIVE</div>';
  } else {
    var joined = u.joined || Date.now();
    var daysLeft = Math.max(0, 7 - Math.floor((Date.now() - joined) / (1000*60*60*24)));
    statusHTML = '<div style="display:inline-block;background:rgba(56,189,248,0.15);color:#38bdf8;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700">TRIAL — ' + daysLeft + ' DAYS LEFT</div>';
  }

  var joinedDate = u.joined ? new Date(u.joined).toLocaleDateString('en-ZA', {year:'numeric',month:'long',day:'numeric'}) : 'Recently';

  var html =
    '<div style="max-width:600px">' +

    // Profile card
    '<div style="background:linear-gradient(135deg,rgba(56,189,248,0.08),rgba(99,102,241,0.08));border:1px solid rgba(56,189,248,0.2);border-radius:16px;padding:24px;margin-bottom:20px">' +
    '<div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">' +
    '<div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#38bdf8,#6366f1);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:800;color:#fff">' + (u.fname ? u.fname.charAt(0).toUpperCase() : 'U') + '</div>' +
    '<div><div style="font-size:20px;font-weight:800;color:#fff">' + (u.fname||'') + ' ' + (u.lname||'') + '</div>' +
    '<div style="margin-top:6px">' + statusHTML + '</div></div>' +
    '</div>' +

    '<div style="display:flex;flex-direction:column;gap:12px">' +
    accountRow('', 'Email', u.email) +
    (u.phone ? accountRow('', 'Phone', u.phone) : '') +
    accountRow('', 'Current Plan', planName) +
    accountRow('', 'Member Since', joinedDate) +
    '</div>' +
    '</div>' +

    // Plan management
    '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px;margin-bottom:20px">' +
    '<h3 style="font-size:16px;font-weight:700;color:#fff;margin:0 0 16px">Manage Your Plan</h3>';

  if (u.plan === 'trial' || !u.plan) {
    html += '<p style="font-size:13px;color:var(--muted);margin-bottom:16px">Upgrade now to keep all your tools after your trial ends.</p>' +
      '<button class="btn-primary" style="width:100%;box-sizing:border-box;margin-bottom:10px" onclick="startPaystack(\'monthly\')">Subscribe — R55/month</button>' +
      '<button style="width:100%;box-sizing:border-box;background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;border-radius:10px;padding:14px;font-family:var(--font);cursor:pointer;font-weight:700;font-size:14px" onclick="startPaystack(\'yearly\')">3-Year Plan — R1,980/year</button>';
  } else if (u.plan === 'monthly' || u.plan === 'pro' || u.plan === 'paid' || u.plan === 'business') {
    html += '<p style="font-size:13px;color:var(--muted);margin-bottom:16px">Your monthly plan is active. R55 is debited on your subscription date each month.</p>' +
      '<button style="width:100%;box-sizing:border-box;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;border-radius:10px;padding:14px;font-family:var(--font);cursor:pointer;font-weight:700;font-size:14px" onclick="cancelPlan()">Cancel My Subscription</button>';
  } else if (u.plan === 'yearly') {
    html += '<p style="font-size:13px;color:var(--muted);margin-bottom:16px">You have the 3-Year Plan (R1,980/year). Enjoy all tools.</p>' +
      '<button style="width:100%;box-sizing:border-box;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;border-radius:10px;padding:14px;font-family:var(--font);cursor:pointer;font-weight:700;font-size:14px" onclick="cancelPlan()">Cancel My Subscription</button>';
  } else if (u.plan === 'owner') {
    html += '<p style="font-size:13px;color:#f59e0b">You are the owner. You have full free access to everything, forever.</p>';
  }

  html += '</div>' +

    // Account actions
    '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:24px">' +
    '<h3 style="font-size:16px;font-weight:700;color:#fff;margin:0 0 16px">Account</h3>' +
    '<button style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#e2e8f0;border-radius:10px;padding:14px;font-family:var(--font);cursor:pointer;font-weight:600;font-size:14px;margin-bottom:10px" onclick="showPage(\'dashboard\')">← Back to My Tools</button>' +
    '<button style="width:100%;box-sizing:border-box;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#f87171;border-radius:10px;padding:14px;font-family:var(--font);cursor:pointer;font-weight:600;font-size:14px" onclick="doLogout()">Log Out</button>' +
    '</div>' +

    '</div>';

  document.getElementById('account-content').innerHTML = html;
  showPage('account');
}

function accountRow(icon, label, value) {
  return '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">' +
    '<span style="font-size:18px">' + icon + '</span>' +
    '<span style="font-size:13px;color:var(--muted);min-width:110px">' + label + '</span>' +
    '<span style="font-size:14px;color:#fff;font-weight:600">' + value + '</span>' +
    '</div>';
}

function cancelPlan() {
  // Show a clear cancellation guide
  var body = document.getElementById('account-content');
  if (!body) return;

  body.innerHTML =
    '<div style="max-width:560px;margin:0 auto">' +
    '<div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);border-radius:16px;padding:28px">' +
    '<div style="font-size:44px;text-align:center;margin-bottom:14px"></div>' +
    '<h3 style="color:#fff;font-size:19px;text-align:center;margin-bottom:8px">Cancel Your Subscription</h3>' +
    '<p style="color:var(--muted);font-size:13px;text-align:center;line-height:1.7;margin-bottom:20px">We are sorry to see you go. To stop your R55/month charges, follow these quick steps — your subscription is managed securely by Paystack.</p>' +

    '<div style="background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.15);border-radius:12px;padding:18px;margin-bottom:18px">' +
    '<div style="font-size:13px;font-weight:700;color:#38bdf8;margin-bottom:12px">How to cancel (takes 1 minute):</div>' +
    '<div style="display:flex;flex-direction:column;gap:12px">' +
    '<div style="font-size:13px;color:#e2e8f0"><strong style="color:#38bdf8">1.</strong> Open your email inbox (' + (currentUser ? currentUser.email : 'your email') + ')</div>' +
    '<div style="font-size:13px;color:#e2e8f0"><strong style="color:#38bdf8">2.</strong> Search for the email: <em style="color:#fff">"Your subscription is now active"</em> from Paystack</div>' +
    '<div style="font-size:13px;color:#e2e8f0"><strong style="color:#38bdf8">3.</strong> Click the <strong style="color:#fff">"Manage Subscription"</strong> button inside it</div>' +
    '<div style="font-size:13px;color:#e2e8f0"><strong style="color:#38bdf8">4.</strong> Click <strong style="color:#f87171">"Cancel Subscription"</strong> and confirm</div>' +
    '</div></div>' +

    '<p style="font-size:12px;color:#64748b;line-height:1.6;margin-bottom:18px">You can also click "Manage Subscription" in any payment reminder email Paystack sends you before each charge. After cancelling, you keep access until your current paid month ends.</p>' +

    '<button class="btn-primary" style="width:100%;box-sizing:border-box;margin-bottom:10px" onclick="confirmCancelOnFile()">I Have Cancelled on Paystack</button>' +
    '<button style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#e2e8f0;border-radius:10px;padding:13px;font-family:var(--font);cursor:pointer;font-weight:600;font-size:14px" onclick="showAccount()">← Keep My Subscription</button>' +

    '<div style="margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);text-align:center">' +
    '<p style="font-size:12px;color:#64748b">Need help? Contact us: <strong style="color:#38bdf8">065 601 3544</strong></p>' +
    '</div>' +
    '</div></div>';
}

function confirmCancelOnFile() {
  var token = safeStorage.getItem('sb_token');
  // Tell the server to cancel (server is the source of truth)
  fetch(BACKEND_URL + '/api/cancel-plan', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ token: token })
  }).catch(function(){});

  if (currentUser) {
    currentUser.plan = 'cancelled';
    safeStorage.setItem('sb_current', JSON.stringify(currentUser));
  }
  fetch(BACKEND_URL + '/api/login-notify', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ fname:currentUser.fname, lname:currentUser.lname, email:currentUser.email, action:'cancel' })
  }).catch(function(){});

  updateNav();
  alert('Your subscription has been marked as cancelled. Remember to also cancel on Paystack to stop future charges. You are welcome back anytime!');
  showAccount();
}

function doLogout() {
  currentUser = null;
  safeStorage.removeItem('sb_token');
  safeStorage.removeItem('sb_current');
  updateNav();
  showPage('home');
}

function requireAuth(tool) {
  const saved = safeStorage.getItem('sb_current');
  if (saved) {
    currentUser = JSON.parse(saved);
    openTool(tool);
  } else {
    window._pendingTool = tool;
    showPage('signup');
  }
}

// ── Tools ──
function isTrialExpired(user) {
  if (!user) return true;
  // Owner and paid plans have full access
  if (user.plan === 'owner' || user.plan === 'monthly' || user.plan === 'yearly' || user.plan === 'pro' || user.plan === 'paid' || user.plan === 'business') return false;
  // NO FREE TRIAL - everyone else must subscribe (R55/month)
  return true;
}

function showTrialExpired() {
  var body = document.getElementById('tool-page-body');
  if (body) {
    document.getElementById('tool-page-title').textContent = 'Subscribe to Unlock';
    body.innerHTML =
      '<div class="tool-screen" style="text-align:center;padding:40px 20px">' +
      '<div style="font-size:56px;margin-bottom:16px"></div>' +
      '<h2 style="color:#fff;margin-bottom:10px">Subscribe to Unlock This Tool</h2>' +
      '<p style="color:var(--muted);font-size:14px;margin-bottom:24px;max-width:420px;margin-left:auto;margin-right:auto">Get full access to all premium Sky Blueprint tools for just <strong style="color:#38bdf8">R55/month</strong>. Cancel anytime. SA Map stays free forever.</p>' +
      '<div style="max-width:360px;margin:0 auto;display:flex;flex-direction:column;gap:10px">' +
      '<button class="btn-primary" style="width:100%;box-sizing:border-box;font-size:15px;padding:15px" onclick="startPaystack(\'monthly\')">Subscribe — R55/month</button>' +
      '<button style="width:100%;box-sizing:border-box;background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;border-radius:10px;padding:15px;font-family:var(--font);cursor:pointer;font-weight:700;font-size:15px" onclick="startPaystack(\'yearly\')">3-Year Plan — R1,980/year</button>' +
      '<button style="width:100%;box-sizing:border-box;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);color:#22c55e;border-radius:10px;padding:13px;font-family:var(--font);cursor:pointer;font-weight:600;font-size:14px;margin-top:6px" onclick="openTool(\'sa-map\')">Use SA Map (Free)</button>' +
      '</div></div>';
    showPage('tool');
  }
}

// Called at the FINAL action (download/submit). Returns true if the user may proceed,
// or shows a subscribe popup and returns false if they need to pay first.
function requirePaidAction(actionLabel) {
  if (!isTrialExpired(currentUser)) return true; // owner or paid - allow

  // Show a friendly subscribe popup
  var existing = document.getElementById('pay-action-modal');
  if (existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'pay-action-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.onclick = function(){ modal.remove(); };
  modal.innerHTML =
    '<div style="background:#0f1629;border:1px solid rgba(56,189,248,0.2);border-radius:20px;padding:28px;max-width:400px;width:100%;text-align:center" onclick="event.stopPropagation()">' +
    '<h3 style="color:#fff;font-size:19px;margin-bottom:10px">Subscribe to ' + (actionLabel || 'continue') + '</h3>' +
    '<p style="color:var(--muted);font-size:13px;margin-bottom:20px;line-height:1.6">You can build and preview for free. To ' + (actionLabel || 'use this') + ', subscribe to Sky Blueprint — just <strong style="color:#38bdf8">R55/month</strong>, cancel anytime.</p>' +
    '<div style="display:flex;flex-direction:column;gap:10px">' +
    '<button class="btn-primary" style="width:100%;box-sizing:border-box;font-size:15px;padding:14px" onclick="document.getElementById(\'pay-action-modal\').remove();startPaystack(\'monthly\')">Subscribe — R55/month</button>' +
    '<button style="width:100%;box-sizing:border-box;background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;border-radius:10px;padding:13px;font-family:var(--font);cursor:pointer;font-weight:700;font-size:14px" onclick="document.getElementById(\'pay-action-modal\').remove();startPaystack(\'yearly\')">3-Year Plan — R1,980/year</button>' +
    '<button style="width:100%;box-sizing:border-box;background:transparent;border:none;color:var(--muted);padding:8px;font-family:var(--font);cursor:pointer;font-size:13px" onclick="document.getElementById(\'pay-action-modal\').remove()">Maybe later</button>' +
    '</div></div>';
  document.body.appendChild(modal);
  return false;
}

function openTool(name) {
  const titles = {
    'website-builder': 'Website Builder',
    'email-cleaner': 'AI Email Secretary',
    'find-phone': 'Find My Phone',
    'ai-mentor': 'AI Business Mentor',
    'cv-builder': 'CV Builder & Jobs',
    'sa-map': 'SA Map',
    'reminders': 'Reminders & Tasks',
    'learnerships': 'Learnerships & Internships',
    'templates': 'Templates Store',
    'pdf-tools': 'PDF Tools',
    'customers': 'Customer Manager',
    'compressor': 'File Compressor',
    'imgeditor': 'Image Editor',
  };
  document.getElementById('tool-page-title').textContent = titles[name] || 'Tool';
  const body = document.getElementById('tool-page-body');
  body.innerHTML = '';
  const renderers = {
    'website-builder': renderWebsiteBuilder,
    'email-cleaner': renderEmailCleaner,
    'find-phone': renderFindPhone,
    'ai-mentor': renderAIMentor,
    'cv-builder': renderCVBuilder,
    'sa-map': renderSAMap,
    'reminders': renderReminders,
    'learnerships': renderLearnerships,
    'templates': renderTemplates,
    'pdf-tools': renderPDFTools,
    'customers': renderCustomerManager,
    'compressor': renderCompressor,
    'imgeditor': renderImageEditor,
  };
  // NEW MODEL: Most tools open freely so people can preview and enter details.
  // Payment is required at the final ACTION (download/submit) via requirePaidAction().
  // ONLY the AI tools that cost money per use are locked before opening.
  var payFirstTools = ['email-cleaner', 'ai-mentor'];
  if (payFirstTools.indexOf(name) > -1 && isTrialExpired(currentUser)) {
    showTrialExpired();
    return;
  }
  if (renderers[name]) renderers[name](body);
  showPage('tool');
}

// ── Website Builder ──
function renderWebsiteBuilder(el) {
  el.innerHTML = `
  <div class="tool-screen">
    <h2>Website Builder</h2>
    <p style="color:var(--muted);font-size:14px;margin-bottom:20px">
      Fill in your business details. We build your professional website in <strong style="color:#38bdf8">72 hours</strong> and deliver it directly to you.
    </p>

    <div id="wb-form">

            <!-- PERSONAL DETAILS -->
      <div class="cv-sec-title">Your Contact Details</div>
      <div class="form-row">
        <div class="form-group"><label>Full Name *</label><input type="text" id="wb-name" placeholder="e.g. Sipho Dlamini"></div>
        <div class="form-group"><label>Phone Number *</label><input type="tel" id="wb-phone" placeholder="e.g. 082 345 6789"></div>
      </div>
      <div class="form-group"><label>Email Address *</label><input type="email" id="wb-email" placeholder="e.g. sipho@gmail.com"></div>

      <!-- BUSINESS INFO -->
      <div class="cv-sec-title">Your Business Information</div>
      <div class="form-group"><label>Business Name *</label><input type="text" id="wb-biz" placeholder="e.g. Sipho Tech Solutions"></div>
      <div class="form-row">
        <div class="form-group"><label>Business Location / City *</label><input type="text" id="wb-city" placeholder="e.g. Cape Town, Western Cape"></div>
        <div class="form-group"><label>Business Type *</label>
          <select id="wb-cat">
            <option value="">Select your business type</option>
            <optgroup label="Retail & Commerce">
              <option>General Retail / Spaza Shop</option>
              <option>Clothing & Fashion Store</option>
              <option>Furniture & Home Decor</option>
              <option>Electronics & Gadgets</option>
              <option>Online Store / E-commerce</option>
            </optgroup>
            <optgroup label="Technology">
              <option>IT Support & Repairs</option>
              <option>Software Development</option>
              <option>Cellphone Repairs</option>
              <option>CCTV & Security Systems</option>
            </optgroup>
            <optgroup label="Food & Hospitality">
              <option>Restaurant / Takeaway</option>
              <option>Catering Services</option>
              <option>Bakery / Confectionery</option>
              <option>Coffee Shop / Cafe</option>
              <option>Event Catering</option>
            </optgroup>
            <optgroup label="Beauty & Wellness">
              <option>Hair Salon</option>
              <option>Nail Salon</option>
              <option>Barbershop</option>
              <option>Spa & Massage</option>
              <option>Makeup Artist</option>
              <option>Fitness & Personal Training</option>
            </optgroup>
            <optgroup label="Construction & Trades">
              <option>Construction & Building</option>
              <option>Plumbing Services</option>
              <option>Electrical Services</option>
              <option>Painting & Decorating</option>
              <option>Cleaning Services</option>
              <option>Landscaping & Gardening</option>
            </optgroup>
            <optgroup label="Transport & Logistics">
              <option>Taxi / Transport Service</option>
              <option>Courier & Delivery</option>
              <option>Car Wash & Detailing</option>
              <option>Panel Beating & Auto Repair</option>
              <option>Towing Services</option>
            </optgroup>
            <optgroup label="Health & Medical">
              <option>Medical Practice / Clinic</option>
              <option>Pharmacy</option>
              <option>Physiotherapy</option>
              <option>Traditional Healer</option>
              <option>Home Care Services</option>
            </optgroup>
            <optgroup label="Education & Training">
              <option>Tutoring / Extra Lessons</option>
              <option>Daycare / Creche</option>
              <option>Skills Training Centre</option>
              <option>Driving School</option>
            </optgroup>
            <optgroup label="⚖️ Professional Services">
              <option>Law Firm / Legal Services</option>
              <option>Accounting & Tax</option>
              <option>Insurance Brokerage</option>
              <option>Property / Real Estate</option>
              <option>Consulting Services</option>
            </optgroup>
            <optgroup label="⛪ Community & NGO">
              <option>Church / Ministry</option>
              <option>Non-Profit Organisation</option>
              <option>Community Centre</option>
              <option>Charity / Foundation</option>
            </optgroup>
            <optgroup label="Creative & Events">
              <option>Photography & Videography</option>
              <option>Graphic Design</option>
              <option>Event Planning</option>
              <option>Music & Entertainment</option>
              <option>Art & Crafts</option>
            </optgroup>
            <optgroup label="Agriculture">
              <option>Farming & Agriculture</option>
              <option>Poultry & Livestock</option>
              <option>Garden Supplies</option>
            </optgroup>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div class="form-group"><label>Describe your business *</label>
        <textarea id="wb-desc" rows="3" placeholder="Tell us what your business does, what you sell or offer, and who your customers are. The more detail the better!"></textarea>
      </div>

      <!-- DESIGN PREFERENCES -->
      <div class="cv-sec-title">Website Design Preferences</div>
      <div class="form-group"><label>Colour Theme *</label>
        <select id="wb-color">
          <option value="">-- Choose your colour theme --</option>
          <optgroup label="Professional & Corporate">
            <option value="navy-gold">Navy Blue & Gold — prestigious and trustworthy</option>
            <option value="dark-sky">Dark Navy & Sky Blue — modern tech feel (like Sky Blueprint)</option>
            <option value="black-white">Black & White — minimal and clean</option>
            <option value="charcoal-orange">Charcoal & Orange — bold and confident</option>
          </optgroup>
          <optgroup label="Bright & Energetic">
            <option value="red-white">Red & White — bold and eye-catching</option>
            <option value="orange-white">Orange & White — energetic and friendly</option>
            <option value="yellow-black">Yellow & Black — standout and vibrant</option>
            <option value="green-white">Green & White — fresh and natural</option>
          </optgroup>
          <optgroup label="Soft & Elegant (Popular with Women)">
            <option value="pink-white">Pink & White — soft and feminine</option>
            <option value="rose-gold">Rose Gold & White — luxury and elegant</option>
            <option value="purple-white">Purple & White — creative and stylish</option>
            <option value="lavender-white">Lavender & Cream — gentle and calming</option>
            <option value="teal-white">Teal & White — refreshing and sophisticated</option>
          </optgroup>
          <optgroup label="Luxury & Premium">
            <option value="black-gold">Black & Gold — luxury and premium</option>
            <option value="burgundy-gold">Burgundy & Gold — rich and exclusive</option>
            <option value="emerald-gold">Emerald Green & Gold — elite and distinguished</option>
          </optgroup>
          <optgroup label="Natural & Organic">
            <option value="brown-cream">Brown & Cream — earthy and warm</option>
            <option value="forest-white">Forest Green & White — organic and natural</option>
            <option value="olive-beige">Olive & Beige — nature and wellness</option>
          </optgroup>
          <optgroup label="Health & Medical">
            <option value="blue-white-med">Blue & White — clinical and trusted</option>
            <option value="green-blue">Green & Blue — health and wellbeing</option>
          </optgroup>
          <optgroup label="Church & Community">
            <option value="royal-gold">Royal Blue & Gold — spiritual and dignified</option>
            <option value="white-purple">White & Purple — peaceful and spiritual</option>
          </optgroup>
          <option value="custom">I will describe my colours in the notes below</option>
        </select>
      </div>

      <!-- PREMIUM PACKAGE OPTION -->
      <div class="cv-sec-title">Website Package</div>
      <div class="form-group">
        <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;background:linear-gradient(135deg,rgba(168,85,247,0.06),rgba(99,102,241,0.05));border:1px solid rgba(168,85,247,0.25);border-radius:12px;padding:16px">
          <input type="checkbox" id="wb-premium" onchange="updateWbPrice()" style="width:18px;height:18px;accent-color:#a855f7;cursor:pointer;margin-top:2px">
          <span style="flex:1">
            <strong style="color:#fff;font-size:14px">Upgrade to Premium — R3,500 all-inclusive</strong><br>
            <span style="font-size:12px;color:var(--muted);line-height:1.7;display:block;margin-top:6px">
              Everything done for you: up to 5 pages, online payment setup (Paystack), custom favicon, .co.za domain (1st year free), business email setup, and 1 month priority support. No extra fees.
            </span>
          </span>
        </label>
        <p style="font-size:10px;color:#64748b;margin-top:6px">Leave unticked for our standard R450 website build (you can still add a domain & favicon below).</p>
      </div>

      <!-- DOMAIN & PRICING -->
      <div class="cv-sec-title">Domain & Pricing</div>
      <div class="form-group"><label>Domain Preference *</label>
        <select id="wb-domain" onchange="updateWbPrice()">
          <option value="none">No domain needed — use free Sky Blueprint link (R0 extra)</option>
          <option value="com">.com domain — global standard e.g. mybusiness.com (+R300)</option>
          <option value="coza">.co.za domain — most trusted SA domain e.g. mybusiness.co.za (+R500)</option>
          <option value="net">.net domain — tech and networking sites (+R300)</option>
          <option value="org">.org domain — NGOs, churches, non-profits (+R300)</option>
          <option value="own">I already have a domain — just build the site (R0 extra)</option>
        </select>
      </div>
      <div id="wb-own-domain-wrap" style="display:none">
        <div class="form-group"><label>Your existing domain name</label><input type="text" id="wb-domain-name" placeholder="e.g. mybusiness.co.za"></div>
      </div>

      <!-- HOSTINGER PARTNER OPTION -->
      <div style="background:linear-gradient(135deg,rgba(103,58,183,0.08),rgba(56,189,248,0.05));border:1px solid rgba(103,58,183,0.25);border-radius:14px;padding:16px;margin-bottom:20px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          <strong style="color:#fff;font-size:14px">Want to own your domain & hosting yourself?</strong>
        </div>
        <p style="font-size:12px;color:var(--muted);line-height:1.7;margin-bottom:12px">
          You can buy your own domain and hosting directly from <strong style="color:#a78bfa">Hostinger</strong> — our trusted partner. It is affordable, reliable, and you keep full control of your domain. Great if you want everything in your own name.
        </p>
        <a href="https://www.hostinger.com?REFERRALCODE=XONLETHUMW3C" target="_blank" rel="noopener" style="display:inline-block;background:linear-gradient(135deg,#673ab7,#38bdf8);color:#fff;text-decoration:none;border-radius:10px;padding:10px 20px;font-size:13px;font-weight:700;font-family:var(--font)">Get Hostinger Hosting & Domain →</a>
      </div>

      <!-- FAVICON ADD-ON -->
      <div class="form-group">
        <label style="display:flex;align-items:center;gap:10px;cursor:pointer;background:rgba(56,189,248,0.04);border:1px solid rgba(56,189,248,0.15);border-radius:10px;padding:14px">
          <input type="checkbox" id="wb-favicon" onchange="updateWbPrice()" style="width:18px;height:18px;accent-color:#38bdf8;cursor:pointer">
          <span style="flex:1"><strong style="color:#fff;font-size:13px">Add a custom favicon</strong><br><span style="font-size:11px;color:var(--muted)">Your business logo icon in the browser tab — looks professional (+R50 once-off)</span></span>
        </label>
      </div>

      <!-- PRICE SUMMARY -->
      <div style="background:linear-gradient(135deg,rgba(56,189,248,0.08),rgba(99,102,241,0.06));border:1px solid rgba(56,189,248,0.25);border-radius:16px;padding:22px;margin:16px 0">
        <div style="font-size:13px;font-weight:700;color:#38bdf8;margin-bottom:16px;text-transform:uppercase;letter-spacing:1px">Order Summary</div>
        <div id="wb-base-row" style="display:flex;justify-content:space-between;margin-bottom:9px;font-size:13px">
          <span style="color:var(--muted)" id="wb-base-label">Website Design & Build (72 hours)</span>
          <span style="color:#fff;font-weight:600" id="wb-base-price">R450</span>
        </div>
        <div id="wb-premium-row" style="display:none;margin-bottom:9px;font-size:11px;color:#a855f7;line-height:1.6">✓ 5 pages · Paystack setup · favicon · .co.za domain (1st yr) · business email · priority support</div>
        <div id="wb-domain-row" style="display:none;justify-content:space-between;margin-bottom:9px;font-size:13px">
          <span style="color:var(--muted)" id="wb-domain-label">Domain</span>
          <span style="color:#38bdf8;font-weight:600" id="wb-domain-price">R0</span>
        </div>
        <div id="wb-favicon-row" style="display:none;justify-content:space-between;margin-bottom:9px;font-size:13px">
          <span style="color:var(--muted)">Custom favicon icon</span>
          <span style="color:#38bdf8;font-weight:600">R50</span>
        </div>
        <div style="border-top:1px solid rgba(56,189,248,0.25);padding-top:12px;margin-top:6px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:14px;font-weight:700;color:#fff">Total Once-Off</span>
          <span style="font-size:22px;font-weight:800;color:#10b981" id="wb-total-price">R450</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding-top:10px;border-top:1px dashed rgba(255,255,255,0.1)">
          <span style="font-size:13px;color:#a855f7;font-weight:600">+ Monthly Hosting</span>
          <span style="font-size:15px;font-weight:700;color:#a855f7">R55/month</span>
        </div>
        <div style="margin-top:12px;font-size:11px;color:#64748b;line-height:1.6">The once-off fee covers building your site. The R55/month keeps your website online, hosted, and maintained. Cancel anytime.</div>
      </div>

      <!-- EXTRAS -->
      <div class="cv-sec-title">Extra Information</div>
      <div class="form-group"><label>Do you have a logo?</label>
        <select id="wb-logo">
          <option value="no">No logo — Sky Blueprint will create one for me</option>
          <option value="yes">Yes — I will send it by WhatsApp or email</option>
        </select>
      </div>
      <div class="form-group"><label>Pages needed on your website</label>
        <select id="wb-pages">
          <option value="basic">Basic — Home, About, Contact (included)</option>
          <option value="services">Standard — Home, About, Services, Contact</option>
          <option value="full">Full — Home, About, Services, Gallery, Testimonials, Contact</option>
          <option value="shop">Shop — Home, Products, Cart, About, Contact</option>
        </select>
      </div>
      <div class="form-group"><label>Any special features or requests?</label>
        <textarea id="wb-extra" rows="2" placeholder="e.g. WhatsApp chat button, booking form, photo gallery, Facebook page link, specific images I want, anything important..."></textarea>
      </div>

      <button class="btn-primary" style="width:100%;box-sizing:border-box;font-size:16px;padding:16px;margin-top:8px" onclick="submitWebsiteOrder()">
        Submit My Website Application
      </button>
      <p style="font-size:12px;color:var(--muted);text-align:center;margin-top:10px">
        Sky Blueprint will contact you within 24 hours to confirm. Website delivered within 72 hours guaranteed.
      </p>
    </div>

    <div id="wb-success" style="display:none">
      <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:16px;padding:32px;text-align:center">
        <div style="font-size:52px;margin-bottom:16px"></div>
        <h3 style="color:#10b981;font-size:22px;margin-bottom:10px">Application Submitted!</h3>
        <p style="color:var(--muted);font-size:14px;margin-bottom:24px;line-height:1.7">Your website application has been sent to Sky Blueprint. We will contact you within <strong style="color:#fff">24 hours</strong> to confirm all details and begin building your website.</p>
        <div style="background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.15);border-radius:12px;padding:20px;margin-bottom:20px;text-align:left">
          <div style="font-size:13px;font-weight:700;color:#38bdf8;margin-bottom:12px">What happens next:</div>
          <div style="display:flex;flex-direction:column;gap:10px">
            <div style="font-size:13px;color:var(--muted)"><strong style="color:#fff">Now</strong> — Application received by Sky Blueprint</div>
            <div style="font-size:13px;color:var(--muted)"><strong style="color:#fff">Within 24 hours</strong> — We call you to confirm all details</div>
            <div style="font-size:13px;color:var(--muted)"><strong style="color:#fff">Hours 24–72</strong> — Your website is being designed and built</div>
            <div style="font-size:13px;color:var(--muted)"><strong style="color:#fff">Hour 72</strong> — Website is live and delivered to you!</div>
          </div>
        </div>
        <div style="font-size:14px;color:var(--muted)">Contact us anytime: <strong style="color:#38bdf8">065 601 3544</strong></div>
      </div>
    </div>
  </div>`;

  // Domain change listener
  setTimeout(function() {
    var sel = document.getElementById('wb-domain');
    if (sel) sel.addEventListener('change', updateWbPrice);
  }, 100);
}

function updateWbPrice() {
  // Premium package option
  var premiumEl = document.getElementById('wb-premium');
  var isPremium = premiumEl && premiumEl.checked;

  var val = (document.getElementById('wb-domain') || {value:'none'}).value;
  var extras = { none:0, com:300, coza:500, net:300, org:300, own:0 };
  var labels = { com:'.com domain', coza:'.co.za domain', net:'.net domain', org:'.org domain' };
  var extra = extras[val] || 0;
  var row = document.getElementById('wb-domain-row');
  var label = document.getElementById('wb-domain-label');
  var price = document.getElementById('wb-domain-price');
  var total = document.getElementById('wb-total-price');
  var ownWrap = document.getElementById('wb-own-domain-wrap');
  var favicon = document.getElementById('wb-favicon');
  var favRow = document.getElementById('wb-favicon-row');
  var baseRow = document.getElementById('wb-base-row');
  var baseLabel = document.getElementById('wb-base-label');
  var basePrice = document.getElementById('wb-base-price');
  var premRow = document.getElementById('wb-premium-row');

  var faviconFee = (favicon && favicon.checked) ? 50 : 0;

  if (isPremium) {
    // Premium is R3,500 all-inclusive (domain + favicon included)
    extra = 0; faviconFee = 0;
    if (baseLabel) baseLabel.textContent = 'Premium Package (all-inclusive)';
    if (basePrice) basePrice.textContent = 'R3,500';
    if (premRow) premRow.style.display = 'block';
    if (ownWrap) ownWrap.style.display = 'none';
    if (row) row.style.display = 'none';
    if (favRow) favRow.style.display = 'none';
    if (total) total.textContent = 'R3,500';
    return;
  }

  // Standard R450 build
  if (baseLabel) baseLabel.textContent = 'Website Design & Build (72 hours)';
  if (basePrice) basePrice.textContent = 'R450';
  if (premRow) premRow.style.display = 'none';
  if (ownWrap) ownWrap.style.display = val === 'own' ? 'block' : 'none';
  if (row) row.style.display = extra > 0 ? 'flex' : 'none';
  if (label && labels[val]) label.textContent = labels[val];
  if (price) price.textContent = 'R' + extra;
  if (favRow) favRow.style.display = faviconFee > 0 ? 'flex' : 'none';
  if (total) total.textContent = 'R' + (450 + extra + faviconFee);
}

function submitWebsiteOrder() {
  if (!requirePaidAction('submit your website order')) return;
  var isPremium = (document.getElementById('wb-premium') || {checked:false}).checked;
  var name   = (document.getElementById('wb-name')  ||{value:''}).value.trim();
  var phone  = (document.getElementById('wb-phone') ||{value:''}).value.trim();
  var email  = (document.getElementById('wb-email') ||{value:''}).value.trim();
  var biz    = (document.getElementById('wb-biz')   ||{value:''}).value.trim();
  var city   = (document.getElementById('wb-city')  ||{value:''}).value.trim();
  var cat    = (document.getElementById('wb-cat')   ||{value:''}).value;
  var desc   = (document.getElementById('wb-desc')  ||{value:''}).value.trim();
  var color  = (document.getElementById('wb-color') ||{value:''}).value;
  var domain = (document.getElementById('wb-domain')||{value:'none'}).value;
  var logo   = (document.getElementById('wb-logo')  ||{value:''}).value;
  var pages  = (document.getElementById('wb-pages') ||{value:''}).value;
  var extra  = (document.getElementById('wb-extra') ||{value:''}).value.trim();
  var ownDom = (document.getElementById('wb-domain-name')||{value:''}).value.trim();

  if (!name||!phone||!email||!biz||!city||!cat||!desc||!color||!domain) {
    alert('Please fill in all required fields marked with *');
    return;
  }

  var domainLabels = { none:'Free Sky Blueprint link (no domain)', com:'.com domain (+R300)', coza:'.co.za domain (+R500)', net:'.net domain (+R300)', org:'.org domain (+R300)', own:'Own domain: ' + ownDom };
  var totals = { none:450, com:750, coza:950, net:750, org:750, own:450 };
  var colorNames = {
    'navy-gold':'Navy Blue & Gold','dark-sky':'Dark Navy & Sky Blue','black-white':'Black & White',
    'charcoal-orange':'Charcoal & Orange','red-white':'Red & White','orange-white':'Orange & White',
    'yellow-black':'Yellow & Black','green-white':'Green & White','pink-white':'Pink & White',
    'rose-gold':'Rose Gold & White','purple-white':'Purple & White','lavender-white':'Lavender & Cream',
    'teal-white':'Teal & White','black-gold':'Black & Gold','burgundy-gold':'Burgundy & Gold',
    'emerald-gold':'Emerald Green & Gold','brown-cream':'Brown & Cream','forest-white':'Forest Green & White',
    'olive-beige':'Olive & Beige','blue-white-med':'Blue & White (Medical)','green-blue':'Green & Blue',
    'royal-gold':'Royal Blue & Gold','white-purple':'White & Purple','custom':'Custom (see notes)'
  };

  var faviconChecked = (document.getElementById('wb-favicon') || {checked:false}).checked;
  var domainExtra = { none:0, com:300, coza:500, net:300, org:300, own:0 }[domain] || 0;
  var faviconFee = faviconChecked ? 50 : 0;
  var grandTotal;
  if (isPremium) { grandTotal = 3500; domainExtra = 0; faviconFee = 0; }
  else { grandTotal = 450 + domainExtra + faviconFee; }

  var order = {
    name:name, phone:phone, email:email,
    package: isPremium ? 'PREMIUM (R3,500 all-inclusive)' : 'Standard (R450 build)',
    business:biz, city:city, category:cat,
    description:desc, colorTheme:colorNames[color]||color,
    domain: isPremium ? '.co.za domain (included in Premium)' : domainLabels[domain],
    logo:logo, pages:pages,
    favicon: isPremium ? 'Yes — included in Premium' : (faviconChecked ? 'Yes — custom favicon (+R50)' : 'No favicon'),
    monthlyHosting: 'R55/month hosting',
    totalCharge:'R'+grandTotal.toLocaleString()+' once-off + R55/month hosting',
    extraRequests:extra,
    orderTime:new Date().toLocaleString('en-ZA',{timeZone:'Africa/Johannesburg'})
  };

  fetch(BACKEND_URL + '/api/website-order', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(order)
  }).catch(function(){});

  document.getElementById('wb-form').style.display = 'none';
  document.getElementById('wb-success').style.display = 'block';
}


function renderEmailCleaner(el) {
  el.innerHTML = `
  <div class="tool-screen">
    <h2>AI Email Secretary</h2>
    <p style="color:var(--muted);font-size:14px;margin-bottom:6px">Your AI secretary that manages your inbox while you work.</p>
    <p style="font-size:12px;color:#38bdf8;margin-bottom:20px;font-style:italic">"Turn 500 emails into 5 important tasks."</p>

    <div class="tab-bar">
      <div class="tab active" onclick="emailTab('connect',this)">Connect</div>
      <div class="tab" onclick="emailTab('inbox',this)">My Inbox</div>
      <div class="tab" onclick="emailTab('summary',this)">Daily Summary</div>
      <div class="tab" onclick="emailTab('blocked',this)">Blocked</div>
    </div>

    <!-- CONNECT TAB -->
    <div id="et-connect">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:18px">
        <div style="background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:10px 6px;text-align:center"><div style="font-size:12px;font-weight:700;color:#ef4444">Urgent</div><div style="font-size:10px;color:var(--muted)">act now</div></div>
        <div style="background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.2);border-radius:10px;padding:10px 6px;text-align:center"><div style="font-size:12px;font-weight:700;color:#f59e0b">Important</div><div style="font-size:10px;color:var(--muted)">today</div></div>
        <div style="background:rgba(16,185,129,0.07);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:10px 6px;text-align:center"><div style="font-size:12px;font-weight:700;color:#10b981">Can Wait</div><div style="font-size:10px;color:var(--muted)">this week</div></div>
        <div style="background:rgba(100,116,139,0.07);border:1px solid rgba(100,116,139,0.25);border-radius:10px;padding:10px 6px;text-align:center"><div style="font-size:12px;font-weight:700;color:#94a3b8">Low</div><div style="font-size:10px;color:var(--muted)">ignore</div></div>
      </div>
      <p style="font-size:13px;color:var(--muted);margin-bottom:16px">Connect your email — your AI secretary reads, sorts and summarises your whole inbox into these four piles automatically.</p>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px">
        <div class="email-provider-card" onclick="selectProvider('gmail',this)">
          <div style="margin-bottom:8px"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ea4335" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg></div>
          <div style="font-size:13px;font-weight:700;color:#fff">Gmail</div>
          <div style="font-size:11px;color:var(--muted)">Google</div>
        </div>
        <div class="email-provider-card" onclick="selectProvider('outlook',this)">
          <div style="margin-bottom:8px"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0078d4" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg></div>
          <div style="font-size:13px;font-weight:700;color:#fff">Outlook</div>
          <div style="font-size:11px;color:var(--muted)">Microsoft</div>
        </div>
        <div class="email-provider-card" onclick="selectProvider('yahoo',this)">
          <div style="margin-bottom:8px"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7e22ce" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg></div>
          <div style="font-size:13px;font-weight:700;color:#fff">Yahoo</div>
          <div style="font-size:11px;color:var(--muted)">Yahoo Mail</div>
        </div>
      </div>

      <div id="email-form" style="display:none">
        <div class="form-group">
          <label id="email-label">Email Address</label>
          <input type="email" id="ec-email" placeholder="your@email.com">
        </div>
        <div class="form-group">
          <label id="pass-label">Password / App Password</label>
          <div style="position:relative">
          <input type="password" id="ec-pass" placeholder="Your password" style="width:100%;box-sizing:border-box;padding-right:44px">
          <button type="button" onclick="togglePass('ec-pass',this)" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:4px"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg></button>
        </div>
          <div id="pass-hint" style="font-size:11px;color:#38bdf8;margin-top:6px;display:none"></div>
        </div>
        <button class="btn-primary" style="width:100%;box-sizing:border-box" onclick="scanEmails()">
          Scan My Inbox with AI
        </button>
      </div>

      <div id="ec-error" style="display:none;margin-top:16px"></div>
    </div>

    <!-- INBOX TAB -->
    <div id="et-inbox" style="display:none"></div>

    <!-- SUMMARY TAB -->
    <div id="et-summary" style="display:none">
      <div style="text-align:center;padding:40px 20px;color:var(--muted)">
        <div style="margin-bottom:14px"><svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9h10M7 13h6"/></svg></div>
        <p>Connect your email first to see your Daily Summary</p>
      </div>
    </div>

    <!-- BLOCKED TAB -->
    <div id="et-blocked" style="display:none">
      <div id="blocked-list"></div>
      <button onclick="clearAllBlocked()" style="width:100%;box-sizing:border-box;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;border-radius:10px;padding:12px;font-family:var(--font);cursor:pointer;font-size:13px;font-weight:600;margin-top:10px">Unblock All Senders</button>
    </div>
  </div>`;

  // Load blocked senders on render
  setTimeout(loadBlockedList, 100);
}

function emailTab(tab, el) {
  var tabs = ['connect','inbox','summary','blocked'];
  tabs.forEach(function(t) {
    var el2 = document.getElementById('et-' + t);
    if (el2) el2.style.display = 'none';
  });
  var target = document.getElementById('et-' + tab);
  if (target) target.style.display = 'block';
  document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
  if (el) el.classList.add('active');
}

function selectProvider(provider, card) {
  document.querySelectorAll('.email-provider-card').forEach(function(c){ c.style.borderColor='rgba(255,255,255,0.08)'; });
  card.style.borderColor = '#38bdf8';
  window._emailProvider = provider;
  document.getElementById('email-form').style.display = 'block';

  var hints = {
    gmail: '⚠️ Gmail requires an App Password — not your normal password.<br>Go to myaccount.google.com → Security → App Passwords → create one named "Sky Blueprint"',
    outlook: '✅ Outlook accepts your normal password',
    yahoo: '⚠️ Yahoo requires an App Password from login.yahoo.com → Account Security'
  };
  var hint = document.getElementById('pass-hint');
  hint.innerHTML = hints[provider] || '';
  hint.style.display = 'block';
}

function scanEmails() {
  var provider = window._emailProvider;
  var email = document.getElementById('ec-email').value.trim();
  var pass = document.getElementById('ec-pass').value;

  if (!provider) { alert('Please select your email provider first'); return; }
  if (!email || !pass) { alert('Please enter your email and password'); return; }

  var errDiv = document.getElementById('ec-error');
  errDiv.style.display = 'none';

  // Show engaging scanning animation with live status steps
  document.getElementById('et-connect').innerHTML +=
    '<div id="ec-scanning" style="text-align:center;padding:30px 20px;margin-top:16px;background:rgba(56,189,248,0.04);border:1px solid rgba(56,189,248,0.15);border-radius:16px">' +
    '<div style="display:inline-block;width:44px;height:44px;border:3px solid rgba(56,189,248,0.15);border-top-color:#38bdf8;border-radius:50%;animation:spin 0.9s linear infinite;margin-bottom:16px"></div>' +
    '<div id="ec-scan-step" style="font-size:15px;font-weight:700;color:#38bdf8;margin-bottom:8px;min-height:22px">Connecting securely to your inbox...</div>' +
    '<div style="font-size:12px;color:var(--muted)">Your password is used only for this scan — never stored.</div>' +
    '<div style="margin-top:16px;height:5px;background:rgba(56,189,248,0.1);border-radius:3px;overflow:hidden">' +
    '<div style="height:100%;background:linear-gradient(90deg,#38bdf8,#6366f1);border-radius:3px;animation:progress 30s linear forwards"></div>' +
    '</div></div>';

  // Rotate through live status messages so it feels alive
  var scanSteps = [
    'Connecting securely to your inbox...',
    'Reading your latest emails...',
    'AI is sorting by priority...',
    'Flagging urgent messages...',
    'Detecting spam and noise...',
    'Preparing your daily summary...'
  ];
  var stepIdx = 0;
  window._scanStepTimer = setInterval(function(){
    stepIdx = (stepIdx + 1) % scanSteps.length;
    var el2 = document.getElementById('ec-scan-step');
    if (el2) el2.textContent = scanSteps[stepIdx];
    else clearInterval(window._scanStepTimer);
  }, 4500);

  window._emailSession = { provider: provider, email: email, password: pass };

  fetch(BACKEND_URL + '/api/scan-emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: provider, email: email, password: pass })
  })
  .then(function(r){ return r.json(); })
  .then(function(data) {
    if (window._scanStepTimer) clearInterval(window._scanStepTimer);
    var scan = document.getElementById('ec-scanning');
    if (scan) scan.remove();
    if (data.success) {
      showAIInbox(data, email);
    } else {
      showEmailError(data.message || data.error || 'Could not connect. Check your password and try again.');
    }
  })
  .catch(function(err) {
    if (window._scanStepTimer) clearInterval(window._scanStepTimer);
    var scan = document.getElementById('ec-scanning');
    if (scan) scan.remove();
    showEmailError('Connection failed. Please check your internet connection and try again.');
  });
}

// ── CATEGORISE EMAILS USING AI RULES ──
function categoriseEmail(email) {
  var from = (email.from || '').toLowerCase();
  var subject = (email.subject || '').toLowerCase();
  var text = (from + ' ' + subject);

  // 🔴 URGENT
  var urgentKw = ['interview','job offer','offer letter','urgent','invoice','payment','banking','bank alert','otp','security alert','password reset','suspicious','login attempt','account suspended','verify your','action required','final notice','court','legal','sars','tax','government','department of','municipality','police','medical','hospital','doctor'];
  for (var i = 0; i < urgentKw.length; i++) {
    if (text.indexOf(urgentKw[i]) > -1) return { cat:'urgent', label:'🔴 Urgent', color:'#ef4444', bg:'rgba(239,68,68,0.08)', border:'rgba(239,68,68,0.25)' };
  }

  // 🟡 IMPORTANT
  var importantKw = ['school','university','college','tvet','learnership','appointment','delivery','order confirmed','tracking','shipment','your order','booking','confirmation','receipt','statement','insurance','discovery','vodacom','mtn','telkom','cellc','rain','nedbank','absa','fnb','capitec','standard bank'];
  for (var i = 0; i < importantKw.length; i++) {
    if (text.indexOf(importantKw[i]) > -1) return { cat:'important', label:'🟡 Important', color:'#f59e0b', bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.25)' };
  }

  // ⚪ LOW PRIORITY
  var lowKw = ['spotify','netflix','showmax','dstv','youtube','instagram','facebook','twitter','tiktok','gaming','entertainment','music','subscribe','unsubscribe','newsletter'];
  for (var i = 0; i < lowKw.length; i++) {
    if (text.indexOf(lowKw[i]) > -1) return { cat:'low', label:'⚪ Low Priority', color:'#64748b', bg:'rgba(100,116,139,0.06)', border:'rgba(100,116,139,0.2)' };
  }

  // 🟢 CAN WAIT (promotions/spam from our list)
  return { cat:'canwait', label:'🟢 Can Wait', color:'#10b981', bg:'rgba(16,185,129,0.06)', border:'rgba(16,185,129,0.2)' };
}

function showAIInbox(data, userEmail) {
  var allEmails = (data.important || []).concat(data.spam || []);
  var blocked = JSON.parse(safeStorage.getItem('sb_blocked') || '[]');

  // Filter out blocked senders
  allEmails = allEmails.filter(function(e) {
    return !blocked.some(function(b) { return (e.from||'').toLowerCase().indexOf(b.toLowerCase()) > -1; });
  });

  // Categorise all emails
  var cats = { urgent:[], important:[], canwait:[], low:[] };
  allEmails.forEach(function(e) {
    // Also treat server-detected spam as "can wait"
    var cat = data.spam && data.spam.find(function(s){ return s.uid === e.uid; }) ?
      { cat:'canwait', label:'🟢 Can Wait', color:'#10b981', bg:'rgba(16,185,129,0.06)', border:'rgba(16,185,129,0.2)' } :
      categoriseEmail(e);
    e._cat = cat;
    if (cats[cat.cat]) cats[cat.cat].push(e);
    else cats.canwait.push(e);
  });

  // Build daily summary
  buildDailySummary(cats, userEmail);

  // Build inbox HTML
  var html = '';

  // Stats bar
  html += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:16px">' +
    statBox('🔴', cats.urgent.length, 'Urgent', '#ef4444') +
    statBox('🟡', cats.important.length, 'Important', '#f59e0b') +
    statBox('🟢', cats.canwait.length, 'Can Wait', '#10b981') +
    statBox('⚪', cats.low.length, 'Low', '#64748b') +
    '</div>';

  // Smart action buttons
  html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">' +
    '<button onclick="deleteCategory(\'canwait\')" style="flex:1;min-width:120px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font)">Delete Can Wait</button>' +
    '<button onclick="deleteCategory(\'low\')" style="flex:1;min-width:120px;background:rgba(100,116,139,0.1);border:1px solid rgba(100,116,139,0.2);color:#94a3b8;border-radius:8px;padding:9px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font)">Delete Low Priority</button>' +
    '</div>';

  // Render each category
  ['urgent','important','canwait','low'].forEach(function(catKey) {
    var emails = cats[catKey];
    if (!emails.length) return;
    var catInfo = emails[0]._cat;

    html += '<div style="margin-bottom:20px">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:' + catInfo.color + ';margin-bottom:8px;padding:6px 12px;background:' + catInfo.bg + ';border-radius:6px;border-left:3px solid ' + catInfo.color + '">' +
      catInfo.label + ' — ' + emails.length + ' emails</div>';

    emails.forEach(function(e) {
      html += '<div class="email-item" id="em-' + e.uid + '" style="background:' + catInfo.bg + ';border:1px solid ' + catInfo.border + ';border-radius:10px;padding:12px;margin-bottom:8px">' +
        '<div style="display:flex;align-items:flex-start;gap:10px">' +
        '<div style="flex:1;min-width:0">' +
        '<div style="font-size:13px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (e.from||'Unknown') + '</div>' +
        '<div style="font-size:12px;color:var(--muted);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + (e.subject||'No subject') + '</div>' +
        '<div style="font-size:11px;color:#475569;margin-top:2px">' + (e.date||'') + '</div>' +
        '</div>' +
        '<div style="display:flex;gap:6px;flex-shrink:0">' +
        (catKey !== 'urgent' && catKey !== 'important' ?
          '<button onclick="deleteOneEmail(' + e.uid + ',\'em-' + e.uid + '\')" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:11px;font-family:var(--font)">Delete</button>' : '') +
        '<button onclick="blockSender(this.dataset.sender)" data-sender="' + (e.from||'').replace(/"/g,'') + '" style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);color:#f59e0b;border-radius:6px;padding:4px 8px;cursor:pointer;font-size:11px;font-family:var(--font)">Block</button>' +
        '</div></div></div>';
    });

    html += '</div>';
  });

  window._allEmails = allEmails;
  window._emailCats = cats;
  document.getElementById('et-inbox').innerHTML = html;

  // Switch to inbox tab
  document.querySelectorAll('.tab').forEach(function(t,i){ t.classList.remove('active'); if(i===1) t.classList.add('active'); });
  document.getElementById('et-connect').style.display = 'none';
  document.getElementById('et-inbox').style.display = 'block';
  document.getElementById('et-summary').style.display = 'none';
  document.getElementById('et-blocked').style.display = 'none';
}

function statBox(icon, count, label, color) {
  return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:10px;text-align:center">' +
    '<div style="font-size:18px">' + icon + '</div>' +
    '<div style="font-size:20px;font-weight:800;color:#fff">' + count + '</div>' +
    '<div style="font-size:10px;color:' + color + ';font-weight:600">' + label + '</div>' +
    '</div>';
}

function buildDailySummary(cats, email) {
  var now = new Date().toLocaleDateString('en-ZA', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  var total = cats.urgent.length + cats.important.length + cats.canwait.length + cats.low.length;

  var html = '<div style="background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.2);border-radius:14px;padding:20px;margin-bottom:16px">' +
    '<div style="font-size:11px;color:#38bdf8;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">AI Secretary Daily Summary</div>' +
    '<div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:16px">' + now + '</div>' +
    '<div style="font-size:13px;color:var(--muted);margin-bottom:16px">Scanned <strong style="color:#fff">' + total + ' emails</strong> in your inbox. Here is what matters today:</div>';

  if (cats.urgent.length > 0) {
    html += summaryLine('🔴', cats.urgent.length, 'urgent email' + (cats.urgent.length>1?'s':'') + ' need your attention NOW', '#ef4444');
  }
  if (cats.important.length > 0) {
    html += summaryLine('🟡', cats.important.length, 'important email' + (cats.important.length>1?'s':'') + ' to read today', '#f59e0b');
  }
  if (cats.canwait.length > 0) {
    html += summaryLine('🟢', cats.canwait.length, 'promotional email' + (cats.canwait.length>1?'s':'') + ' — can be deleted', '#10b981');
  }
  if (cats.low.length > 0) {
    html += summaryLine('⚪', cats.low.length, 'low priority (entertainment/social)', '#64748b');
  }

  html += '<div style="margin-top:16px;padding-top:14px;border-top:1px solid rgba(56,189,248,0.15);font-size:12px;color:#475569">✅ AI Secretary has sorted your inbox. Focus only on 🔴 Urgent and 🟡 Important emails today.</div>' +
    '</div>';

  // Security tip if urgent emails found
  var scamWarnings = cats.urgent.filter(function(e){
    var t = (e.from+e.subject).toLowerCase();
    return t.indexOf('password reset')>-1 || t.indexOf('suspicious')>-1 || t.indexOf('verify')>-1 || t.indexOf('account suspended')>-1;
  });
  if (scamWarnings.length > 0) {
    html += '<div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:14px;margin-bottom:16px">' +
      '<div style="font-size:13px;font-weight:700;color:#ef4444;margin-bottom:6px">⚠️ Security Warning</div>' +
      '<div style="font-size:12px;color:var(--muted)">AI detected ' + scamWarnings.length + ' email(s) that may be suspicious (fake password resets, account warnings or scam attempts). Do not click any links in these emails unless you are 100% sure they are real.</div>' +
      '</div>';
  }

  html += '<button onclick="emailTab(\'inbox\',document.querySelectorAll(\'.tab\')[1])" class="btn-primary" style="width:100%;box-sizing:border-box">View Full Inbox</button>';

  document.getElementById('et-summary').innerHTML = html;
}

function summaryLine(icon, count, text, color) {
  return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
    '<div style="width:32px;height:32px;border-radius:50%;background:' + color + '22;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">' + icon + '</div>' +
    '<div style="font-size:13px;color:#e2e8f0"><strong style="color:#fff">' + count + '</strong> ' + text + '</div>' +
    '</div>';
}

function deleteCategory(catKey) {
  var cats = window._emailCats;
  if (!cats || !cats[catKey] || cats[catKey].length === 0) {
    alert('No emails in this category');
    return;
  }
  var uids = cats[catKey].map(function(e){ return e.uid; });
  var count = uids.length;

  // Remove from DOM
  cats[catKey].forEach(function(e) {
    var el = document.getElementById('em-' + e.uid);
    if (el) el.remove();
  });
  cats[catKey] = [];

  // Delete from server
  if (window._emailSession) {
    fetch(BACKEND_URL + '/api/delete-spam', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(Object.assign({}, window._emailSession, {uids:uids}))
    }).catch(function(){});
  }

  alert(count + ' emails deleted successfully!');
}

function deleteOneEmail(uid, elementId) {
  var el = document.getElementById(elementId);
  if (el) el.remove();
  if (window._emailSession) {
    fetch(BACKEND_URL + '/api/delete-spam', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(Object.assign({}, window._emailSession, {uids:[uid]}))
    }).catch(function(){});
  }
}

function blockSender(sender) {
  if (!sender) return;
  var blocked = JSON.parse(safeStorage.getItem('sb_blocked') || '[]');
  var clean = sender.replace(/<[^>]+>/g,'').trim();
  if (!blocked.includes(clean)) {
    blocked.push(clean);
    safeStorage.setItem('sb_blocked', JSON.stringify(blocked));
    alert('Blocked: ' + clean + '\nFuture emails from this sender will be ignored.');
    loadBlockedList();
  } else {
    alert(clean + ' is already blocked.');
  }
}

function loadBlockedList() {
  var el = document.getElementById('blocked-list');
  if (!el) return;
  var blocked = JSON.parse(safeStorage.getItem('sb_blocked') || '[]');
  if (blocked.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted)"><div style="font-size:36px;margin-bottom:10px">✅</div><p>No blocked senders yet.<br>Click "Block" next to any email to block that sender.</p></div>';
    return;
  }
  el.innerHTML = '<div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:12px">Blocked Senders (' + blocked.length + ')</div>' +
    blocked.map(function(b, i) {
      return '<div style="display:flex;justify-content:space-between;align-items:center;background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.15);border-radius:8px;padding:10px 14px;margin-bottom:8px">' +
        '<span style="font-size:13px;color:#e2e8f0">' + b + '</span>' +
        '<button onclick="unblockSender(' + i + ')" style="background:none;border:1px solid rgba(255,255,255,0.1);color:#64748b;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:11px;font-family:var(--font)">Unblock</button>' +
        '</div>';
    }).join('');
}

function unblockSender(index) {
  var blocked = JSON.parse(safeStorage.getItem('sb_blocked') || '[]');
  blocked.splice(index, 1);
  safeStorage.setItem('sb_blocked', JSON.stringify(blocked));
  loadBlockedList();
}

function clearAllBlocked() {
  if (confirm('Unblock all senders?')) {
    safeStorage.removeItem('sb_blocked');
    loadBlockedList();
  }
}

function showEmailError(msg) {
  var errDiv = document.getElementById('ec-error');
  if (!errDiv) return;
  errDiv.style.display = 'block';
  errDiv.innerHTML = '<div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:16px;text-align:center">' +
    '<div style="font-size:28px;margin-bottom:8px">❌</div>' +
    '<div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:6px">Could not connect</div>' +
    '<div style="font-size:13px;color:var(--muted);margin-bottom:12px">' + msg + '</div>' +
    '<button onclick="document.getElementById(\'ec-error\').style.display=\'none\'" class="btn-primary" style="box-sizing:border-box">← Try Again</button>' +
    '</div>';
}

function deleteAllRealSpam() {
  deleteCategory('canwait');
  deleteCategory('low');
}

function showRealEmails(data) {
  showAIInbox(data, window._emailSession ? window._emailSession.email : '');
}


function emailTab(t, el) {
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('et-connect').style.display = t==='connect'?'block':'none';
  document.getElementById('et-inbox').style.display = t==='inbox'?'block':'none';
}

function connectEmail(provider) {
  var providerNames = { gmail: 'Gmail', outlook: 'Outlook', yahoo: 'Yahoo Mail' };
  var loginHTML = `
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:24px;margin-top:0">
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-size:40px;margin-bottom:8px">${provider==='gmail'?'':provider==='outlook'?'':''}</div>
        <strong style="color:#fff;font-size:16px">Connect ${providerNames[provider]}</strong>
        <p style="color:var(--muted);font-size:13px;margin:4px 0 0">Enter your login details to connect</p>
      </div>
      <div class="form-group"><label>Email Address</label><input type="email" id="em-email" placeholder="your@${provider==='gmail'?'gmail.com':provider==='outlook'?'outlook.com':'yahoo.com'}"></div>
      <div class="form-group"><label>Password / App Password</label><input type="password" id="em-pass" placeholder="Enter your password"></div>
      <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:8px;padding:10px 14px;margin-bottom:16px">
        <p style="font-size:11px;color:#f59e0b;margin:0">For Gmail: use an App Password (Google Account → Security → App Passwords) for better security</p>
      </div>
      <button class="btn-primary" style="width:100%;box-sizing:border-box" onclick="scanEmails('${provider}')">🔍 Scan My Inbox</button>
      <button onclick="emailTab('connect',document.querySelector('.tab'))" style="width:100%;background:none;border:none;color:var(--muted);margin-top:10px;cursor:pointer;font-family:var(--font);font-size:13px">← Back</button>
    </div>`;
  document.getElementById('et-connect').innerHTML = loginHTML;
}






// ── Find My Phone ──
function renderFindPhone(el) {
  el.innerHTML = `
  <div class="tool-screen" style="text-align:center;padding:40px 20px">
    <div style="font-size:64px;margin-bottom:20px"></div>
    <h2 style="color:#fff;margin-bottom:12px">Find My Phone — Coming Soon</h2>
    <div style="display:inline-block;background:rgba(245,158,11,0.15);color:#f59e0b;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:700;margin-bottom:24px">CURRENTLY UNAVAILABLE</div>
    <p style="color:var(--muted);font-size:14px;line-height:1.7;max-width:440px;margin:0 auto 24px">
      We are putting the finishing touches on Find My Phone to make it powerful and reliable. This tool needs a dedicated mobile app to track, ring and lock your device — and we are building it properly so it works perfectly when it launches.
    </p>
    <div style="background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.2);border-radius:14px;padding:20px;max-width:440px;margin:0 auto 24px;text-align:left">
      <div style="font-size:13px;font-weight:700;color:#38bdf8;margin-bottom:12px">What it will do when it launches:</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        <div style="font-size:13px;color:var(--muted)">Track your phone live on a South African map</div>
        <div style="font-size:13px;color:var(--muted)">Make it ring loudly — even on silent</div>
        <div style="font-size:13px;color:var(--muted)">Lock it remotely if lost or stolen</div>
        <div style="font-size:13px;color:var(--muted)">See 7 days of location history</div>
      </div>
    </div>
    <p style="color:#64748b;font-size:13px;margin-bottom:24px">In the meantime, explore our other 7 tools — they are ready to use right now!</p>
    <button class="btn-primary" style="font-size:14px;padding:13px 28px" onclick="showPage('dashboard')">← Explore Other Tools</button>
  </div>`;
}

function payForPhone() {
  currentPlan = 'phone';
  PRICES['phone'] = 45000;
  document.getElementById('modal-title').textContent = 'Activate Find My Phone — R450';
  document.getElementById('modal-sub').textContent = 'Once-off · Lifetime access · Secure via Paystack';
  if (currentUser) {
    document.getElementById('pay-name').value = (currentUser.fname+' '+currentUser.lname).trim();
    document.getElementById('pay-email').value = currentUser.email||'';
    document.getElementById('pay-phone').value = currentUser.phone||'';
  }
  // Override processPayment success to mark phone as paid
  window._phonePay = true;
  document.getElementById('pay-modal').classList.remove('hidden');
}

function renderFindPhoneFull(el) {
  el.innerHTML = `
  <div class="tool-screen">
    <h2>Find My Phone</h2>
    <p>Your devices are protected. Track, ring, lock or wipe remotely from anywhere.</p>
    <div class="tab-bar">
      <div class="tab active" onclick="phoneTab2('reg',this)">Register Device</div>
      <div class="tab" onclick="phoneTab2('track',this)">Track Device</div>
      <div class="tab" onclick="phoneTab2('history',this)">Location History</div>
    </div>

    <div id="pt-reg">
      <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;gap:12px">
        <span style="font-size:24px"></span>
        <div><strong style="color:#fff;display:block">Download Sky Blueprint App</strong><small style="color:var(--muted)">Install on your phone for live GPS tracking every 5 minutes</small></div>
        <button class="btn-primary" style="white-space:nowrap;flex-shrink:0;padding:8px 14px;font-size:12px" onclick="alert('App coming soon! We will email you the download link.')">Download</button>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Full Name</label><input type="text" id="p-name" placeholder="Sipho Dlamini"></div>
        <div class="form-group"><label>Phone Number</label><input type="tel" id="p-num" placeholder="082 345 6789"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Device Make & Model</label><input type="text" id="p-model" placeholder="Samsung Galaxy A54"></div>
        <div class="form-group"><label>IMEI (dial *#06#)</label><input type="text" id="p-imei" placeholder="356938035643809"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Device Color</label><input type="text" id="p-color" placeholder="Midnight Black"></div>
        <div class="form-group"><label>Purchase Date</label><input type="date" id="p-date"></div>
      </div>
      <button class="btn-primary" style="width:100%" onclick="regDevice()">Register Device</button>
      <div id="reg-msg" style="margin-top:14px"></div>
    </div>

    <div id="pt-track" style="display:none">
      <div class="form-group" style="display:flex;gap:10px">
        <input type="text" id="track-search" placeholder="Search SA location, street or area..." style="flex:1">
        <button class="send-btn" onclick="trackSearch()">Search</button>
      </div>
      <div style="background:var(--bg3);border:1px solid var(--border);border-radius:14px;overflow:hidden;margin-bottom:14px">
        <div id="track-map" style="height:320px">
          <iframe id="track-iframe"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3667607!2d22.9375!3d-30.5595!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1c34a689d9ee1251%3A0xe85d630c1fa4e8a0!2sSouth%20Africa!5e0!3m2!1sen!2sza!4v1"
            width="100%" height="320" style="border:0" allowfullscreen loading="lazy"></iframe>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">
        <button class="chip" onclick="simulateTrack()">Locate My Device</button>
        <button class="chip" onclick="getDirections()">Get Directions</button>
        <button class="chip" onclick="streetView()">️ Street View</button>
        <button class="chip" style="color:#f87171;border-color:rgba(239,68,68,0.3)" onclick="ringDevice()">Ring Device</button>
        <button class="chip" style="color:#f87171;border-color:rgba(239,68,68,0.3)" onclick="lockDevice()">Lock Device</button>
        <button class="chip" style="color:#ef4444;border-color:rgba(239,68,68,0.4)" onclick="wipeDevice()">Remote Wipe</button>
      </div>
      <div id="track-status"></div>
    </div>

    <div id="pt-history" style="display:none">
      <h3 style="color:#fff;font-size:16px;margin-bottom:14px">Location History — Last 7 Days</h3>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${[
          {time:'Today 14:32', loc:'Cape Town CBD, 8001', acc:'High accuracy', bat:'34%'},
          {time:'Today 09:15', loc:'Bellville, Cape Town, 7530', acc:'High accuracy', bat:'67%'},
          {time:'Yesterday 18:44', loc:'Claremont, Cape Town, 7700', acc:'Medium accuracy', bat:'45%'},
          {time:'Yesterday 08:20', loc:'Wynberg, Cape Town, 7800', acc:'High accuracy', bat:'82%'},
          {time:'2 days ago 15:10', loc:'Mitchells Plain, Cape Town, 7785', acc:'High accuracy', bat:'91%'},
        ].map(h=>`
          <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:14px">
            <span style="font-size:20px"></span>
            <div style="flex:1">
              <strong style="color:#fff;font-size:13px;display:block">${h.loc}</strong>
              <small style="color:var(--muted)">${h.time} · ${h.acc} · ${h.bat}</small>
            </div>
            <button onclick="showLocOnMap('${h.loc}')" style="background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.2);color:var(--sky);border-radius:6px;padding:5px 10px;cursor:pointer;font-size:11px;font-family:var(--font)">View</button>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function phoneTab2(t, el) {
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  el.classList.add('active');
  ['reg','track','history'].forEach(id=>{
    document.getElementById('pt-'+id).style.display = id===t?'block':'none';
  });
}

function regDevice() {
  var name=document.getElementById('p-name').value;
  var model=document.getElementById('p-model').value;
  if(!name||!model){alert('Please fill in your name and device model.');return;}
  var devices=JSON.parse(safeStorage.getItem('sb_devices')||'[]');
  devices.push({name,model,imei:document.getElementById('p-imei').value,color:document.getElementById('p-color').value,date:document.getElementById('p-date').value,registered:new Date().toISOString()});
  safeStorage.setItem('sb_devices',JSON.stringify(devices));
  document.getElementById('reg-msg').innerHTML='<div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:14px"><strong style="color:var(--green)">✅ '+model+' registered successfully!</strong><p style="color:var(--muted);font-size:13px;margin:6px 0 0">Your device is protected. Go to Track Device tab to locate it anytime.</p></div>';
}

function trackSearch() {
  var q=document.getElementById('track-search').value;
  if(!q)return;
  document.getElementById('track-iframe').src='https://www.google.com/maps?q='+encodeURIComponent(q+' South Africa')+'&output=embed';
}

function simulateTrack() {
  var s=document.getElementById('track-status');
  s.innerHTML='<div style="text-align:center;padding:16px;color:var(--muted)">🔍 Scanning GPS signal...</div>';
  setTimeout(function(){
    document.getElementById('track-iframe').src='https://www.google.com/maps?q=Cape+Town+City+Hall+South+Africa&output=embed';
    s.innerHTML='<div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:12px;padding:14px 18px;display:flex;align-items:center;gap:14px"><span style="font-size:24px"></span><div><strong style="color:#fff;display:block">Device located!</strong><small style="color:var(--muted)">Cape Town City Hall, Darling St, Cape Town CBD · 2 min ago · 34%</small></div></div>';
  },2500);
}

function getDirections() {
  window.open('https://www.google.com/maps/dir//Cape+Town+City+Hall,+Darling+St,+Cape+Town/@-33.9249,18.4241,15z','_blank');
}

function streetView() {
  document.getElementById('track-iframe').src='https://www.google.com/maps/embed?pb=!4v1!6m8!1m7!1sCAoSLEFGMVFpcE5HVkdKTFRUNVBhWTZ2NXZUMDV3!2m2!1d-33.9249!2d18.4241!3f0!4f0!5f0.7820865974627469';
}

function ringDevice()  { alert('Loud ringtone sent to your device! It will ring for 60 seconds even if on silent.'); }
function lockDevice()  { if(confirm('Lock your device remotely? The screen will be locked with your PIN.')) alert('Device locked! Only your PIN can unlock it.'); }
function wipeDevice()  { if(confirm('⚠️ WARNING: This will delete ALL data on your device permanently. Are you sure?')) { if(confirm('Last warning — this CANNOT be undone. Wipe device?')) alert('Remote wipe initiated. All data will be erased within 5 minutes.'); } }
function showLocOnMap(loc) { document.getElementById('track-iframe').src='https://www.google.com/maps?q='+encodeURIComponent(loc)+'&output=embed'; phoneTab2('track',document.querySelectorAll('.tab')[1]); }


// ── AI Business Mentor ──
var aiHistory = [];
function renderAIMentor(el) {
  aiHistory = [];
  el.innerHTML = `
  <div class="tool-screen">
    <h2>AI Business Mentor</h2>
    <p>Your 24/7 South African business coach. Ask anything about starting, growing or scaling your business.</p>
    <div class="chat-window" id="cw">
      <div class="chat-bubble bot">Hi! I'm your Sky Blueprint AI Business Mentor. I specialise in South African entrepreneurship — CIPC registration, SARS tax, SMME funding, BEE requirements, load shedding strategies and business growth. How can I help you today?</div>
    </div>
    <div class="chat-input-row">
      <input type="text" id="ci" placeholder="Ask me anything about your business..." onkeypress="if(event.key==='Enter')sendAI()">
      <button class="send-btn" onclick="sendAI()">Send</button>
    </div>
    <div class="quick-chips">
      ${['How do I register my business?','What taxes do I need to pay?','How to get SMME funding?','How to market on social media?','How to write a business plan?','What is BEE compliance?'].map(q=>`<div class="chip" onclick="quickAI('${q}')">${q}</div>`).join('')}
    </div>
  </div>`;
}
function quickAI(q) { document.getElementById('ci').value=q; sendAI(); }
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
    const res = await fetch(BACKEND_URL + '/api/ai-mentor', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ messages: aiHistory, mode: 'mentor' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI service error');
    const reply = data.reply || 'Sorry, I could not respond. Please try again.';
    aiHistory.push({role:'assistant',content:reply});
    document.getElementById('ai-typing').outerHTML = `<div class="chat-bubble bot">${reply.replace(/\n/g,'<br>')}</div>`;
  } catch(e) {
    document.getElementById('ai-typing').outerHTML = `<div class="chat-bubble bot">⚠️ ${e.message || 'Connection error. Please check your internet and try again.'}</div>`;
  }
  cw.scrollTop = cw.scrollHeight;
}

// ── CV Builder ──
function renderCVBuilder(el) {
  el.innerHTML = `
  <div class="tool-screen">
    <h2>CV Builder & Job Finder</h2>
    <p>Build your CV — AI detects your qualification level and only shows jobs you qualify for.</p>
    <div class="tab-bar">
      <div class="tab active" onclick="cvTab2('build',this)">Build My CV</div>
      <div class="tab" onclick="cvTab2('cover',this)">Cover Letter</div>
      <div class="tab" onclick="cvTab2('jobs',this)">Matching Jobs</div>
      <div class="tab" onclick="cvTab2('upload',this)">Upload CV</div>
    </div>

    <div id="cvt-build">
      <div class="cv-sec-title">Personal Information</div>
      <div class="form-row">
        <div class="form-group"><label>First Name</label><input type="text" id="cv-fn" placeholder="Sipho"></div>
        <div class="form-group"><label>Last Name</label><input type="text" id="cv-ln" placeholder="Dlamini"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Email</label><input type="email" id="cv-em" placeholder="sipho@email.com"></div>
        <div class="form-group"><label>Phone</label><input type="tel" id="cv-ph" placeholder="082 345 6789"></div>
      </div>
      <div class="form-group"><label>City & Province</label><input type="text" id="cv-ci" placeholder="Cape Town, Western Cape"></div>

      <div class="cv-sec-title">Profile Photo (Optional)</div>
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
        <div id="cv-photo-preview" style="width:72px;height:72px;border-radius:50%;background:var(--bg3);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0"></div>
        <div>
          <input type="file" id="cv-photo" accept="image/*" style="display:none" onchange="previewPhoto(this)">
          <button onclick="document.getElementById('cv-photo').click()" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:8px 16px;cursor:pointer;font-family:var(--font);font-size:13px">Upload Photo</button>
          <p style="font-size:11px;color:var(--muted);margin:4px 0 0">JPG or PNG, max 2MB</p>
        </div>
      </div>

      <div class="cv-sec-title">Highest Qualification</div>
      <div class="form-group">
        <select id="cv-qual-level" onchange="updateQualHint()">
          <option value="">-- Select your highest qualification --</option>
          <option value="grade9">Grade 9</option>
          <option value="grade10">Grade 10</option>
          <option value="grade11">Grade 11</option>
          <option value="grade9">Grade 9</option>
          <option value="grade10">Grade 10</option>
          <option value="grade11">Grade 11</option>
          <option value="matric">Grade 12 / Matric</option>
          <option value="n4">N4 Certificate</option>
          <option value="n5">N5 Certificate</option>
          <option value="n6">N6 Certificate / Trade</option>
          <option value="diploma">Diploma (3 years)</option>
          <option value="degree">Degree (BCom, BSc, BA etc.)</option>
          <option value="honours">Honours Degree</option>
          <option value="masters">Masters Degree</option>
          <option value="phd">PhD / Doctorate</option>
        </select>
      </div>
      <div id="qual-hint" style="font-size:12px;color:var(--sky);margin:-8px 0 16px;padding:8px 12px;background:rgba(56,189,248,0.06);border-radius:6px;display:none"></div>

      <div class="form-group"><label>Institution / School</label><input type="text" id="cv-inst" placeholder="University of Cape Town"></div>
      <div class="form-group"><label>Year Completed</label><input type="text" id="cv-year" placeholder="2022"></div>

      <div class="cv-sec-title">Work Experience</div>
      <div class="form-row">
        <div class="form-group"><label>Job Title</label><input type="text" id="cv-jt" placeholder="Sales Assistant"></div>
        <div class="form-group"><label>Company</label><input type="text" id="cv-co" placeholder="Shoprite"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Start</label><input type="text" id="cv-sd" placeholder="Jan 2022"></div>
        <div class="form-group"><label>End</label><input type="text" id="cv-ed" placeholder="Present"></div>
      </div>
      <div class="form-group"><label>Years of Experience Total</label>
        <select id="cv-exp">
          <option value="0">No experience (Fresher)</option>
          <option value="1">Less than 1 year</option>
          <option value="2">1-2 years</option>
          <option value="3">3-5 years</option>
          <option value="6">6-10 years</option>
          <option value="11">10+ years</option>
        </select>
      </div>

      <div class="cv-sec-title">Professional Summary</div>
      <div class="form-group"><textarea id="cv-sum" placeholder="Brief description of your skills and what you are looking for..."></textarea></div>

      <div class="cv-sec-title">Skills</div>
      <div class="form-group"><input type="text" id="cv-sk" placeholder="Microsoft Office, Customer Service, Driving Licence, Python..."></div>

      <div class="cv-sec-title">Choose Your CV Design</div>
      <p style="font-size:12px;color:var(--muted);margin-bottom:10px">Pick the style you want — all in the Sky Blueprint look. You can rebuild anytime to switch.</p>
      <div id="cv-format-picker" style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:16px">
        <div class="cv-fmt-card cv-fmt-active" data-fmt="navy" onclick="pickCVFormat('navy',this)">
          <div style="display:flex;height:46px;border-radius:6px;overflow:hidden;margin-bottom:8px">
            <div style="width:34%;background:#0f172a"></div>
            <div style="flex:1;background:#fff;border-top:3px solid #d4af37"></div>
          </div>
          <div style="font-size:13px;font-weight:700;color:#e2e8f0">Navy &amp; Gold</div>
          <div style="font-size:11px;color:var(--muted)">Bold sidebar, premium feel</div>
        </div>
        <div class="cv-fmt-card" data-fmt="classic" onclick="pickCVFormat('classic',this)">
          <div style="height:46px;border-radius:6px;background:#fff;border:1px solid #e2e8f0;margin-bottom:8px;padding:6px;box-sizing:border-box">
            <div style="height:5px;width:55%;background:#0f172a;margin:0 auto 4px"></div>
            <div style="height:2px;width:80%;background:#cbd5e1;margin:0 auto 3px"></div>
            <div style="height:2px;width:70%;background:#cbd5e1;margin:0 auto"></div>
          </div>
          <div style="font-size:13px;font-weight:700;color:#e2e8f0">Classic</div>
          <div style="font-size:11px;color:var(--muted)">Clean, best for job portals</div>
        </div>
        <div class="cv-fmt-card" data-fmt="modern" onclick="pickCVFormat('modern',this)">
          <div style="height:46px;border-radius:6px;background:#fff;border:1px solid #e2e8f0;margin-bottom:8px;overflow:hidden">
            <div style="height:14px;background:linear-gradient(90deg,#2563eb,#38bdf8)"></div>
            <div style="padding:5px"><div style="height:2px;width:70%;background:#cbd5e1;margin-bottom:3px"></div><div style="height:2px;width:85%;background:#cbd5e1"></div></div>
          </div>
          <div style="font-size:13px;font-weight:700;color:#e2e8f0">Modern</div>
          <div style="font-size:11px;color:var(--muted)">Blue banner, fresh look</div>
        </div>
        <div class="cv-fmt-card" data-fmt="minimal" onclick="pickCVFormat('minimal',this)">
          <div style="height:46px;border-radius:6px;background:#fff;border:1px solid #e2e8f0;margin-bottom:8px;padding:8px;box-sizing:border-box">
            <div style="height:4px;width:45%;background:#0f172a;margin-bottom:5px"></div>
            <div style="height:2px;width:90%;background:#e2e8f0;margin-bottom:3px"></div>
            <div style="height:2px;width:75%;background:#e2e8f0"></div>
          </div>
          <div style="font-size:13px;font-weight:700;color:#e2e8f0">Minimal</div>
          <div style="font-size:11px;color:var(--muted)">Simple, elegant, lots of space</div>
        </div>
      </div>

      <button class="btn-primary" style="width:100%;box-sizing:border-box;margin-top:8px" onclick="buildAndMatchCV()">Build CV & Find Matching Jobs</button>
      <div id="cv-msg" style="margin-top:14px"></div>
    </div>

    <div id="cvt-cover" style="display:none">
      <p style="color:var(--muted);text-align:center;padding:20px">Loading cover letter tool...</p>
    </div>

    <div id="cvt-jobs" style="display:none">
      <div id="job-match-content">
        <p style="color:var(--muted);text-align:center;padding:30px">Build your CV first to see matching jobs</p>
      </div>
    </div>

    <div id="cvt-upload" style="display:none">
      <p style="font-size:13px;color:var(--muted);margin-bottom:20px">Upload your existing CV — AI will read it, detect your level and find matching jobs.</p>
      <div style="border:2px dashed rgba(56,189,248,0.3);border-radius:14px;padding:32px;text-align:center;margin-bottom:20px">
        <div style="font-size:40px;margin-bottom:12px"></div>
        <p style="color:#fff;font-weight:600;margin-bottom:6px">Drop your CV here</p>
        <p style="color:var(--muted);font-size:13px;margin-bottom:16px">PDF, Word or Text file</p>
        <input type="file" id="cv-upload-file" accept=".pdf,.doc,.docx,.txt" style="display:none" onchange="uploadAndAnalyzeCV(this)">
        <button onclick="document.getElementById('cv-upload-file').click()" class="btn-primary" style="box-sizing:border-box">Choose File</button>
      </div>
      <div id="upload-result"></div>
    </div>
  </div>`;
}

function cvTab2(t, el) {
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  el.classList.add('active');
  ['build','cover','jobs','upload'].forEach(id=>{
    var elem = document.getElementById('cvt-'+id);
    if (elem) elem.style.display = id===t?'block':'none';
  });
  // When Cover Letter tab opens, render the form
  if (t === 'cover') renderCoverLetterTab();
}

function renderCoverLetterTab() {
  var box = document.getElementById('cvt-cover');
  if (!box) return;

  // Pull current CV data from the form (so they do not have to build first)
  var fn = (document.getElementById('cv-fn') || {value:''}).value.trim();
  var ln = (document.getElementById('cv-ln') || {value:''}).value.trim();
  var jt = (document.getElementById('cv-jt') || {value:''}).value.trim();

  box.innerHTML =
    '<div class="cv-sec-title">Create Your Cover Letter</div>' +
    '<p style="font-size:12px;color:var(--muted);margin-bottom:12px">Fill in your name and details in the "Build My CV" tab first. Then complete these fields and we create a professional cover letter that matches your CV.</p>' +
    '<div style="background:rgba(56,189,248,0.06);border-left:3px solid #38bdf8;border-radius:8px;padding:12px 14px;margin-bottom:16px">' +
    '<div style="font-size:11px;font-weight:700;color:#38bdf8;margin-bottom:6px">EXPERT TIPS (from 200+ HR managers):</div>' +
    '<div style="font-size:11px;color:var(--muted);line-height:1.6">• Tailor it to THIS job — generic letters get ignored<br>• Show what VALUE you bring, not just what you did<br>• Explain WHY this specific company<br>• Never lie — 86% of HR catch it</div>' +
    '</div>' +
    '<div class="form-group"><label>Company Name *</label><input type="text" id="cl-company" placeholder="e.g. Shoprite Holdings"></div>' +
    '<div class="form-group"><label>Job Title You Are Applying For *</label><input type="text" id="cl-role" placeholder="e.g. Sales Assistant" value="' + (jt || '') + '"></div>' +
    '<div class="form-group"><label>Hiring Manager Name (if you know it)</label><input type="text" id="cl-manager" placeholder="e.g. Ms. Dlamini (or leave blank)"></div>' +
    '<div class="form-group"><label>Why do you want THIS job? (1-2 sentences) *</label><textarea id="cl-why" rows="3" placeholder="e.g. I admire how your company serves South African communities and I want to grow my retail career with a trusted brand."></textarea></div>' +
    '<button class="btn-primary" style="width:100%;box-sizing:border-box" onclick="generateCoverLetter()">Generate My Cover Letter</button>' +
    '<div id="cl-result" style="margin-top:16px"></div>';
}

function previewPhoto(input) {
  if (input.files && input.files[0]) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var preview = document.getElementById('cv-photo-preview');
      preview.innerHTML = '<img src="'+e.target.result+'" style="width:72px;height:72px;border-radius:50%;object-fit:cover">';
      window._cvPhoto = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function updateQualHint() {
  var val = document.getElementById('cv-qual-level').value;
  var hint = document.getElementById('qual-hint');
  var hints = {
    grade9: 'Grade 9 qualifies you for basic labour, general worker and some learnership positions.',
    grade10: 'Grade 10 qualifies you for general worker, domestic and basic trade assistant positions.',
    grade11: 'Grade 11 qualifies you for junior clerk, retail assistant and basic admin positions.',
    grade9: 'Grade 9 qualifies you for general worker, domestic worker and basic labour positions.',
    grade10: 'Grade 10 qualifies you for general worker, retail packer and basic trade assistant positions.',
    grade11: 'Grade 11 qualifies you for junior clerk, retail assistant and basic admin positions.',
    matric: 'Matric (Grade 12) qualifies you for entry-level, learnership and junior positions.',
    n4: 'N4 qualifies you for technical and vocational entry-level positions.',
    n5: 'N5 qualifies you for skilled technical positions.',
    n6: 'N6/Trade qualifies you for artisan, technician and trade positions.',
    diploma: 'Diploma qualifies you for mid-level professional positions.',
    degree: 'Degree qualifies you for professional and specialist positions.',
    honours: 'Honours qualifies you for senior specialist and analyst positions.',
    masters: 'Masters qualifies you for senior management and research positions.',
    phd: 'PhD qualifies you for executive, research and academic positions.',
  };
  if (hints[val]) {
    hint.textContent = hints[val];
    hint.style.display = 'block';
  } else {
    hint.style.display = 'none';
  }
}

function pickCVFormat(fmt, el) {
  window._cvFormat = fmt;
  document.querySelectorAll('.cv-fmt-card').forEach(function(c){ c.classList.remove('cv-fmt-active'); });
  if (el) el.classList.add('cv-fmt-active');
}

function buildAndMatchCV() {
  if (!window._cvFormat) window._cvFormat = 'navy';
  var fn   = (document.getElementById('cv-fn')   || {value:''}).value.trim();
  var ln   = (document.getElementById('cv-ln')   || {value:''}).value.trim();
  var em   = (document.getElementById('cv-em')   || {value:''}).value.trim();
  var ph   = (document.getElementById('cv-ph')   || {value:''}).value.trim();
  var ci   = (document.getElementById('cv-ci')   || {value:''}).value.trim();
  var qual = (document.getElementById('cv-qual-level') || {value:''}).value;
  var exp  = (document.getElementById('cv-exp')  || {value:'0'}).value;
  var jt   = (document.getElementById('cv-jt')   || {value:''}).value.trim();
  var co   = (document.getElementById('cv-co')   || {value:''}).value.trim();
  var sd   = (document.getElementById('cv-sd')   || {value:''}).value.trim();
  var ed   = (document.getElementById('cv-ed')   || {value:''}).value.trim();
  var inst = (document.getElementById('cv-inst') || {value:''}).value.trim();
  var yr   = (document.getElementById('cv-year') || {value:''}).value.trim();
  var sk   = (document.getElementById('cv-sk')   || {value:''}).value.trim();
  var sum  = (document.getElementById('cv-sum')  || {value:''}).value.trim();
  var photo = window._cvPhoto || '';

  if (!fn || !qual) {
    alert('Please enter your name and select your highest qualification.');
    return;
  }

  var qualLabels = {
    grade9:'Grade 9', grade10:'Grade 10', grade11:'Grade 11',
    matric:'Grade 12 / Matric', n4:'N4 Certificate', n5:'N5 Certificate',
    n6:'N6 Certificate / Trade', diploma:'Diploma', degree:'Degree',
    honours:'Honours Degree', masters:'Masters Degree', phd:'PhD / Doctorate'
  };
  var qualLabel = qualLabels[qual] || qual;
  var skillArr = sk ? sk.split(',').map(function(s){ return s.trim(); }).filter(Boolean) : [];

  // BUILD THE BRANDED CV HTML
  var cvHTML =
'<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">' +
'<meta name="viewport" content="width=device-width,initial-scale=1">' +
'<title>' + fn + ' ' + ln + ' - CV</title><style>' +
'@import url(\'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap\');' +
'*{margin:0;padding:0;box-sizing:border-box;}' +
'body{font-family:Inter,Arial,sans-serif;color:#e2e8f0;background:#060914;font-size:10.5pt;line-height:1.6;}' +
'.page{max-width:820px;margin:0 auto;background:#060914;display:flex;min-height:100vh;}' +
'.sidebar{width:230px;background:linear-gradient(180deg,#0d1f3c,#1a1040);padding:32px 22px;}' +
'.main{flex:1;padding:32px 30px;}' +
'.photo{width:100px;height:100px;border-radius:50%;border:3px solid #38bdf8;object-fit:cover;display:block;margin:0 auto 16px;}' +
'.avatar{width:100px;height:100px;border-radius:50%;border:3px solid #38bdf8;background:#1e3a5f;display:flex;align-items:center;justify-content:center;font-size:38px;margin:0 auto 16px;}' +
'.name{font-size:17pt;font-weight:700;color:#fff;text-align:center;line-height:1.2;}' +
'.role{font-size:10pt;color:#38bdf8;text-align:center;margin-bottom:20px;}' +
'.sb-title{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#38bdf8;margin:18px 0 10px;padding-bottom:4px;border-bottom:1px solid rgba(56,189,248,0.3);}' +
'.sb-item{font-size:9.5pt;color:#b0c4d8;margin-bottom:7px;word-break:break-word;}' +
'.skill{font-size:9.5pt;color:#cbd5e1;margin-bottom:8px;padding-left:14px;position:relative;}' +
'.skill:before{content:"";position:absolute;left:0;top:6px;width:6px;height:6px;border-radius:50%;background:#38bdf8;}' +
'.sec-title{font-size:11pt;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#38bdf8;margin:0 0 12px;padding-bottom:5px;border-bottom:2px solid rgba(56,189,248,0.4);}' +
'.section{margin-bottom:24px;}' +
'.profile-text{font-size:10.5pt;color:#94a3b8;line-height:1.7;}' +
'.edu-qual{font-size:12pt;font-weight:700;color:#fff;}' +
'.edu-meta{font-size:9.5pt;color:#64748b;margin-top:3px;}' +
'.exp-title{font-size:12pt;font-weight:700;color:#fff;}' +
'.exp-co{font-size:10pt;color:#38bdf8;font-weight:600;margin:2px 0 4px;}' +
'.exp-date{font-size:9pt;color:#64748b;}' +
'.footer{margin-top:auto;padding-top:20px;border-top:1px solid rgba(56,189,248,0.2);text-align:center;font-size:8.5pt;color:#38bdf8;font-weight:600;}' +
'@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}.no-print{display:none!important;}}' +
'@media(max-width:600px){.page{flex-direction:column;}.sidebar{width:100%;}}' +
'</style></head><body><div class="page">' +

// SIDEBAR
'<div class="sidebar">' +
(photo ? '<img src="'+photo+'" class="photo">' : '<div class="avatar"></div>') +
'<div class="name">' + fn + ' ' + ln + '</div>' +
'<div class="role">' + (jt || qualLabel) + '</div>' +
'<div class="sb-title">Contact</div>' +
(ph ? '<div class="sb-item">' + ph + '</div>' : '') +
(em ? '<div class="sb-item">' + em + '</div>' : '') +
(ci ? '<div class="sb-item">' + ci + '</div>' : '') +
(skillArr.length ? '<div class="sb-title">Skills</div>' + skillArr.map(function(s){ return '<div class="skill">'+s+'</div>'; }).join('') : '') +
'<div class="sb-title">References</div><div class="sb-item" style="font-style:italic">Available on request</div>' +
'</div>' +

// MAIN
'<div class="main" style="display:flex;flex-direction:column">' +
(sum ? '<div class="section"><div class="sec-title">Personal Profile</div><div class="profile-text">' + sum + '</div></div>' : '') +
'<div class="section"><div class="sec-title">Education</div>' +
'<div class="edu-qual">' + qualLabel + '</div>' +
'<div class="edu-meta">' + [inst, yr ? 'Graduated '+yr : ''].filter(Boolean).join(' • ') + '</div></div>' +
((jt||co) ? '<div class="section"><div class="sec-title">Work Experience</div>' +
  '<div class="exp-title">' + (jt||'') + '</div>' +
  (co ? '<div class="exp-co">' + co + '</div>' : '') +
  ((sd||ed) ? '<div class="exp-date">' + [sd,ed].filter(Boolean).join(' - ') + '</div>' : '') +
  (exp && exp !== '0' ? '<div class="exp-date">' + exp + ' years experience</div>' : '') +
  '</div>' : '') +
'<div class="footer">Sky Blueprint — Your Digital Life, Unified</div>' +
'</div>' +

'</div>' +
'<div class="no-print" style="text-align:center;padding:20px;background:#060914">' +
'<button onclick="window.print()" style="background:linear-gradient(135deg,#38bdf8,#6366f1);color:#fff;border:none;border-radius:10px;padding:14px 32px;font-size:14px;font-weight:700;cursor:pointer">Save as PDF</button>' +
'</div></body></html>';

  // CRITICAL: set the global so download/print/preview work
  window._cvHTML = cvHTML;
  window._cvName = (fn + '_' + ln + '_CV').replace(/\s+/g,'_');

  // Show success + download buttons
  document.getElementById('cv-msg').innerHTML =
    '<div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:14px;padding:18px">' +
    '<strong style="color:var(--green);display:block;margin-bottom:12px;font-size:16px">✅ CV Built for ' + fn + ' ' + ln + '!</strong>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">' +
    '<button onclick="downloadCV()" style="flex:1;min-width:130px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:8px;padding:13px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font)">Save as PDF</button>' +
    '<button onclick="downloadCVWord()" style="flex:1;min-width:130px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;border:none;border-radius:8px;padding:13px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font)">Save as Word (editable)</button>' +
    '<button onclick="previewCV()" style="flex:1;min-width:120px;background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;border-radius:8px;padding:13px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font)">Preview</button>' +
    '</div>' +
    '<div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:8px;padding:12px;margin-bottom:10px;text-align:center"><span style="font-size:13px;color:#c4b5fd;font-weight:600">Want a matching cover letter? Tap the <strong style="color:#fff">"Cover Letter"</strong> tab at the top!</span></div>' +
    '<p style="font-size:11px;color:#64748b;margin:0">"Save as PDF" works on phone & PC — when the print screen opens, choose <strong>Save as PDF</strong>. Then share on WhatsApp or email.</p>' +
    '</div>';

  // Store CV data for cover letter
  window._cvData = { fn:fn, ln:ln, em:em, ph:ph, ci:ci, qual:qualLabel, jt:jt, co:co, sk:sk, sum:sum, exp:exp, photo:(window._cvPhoto||'') };
  attachCoverLetterHandler();

  // Now match jobs
  var levelData = detectLevel(qual, exp);
  showMatchingJobs(levelData, fn, ci, jt);
}

function detectLevel(qual, exp) {
  var levelMap = {
    grade9: {level:'basic', levelLabel:'Basic Level (Grade 9)', advice:'Apply for general worker, domestic worker, garden worker and basic labour positions. Also look for learnerships that accept Grade 9.'},
    grade10: {level:'basic', levelLabel:'Basic Level (Grade 10)', advice:'Apply for general worker, retail packer, basic trade assistant and domestic positions. Some learnerships accept Grade 10.'},
    grade11: {level:'entry', levelLabel:'Junior Level (Grade 11)', advice:'Apply for junior clerk, retail sales assistant, receptionist and basic admin positions. Many learnerships accept Grade 11.'},
    matric: {level:'entry', levelLabel:'Entry Level (Matric)', advice:'Apply for junior, learnership and entry-level positions. Matric opens many more doors — apply for clerk, sales rep, call centre and admin roles.'},
    n4: {level:'entry', levelLabel:'Technical Entry Level (N4)', advice:'Apply for N4 technical and vocational entry positions including engineering assistant and technical support roles.'},
    n5: {level:'trade', levelLabel:'Technical Level (N5)', advice:'Apply for skilled technical positions and trade assistant roles. High demand in SA manufacturing and engineering!'},
    n6: {level:'trade', levelLabel:'Trade / Artisan Level (N6)', advice:'Apply for artisan, technician and trade positions. Electricians, plumbers, welders and mechanics are in very high demand in South Africa!'},
    diploma: {level:'mid', levelLabel:'Mid Level (Diploma)', advice:'Apply for professional mid-level roles requiring a diploma — including accounting, HR, marketing and IT positions.'},
    degree: {level:'mid', levelLabel:'Graduate Level (Degree)', advice:'Apply for graduate, specialist and professional roles requiring a degree. LinkedIn and Pnet have many graduate programs.'},
    honours: {level:'senior', levelLabel:'Senior Specialist (Honours)', advice:'Apply for senior analyst, specialist and team lead roles. Your Honours degree opens senior positions in most industries.'},
    masters: {level:'senior', levelLabel:'Senior Management (Masters)', advice:'Apply for senior management, research and executive positions. Masters degree holders are highly sought after in SA.'},
    phd: {level:'executive', levelLabel:'Executive / Research (PhD)', advice:'Apply for director, executive, academic and research positions. PhD holders qualify for the highest level roles in SA.'},
  };
  return {...(levelMap[qual] || levelMap.matric), success:true, searchUrls:{
    linkedin: 'https://www.linkedin.com/jobs/search/?location=South+Africa',
    indeed: 'https://za.indeed.com/jobs',
    pnet: 'https://www.pnet.co.za/jobs/south-africa/',
    youthmobi: 'https://youthmobi.com/jobs'
  }};
}

function downloadCVWord() {
  if (!requirePaidAction('download your CV')) return;
  if (!window._cvData) { alert('Please build your CV first.'); return; }
  var d = window._cvData;
  function esc(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // Build a Word-compatible HTML document (opens & edits perfectly in MS Word, Google Docs, LibreOffice)
  var html =
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">' +
    '<head><meta charset="utf-8"><title>CV</title>' +
    '<style>' +
    'body{font-family:Calibri,Arial,sans-serif;color:#1e293b;font-size:11pt;line-height:1.4}' +
    'h1{font-size:22pt;color:#0f172a;margin:0 0 2pt 0}' +
    '.role{font-size:12pt;color:#b45309;margin:0 0 10pt 0;font-weight:bold}' +
    '.contact{font-size:10pt;color:#475569;margin-bottom:14pt}' +
    'h2{font-size:13pt;color:#0f172a;border-bottom:1.5pt solid #d4af37;padding-bottom:2pt;margin:14pt 0 6pt 0}' +
    'p{margin:0 0 8pt 0}' +
    '.skill{display:inline-block;margin:0 4pt 4pt 0}' +
    '</style></head><body>' +
    '<h1>' + esc(d.fn) + ' ' + esc(d.ln) + '</h1>' +
    (d.jt ? '<p class="role">' + esc(d.jt) + '</p>' : '') +
    '<p class="contact">' + esc(d.em) + ' &nbsp;|&nbsp; ' + esc(d.ph) + (d.ci ? ' &nbsp;|&nbsp; ' + esc(d.ci) : '') + '</p>';

  if (d.sum) html += '<h2>Professional Summary</h2><p>' + esc(d.sum) + '</p>';
  if (d.qual) html += '<h2>Education & Qualifications</h2><p>' + esc(d.qual) + '</p>';
  if (d.exp || d.co) {
    html += '<h2>Work Experience</h2>';
    if (d.co) html += '<p><b>' + esc(d.co) + '</b></p>';
    if (d.exp) html += '<p>' + esc(String(d.exp)) + (String(d.exp).match(/year|month/i) ? '' : ' years') + ' experience</p>';
  }
  if (d.sk) {
    html += '<h2>Skills</h2><p>';
    var skills = String(d.sk).split(/[,\n]/).filter(function(s){ return s.trim(); });
    html += skills.map(function(s){ return '&#8226; ' + esc(s.trim()); }).join('&nbsp;&nbsp;&nbsp;');
    html += '</p>';
  }
  html += '</body></html>';

  var blob = new Blob(['\ufeff', html], { type: 'application/msword' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = (window._cvName || (d.fn + '_' + d.ln + '_CV')) + '.doc';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadCVSingleCol(d, fmt, jsPDFLib) {
  var doc = new jsPDFLib({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  var PW = 210, PH = 297;
  var NAVY = [15, 23, 42], BLUE = [37, 99, 235], SKY = [56, 189, 248], GOLD = [212, 175, 55];
  var TEXT = [30, 41, 59], MUTE = [100, 116, 139], HAIR = [226, 232, 240];

  var mx = 18;                 // left margin
  var y = 0;
  var accent = (fmt === 'modern') ? BLUE : (fmt === 'classic' ? NAVY : NAVY);

  function line(color, weight) {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(weight);
    doc.line(mx, y, PW - mx, y);
  }
  function heading(txt) {
    y += 7;
    doc.setTextColor(accent[0], accent[1], accent[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(txt.toUpperCase(), mx, y);
    y += 2;
    line((fmt === 'minimal') ? HAIR : accent, (fmt === 'minimal') ? 0.2 : 0.6);
    y += 5;
  }
  function body(txt, size, color, gap) {
    doc.setTextColor(color[0], color[1], color[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size || 10);
    var lines = doc.splitTextToSize(txt, PW - mx * 2);
    lines.forEach(function(ln){
      if (y > PH - 18) { doc.addPage(); y = 20; }
      doc.text(ln, mx, y); y += (size ? size * 0.42 : 4.6);
    });
    y += (gap || 2);
  }

  // ---------- HEADER ----------
  if (fmt === 'modern') {
    // Blue gradient-style banner
    doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
    doc.rect(0, 0, PW, 46, 'F');
    doc.setFillColor(SKY[0], SKY[1], SKY[2]);
    doc.rect(0, 44, PW, 2, 'F');
    // photo right side
    var hy = 18;
    if (d.photo) {
      try {
        var ps = 26, pxp = PW - mx - ps;
        doc.setFillColor(255,255,255); doc.circle(pxp + ps/2, 23, ps/2 + 1.2, 'F');
        doc.addImage(d.photo, (d.photo.indexOf('image/png')>-1?'PNG':'JPEG'), pxp, 10, ps, ps);
      } catch(e){}
    }
    doc.setTextColor(255,255,255);
    doc.setFont('helvetica','bold'); doc.setFontSize(24);
    doc.text((d.fn + ' ' + d.ln).trim(), mx, 22);
    if (d.jt) { doc.setFont('helvetica','normal'); doc.setFontSize(12); doc.setTextColor(219,234,254); doc.text(d.jt, mx, 31); }
    doc.setFontSize(9); doc.setTextColor(219,234,254);
    doc.text([d.em, d.ph, d.ci].filter(Boolean).join('   |   '), mx, 40);
    y = 56;
  } else if (fmt === 'classic') {
    // Centered classic header
    y = 24;
    if (d.photo) {
      try { var ps2=26, cx=PW/2-ps2/2; doc.setDrawColor(NAVY[0],NAVY[1],NAVY[2]); doc.setLineWidth(0.6);
        doc.addImage(d.photo,(d.photo.indexOf('image/png')>-1?'PNG':'JPEG'),cx,y,ps2,ps2); doc.circle(PW/2,y+ps2/2,ps2/2+0.6,'S'); y+=ps2+7; } catch(e){}
    }
    doc.setTextColor(NAVY[0],NAVY[1],NAVY[2]);
    doc.setFont('helvetica','bold'); doc.setFontSize(24);
    doc.text((d.fn + ' ' + d.ln).trim(), PW/2, y, { align:'center' }); y += 7;
    if (d.jt) { doc.setFont('helvetica','normal'); doc.setFontSize(12); doc.setTextColor(GOLD[0],GOLD[1],GOLD[2]); doc.text(d.jt, PW/2, y, {align:'center'}); y += 6; }
    doc.setFontSize(9); doc.setTextColor(MUTE[0],MUTE[1],MUTE[2]);
    doc.text([d.em, d.ph, d.ci].filter(Boolean).join('   |   '), PW/2, y, {align:'center'}); y += 4;
    line(NAVY, 0.6); y += 2;
  } else {
    // minimal - left aligned, lots of space, thin lines
    y = 26;
    doc.setTextColor(NAVY[0],NAVY[1],NAVY[2]);
    doc.setFont('helvetica','bold'); doc.setFontSize(26);
    doc.text((d.fn + ' ' + d.ln).trim(), mx, y); y += 8;
    if (d.jt) { doc.setFont('helvetica','normal'); doc.setFontSize(12); doc.setTextColor(MUTE[0],MUTE[1],MUTE[2]); doc.text(d.jt, mx, y); y += 6; }
    doc.setFontSize(9); doc.setTextColor(MUTE[0],MUTE[1],MUTE[2]);
    doc.text([d.em, d.ph, d.ci].filter(Boolean).join('   ·   '), mx, y); y += 4;
    line(HAIR, 0.2); y += 2;
  }

  // ---------- SECTIONS ----------
  if (d.sum) { heading('Professional Profile'); body(d.sum, 10, TEXT, 3); }
  if (d.qual) { heading('Education'); body(d.qual, 10, TEXT, 3); }
  if (d.exp || d.co) {
    heading('Work Experience');
    if (d.co) { doc.setFont('helvetica','bold'); doc.setFontSize(10.5); doc.setTextColor(NAVY[0],NAVY[1],NAVY[2]); if(y>PH-18){doc.addPage();y=20;} doc.text(d.co, mx, y); y += 5; }
    if (d.exp) body(String(d.exp) + (String(d.exp).match(/year|month/i)?'':' years') + ' experience', 10, TEXT, 3);
  }
  if (d.sk) {
    heading('Skills');
    var skills = String(d.sk).split(/[,\n]/).map(function(s){return s.trim();}).filter(Boolean);
    body(skills.join('   ·   '), 10, TEXT, 3);
  }
  heading('References');
  body('Available on request', 10, MUTE, 0);

  // Footer brand
  doc.setTextColor(MUTE[0], MUTE[1], MUTE[2]);
  doc.setFont('helvetica','italic'); doc.setFontSize(7.5);
  doc.text('Created with Sky Blueprint - skyblueprint.company', PW/2, PH - 10, { align:'center' });

  doc.save((window._cvName || (d.fn + '_' + d.ln + '_CV')) + '.pdf');
}

function downloadCV() {
  if (!requirePaidAction('download your CV')) return;
  // Generate a TRUE PDF (real text, exact colors, selectable) - not a screenshot
  if (!window._cvData) { alert('Please build your CV first.'); return; }
  var jsPDFLib = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : null;
  if (!jsPDFLib) {
    // fallback to old html2pdf method if jsPDF missing
    if (typeof html2pdf !== 'undefined' && window._cvHTML) { downloadCVLegacy(); return; }
    downloadCVPrint(); return;
  }

  var d = window._cvData;
  var fmt = window._cvFormat || 'navy';
  if (fmt !== 'navy') { downloadCVSingleCol(d, fmt, jsPDFLib); return; }
  var doc = new jsPDFLib({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  var PAGE_W = 210, PAGE_H = 297, SIDE_W = 72;

  // Colors: dark ink sidebar, gold accent, clean white main
  var INK = [15, 23, 42];        // #0F172A
  var GOLD = [212, 175, 55];     // gold accent
  var LIGHT = [226, 232, 240];   // light text on dark
  var MUTE = [148, 163, 184];    // muted
  var DARK_TEXT = [30, 41, 59];  // main body text
  var HEAD = [15, 23, 42];       // headings on white

  // ===== SIDEBAR (dark) =====
  doc.setFillColor(INK[0], INK[1], INK[2]);
  doc.rect(0, 0, SIDE_W, PAGE_H, 'F');
  // gold top accent line
  doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.rect(0, 0, SIDE_W, 2.5, 'F');

  var sx = 10, sy = 26, sw = SIDE_W - 20;

  // Profile photo (circular) at top of sidebar, if uploaded
  if (d.photo) {
    try {
      var photoSize = 34;
      var photoX = (SIDE_W - photoSize) / 2;
      var photoY = sy;
      // white ring behind photo
      doc.setFillColor(255, 255, 255);
      doc.circle(SIDE_W / 2, photoY + photoSize / 2, photoSize / 2 + 1.2, 'F');
      var fmt = (d.photo.indexOf('image/png') > -1) ? 'PNG' : 'JPEG';
      doc.addImage(d.photo, fmt, photoX, photoY, photoSize, photoSize);
      // gold ring stroke
      doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
      doc.setLineWidth(0.8);
      doc.circle(SIDE_W / 2, photoY + photoSize / 2, photoSize / 2 + 1.2, 'S');
      sy += photoSize + 10;
    } catch (e) { /* if the image can't be added, just skip it */ }
  }

  // Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  var nameLines = doc.splitTextToSize((d.fn + ' ' + d.ln).trim(), sw);
  doc.text(nameLines, sx, sy);
  sy += nameLines.length * 7 + 2;

  // Job title
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text(d.jt || '', sx, sy);
  sy += 12;

  function sideHeading(label) {
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(label.toUpperCase(), sx, sy);
    sy += 2;
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.4);
    doc.line(sx, sy, sx + sw, sy);
    sy += 6;
  }
  function sideText(text, size) {
    doc.setTextColor(LIGHT[0], LIGHT[1], LIGHT[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size || 8.5);
    var lines = doc.splitTextToSize(text, sw);
    doc.text(lines, sx, sy);
    sy += lines.length * 4.2 + 2;
  }

  // CONTACT
  sideHeading('Contact');
  if (d.ph) sideText('Phone:  ' + d.ph);
  if (d.em) sideText('Email:  ' + d.em);
  if (d.ci) sideText('Location:  ' + d.ci);
  sy += 6;

  // SKILLS
  var skills = (d.sk || '').split(',').map(function(s){ return s.trim(); }).filter(Boolean);
  if (skills.length) {
    sideHeading('Skills');
    skills.forEach(function(s) {
      doc.setFillColor(GOLD[0], GOLD[1], GOLD[2]);
      doc.circle(sx + 1.2, sy - 1.2, 0.8, 'F');
      doc.setTextColor(LIGHT[0], LIGHT[1], LIGHT[2]);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      var lines = doc.splitTextToSize(s, sw - 5);
      doc.text(lines, sx + 4, sy);
      sy += lines.length * 4.2 + 1.5;
    });
    sy += 5;
  }

  // REFERENCES
  sideHeading('References');
  doc.setTextColor(MUTE[0], MUTE[1], MUTE[2]);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.text('Available on request', sx, sy);

  // ===== MAIN AREA (white) =====
  var mx = SIDE_W + 12, my = 26, mw = PAGE_W - mx - 12;

  function mainHeading(label) {
    doc.setTextColor(HEAD[0], HEAD[1], HEAD[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(label.toUpperCase(), mx, my);
    my += 2;
    doc.setDrawColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setLineWidth(0.5);
    doc.line(mx, my, mx + mw, my);
    my += 7;
  }
  function mainText(text, size, color) {
    var c = color || DARK_TEXT;
    doc.setTextColor(c[0], c[1], c[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(size || 9.5);
    var lines = doc.splitTextToSize(text, mw);
    doc.text(lines, mx, my);
    my += lines.length * 4.6 + 2;
  }

  // PERSONAL PROFILE
  if (d.sum) {
    mainHeading('Personal Profile');
    mainText(d.sum);
    my += 6;
  }

  // EDUCATION
  if (d.qual) {
    mainHeading('Education');
    doc.setTextColor(HEAD[0], HEAD[1], HEAD[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(d.qual, mx, my);
    my += 12;
  }

  // WORK EXPERIENCE
  mainHeading('Work Experience');
  if (d.jt) {
    doc.setTextColor(HEAD[0], HEAD[1], HEAD[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(d.jt, mx, my);
    my += 5;
  }
  if (d.co) {
    doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(d.co, mx, my);
    my += 5;
  }
  if (d.exp) {
    mainText(d.exp + (String(d.exp).match(/year|month/i) ? '' : ' years') + ' experience', 8.5, MUTE);
  }

  // Footer branding
  doc.setTextColor(MUTE[0], MUTE[1], MUTE[2]);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text('Sky Blueprint — Your Digital Life, Unified', (SIDE_W + PAGE_W) / 2, PAGE_H - 10, { align: 'center' });

  doc.save((window._cvName || 'My_CV') + '.pdf');
}

function downloadCVLegacy() {
  var wrapper = document.createElement('div');
  wrapper.innerHTML = window._cvHTML;
  var noprint = wrapper.querySelectorAll('.no-print');
  noprint.forEach(function(n){ n.remove(); });
  var opt = {
    margin: 0,
    filename: (window._cvName || 'My_CV') + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#060914' },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(wrapper).save().catch(function(){ downloadCVPrint(); });
}

function downloadCVPrint() {
  if (!window._cvHTML) { alert('Please build your CV first.'); return; }
  var win = window.open('', '_blank');
  if (!win) { alert('Please allow pop-ups for this site, then tap Download again.'); return; }
  win.document.write(window._cvHTML);
  win.document.close();
  win.focus();
  setTimeout(function() {
    win.print(); // On PC: choose "Save as PDF". On phone: choose "Save as PDF"
  }, 700);
}

function printCV() {
  if (!window._cvHTML) { alert('Please build your CV first.'); return; }
  var win = window.open('', '_blank');
  if (!win) { alert('Please allow pop-ups for this site, then tap Print again.'); return; }
  win.document.write(window._cvHTML);
  win.document.close();
  win.focus();
  setTimeout(function() { win.print(); }, 700);
}

function downloadCVFile() {
  // Alternative - saves the raw file to device (for those who want the file itself)
  if (!window._cvHTML) { alert('Please build your CV first.'); return; }
  try {
    var blob = new Blob([window._cvHTML], { type: 'text/html' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (window._cvName || 'My_CV') + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch(e) { downloadCV(); }
}

function previewCV() {
  if (!window._cvHTML) { alert('Please build your CV first.'); return; }
  var win = window.open('', '_blank');
  if (!win) { alert('Please allow pop-ups for this site to preview.'); return; }
  win.document.write(window._cvHTML);
  win.document.close();
}

function attachCoverLetterHandler() {
  setTimeout(function() {
    var btn = document.getElementById('cl-open-btn');
    if (btn) {
      btn.onclick = null;
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        createCoverLetter();
      });
    }
  }, 100);
}

function createCoverLetter() {
  console.log('createCoverLetter CLICKED - function is running');
  // If cvData not set, try to rebuild it from the CV form fields
  if (!window._cvData) {
    var fn = (document.getElementById('cv-fn') || {value:''}).value.trim();
    var ln = (document.getElementById('cv-ln') || {value:''}).value.trim();
    if (fn) {
      window._cvData = {
        fn: fn, ln: ln,
        em: (document.getElementById('cv-em') || {value:''}).value.trim(),
        ph: (document.getElementById('cv-ph') || {value:''}).value.trim(),
        ci: (document.getElementById('cv-ci') || {value:''}).value.trim(),
        qual: (document.getElementById('cv-qual-level') || {value:''}).value,
        jt: (document.getElementById('cv-jt') || {value:''}).value.trim(),
        co: (document.getElementById('cv-co') || {value:''}).value.trim(),
        sk: (document.getElementById('cv-sk') || {value:''}).value.trim(),
        sum: (document.getElementById('cv-sum') || {value:''}).value.trim(),
        exp: (document.getElementById('cv-exp') || {value:''}).value,
        photo: (window._cvPhoto || '')
      };
    }
  }
  if (!window._cvData) { alert('Please build your CV first, then create your cover letter.'); return; }
  var d = window._cvData;

  // Show a small form to capture the job they are applying for (expert tip: tailor to specific role)
  document.getElementById('cv-msg').innerHTML =
    '<div style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.25);border-radius:14px;padding:20px">' +
    '<strong style="color:#a855f7;display:block;margin-bottom:6px;font-size:16px">Create Your Cover Letter</strong>' +
    '<p style="font-size:12px;color:var(--muted);margin-bottom:12px">A cover letter should be tailored to the exact job. Fill in these details and we build a professional one that matches your CV.</p>' +
    '<div style="background:rgba(56,189,248,0.06);border-left:3px solid #38bdf8;border-radius:8px;padding:12px 14px;margin-bottom:16px">' +
    '<div style="font-size:11px;font-weight:700;color:#38bdf8;margin-bottom:6px">EXPERT TIPS (from 200+ HR managers):</div>' +
    '<div style="font-size:11px;color:var(--muted);line-height:1.6">• Tailor it to THIS job — generic letters get ignored<br>• Show what VALUE you bring, not just what you did<br>• Explain WHY this specific company<br>• Never lie — 86% of HR catch it</div>' +
    '</div>' +
    '<div class="form-group"><label>Company Name *</label><input type="text" id="cl-company" placeholder="e.g. Shoprite Holdings"></div>' +
    '<div class="form-group"><label>Job Title You Are Applying For *</label><input type="text" id="cl-role" placeholder="e.g. Sales Assistant" value="' + (d.jt || '') + '"></div>' +
    '<div class="form-group"><label>Hiring Manager Name (if you know it)</label><input type="text" id="cl-manager" placeholder="e.g. Ms. Dlamini (or leave blank)"></div>' +
    '<div class="form-group"><label>Why do you want THIS job? (1-2 sentences) *</label><textarea id="cl-why" rows="3" placeholder="e.g. I admire how your company serves South African communities and I want to grow my retail career with a trusted brand."></textarea></div>' +
    '<button class="btn-primary" style="width:100%;box-sizing:border-box" onclick="generateCoverLetter()">Generate My Cover Letter</button>' +
    '<button style="width:100%;box-sizing:border-box;margin-top:8px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#e2e8f0;border-radius:8px;padding:11px;font-family:var(--font);cursor:pointer;font-size:13px" onclick="buildAndMatchCV()">← Back to CV</button>' +
    '</div>';
}

function generateCoverLetter() {
  // Build CV data straight from the form (works without building CV first)
  var d = window._cvData;
  if (!d || !d.fn) {
    d = {
      fn: (document.getElementById('cv-fn') || {value:''}).value.trim(),
      ln: (document.getElementById('cv-ln') || {value:''}).value.trim(),
      em: (document.getElementById('cv-em') || {value:''}).value.trim(),
      ph: (document.getElementById('cv-ph') || {value:''}).value.trim(),
      ci: (document.getElementById('cv-ci') || {value:''}).value.trim(),
      qual: (document.getElementById('cv-qual-level') || {value:''}).value,
      jt: (document.getElementById('cv-jt') || {value:''}).value.trim(),
      co: (document.getElementById('cv-co') || {value:''}).value.trim(),
      sk: (document.getElementById('cv-sk') || {value:''}).value.trim(),
      sum: (document.getElementById('cv-sum') || {value:''}).value.trim(),
      exp: (document.getElementById('cv-exp') || {value:''}).value
    };
    window._cvData = d;
  }
  if (!d.fn) { alert('Please fill in your name in the "Build My CV" tab first.'); return; }

  var company = (document.getElementById('cl-company') || {value:''}).value.trim();
  var role = (document.getElementById('cl-role') || {value:''}).value.trim();
  var manager = (document.getElementById('cl-manager') || {value:''}).value.trim();
  var why = (document.getElementById('cl-why') || {value:''}).value.trim();

  if (!company || !role || !why) { alert('Please fill in the company, job title, and why you want the job.'); return; }

  var greeting = manager ? 'Dear ' + manager + ',' : 'Dear Hiring Manager,';
  var today = new Date().toLocaleDateString('en-ZA', { year:'numeric', month:'long', day:'numeric' });

  // Build skills sentence
  var skills = d.sk ? d.sk.split(',').map(function(s){return s.trim();}).filter(Boolean) : [];
  var skillsSentence = skills.length ? 'My key strengths include ' + (skills.length > 2 ? skills.slice(0,3).join(', ') : skills.join(' and ')) + ', which I am confident will add value to your team.' : '';

  // Experience sentence (expert tip: lead with experience/value, not education)
  var expSentence = '';
  if (d.jt && d.co) {
    expSentence = 'In my role as ' + d.jt + ' at ' + d.co + ', I developed practical experience and a strong work ethic that I am eager to bring to ' + company + '.';
  } else if (d.jt) {
    expSentence = 'Through my experience as ' + d.jt + ', I have built skills that directly support this role.';
  } else {
    expSentence = 'I am a dedicated and fast-learning individual, ready to contribute and grow within your organisation.';
  }

  // Professional summary line
  var summaryLine = d.sum ? d.sum : 'I am a motivated professional committed to delivering quality work and continuous growth.';

  // Build the cover letter HTML (expert-based: tailored, tells the story, shows value, specific to company)
  var clHTML =
'<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
'<title>Cover Letter - ' + d.fn + ' ' + d.ln + '</title><style>' +
'@import url(\'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap\');' +
'*{margin:0;padding:0;box-sizing:border-box}' +
'body{font-family:Inter,Arial,sans-serif;color:#1a1a2e;background:#fff;line-height:1.7;font-size:11pt}' +
'.page{max-width:800px;margin:0 auto;padding:50px 60px}' +
'.header{border-bottom:3px solid #38bdf8;padding-bottom:20px;margin-bottom:30px}' +
'.name{font-size:24pt;font-weight:700;color:#0d1f3c}' +
'.contact{font-size:10pt;color:#555;margin-top:8px}' +
'.date{margin:24px 0;color:#555;font-size:10pt}' +
'.company-block{margin-bottom:24px;font-weight:600;color:#0d1f3c}' +
'.body-text{margin-bottom:16px;text-align:justify}' +
'.signature{margin-top:32px}' +
'.sig-name{font-weight:700;color:#0d1f3c;font-size:13pt;margin-top:4px}' +
'.footer{margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;font-size:9pt;color:#38bdf8;font-weight:600}' +
'@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}.no-print{display:none!important}}' +
'</style></head><body><div class="page">' +
'<div class="header">' +
'<div class="name">' + d.fn + ' ' + d.ln + '</div>' +
'<div class="contact">' + [d.em, d.ph, d.ci].filter(Boolean).join('  |  ') + '</div>' +
'</div>' +
'<div class="date">' + today + '</div>' +
'<div class="company-block">The Hiring Team<br>' + company + '</div>' +
'<p class="body-text">' + greeting + '</p>' +
'<p class="body-text">I am writing to apply for the position of <strong>' + role + '</strong> at ' + company + '. ' + why + '</p>' +
'<p class="body-text">' + summaryLine + ' ' + expSentence + '</p>' +
'<p class="body-text">' + skillsSentence + ' I am a reliable, hardworking person who shows up consistently and takes pride in doing a job well. I am confident that I can make a positive contribution to ' + company + ' from day one.</p>' +
'<p class="body-text">I would welcome the opportunity to discuss how my skills and dedication align with your needs. Thank you for taking the time to consider my application. I look forward to hearing from you.</p>' +
'<div class="signature">' +
'<p>Yours sincerely,</p>' +
'<div class="sig-name">' + d.fn + ' ' + d.ln + '</div>' +
'</div>' +
'<div class="footer">Created with Sky Blueprint — Your Digital Life, Unified</div>' +
'</div>' +
'<div class="no-print" style="text-align:center;padding:20px;background:#f5f5f5">' +
'<button onclick="window.print()" style="background:linear-gradient(135deg,#38bdf8,#6366f1);color:#fff;border:none;border-radius:10px;padding:14px 32px;font-size:14px;font-weight:700;cursor:pointer">Save as PDF</button>' +
'</div></body></html>';

  window._clHTML = clHTML;
  window._clName = (d.fn + '_' + d.ln + '_CoverLetter').replace(/\s+/g,'_');
  // Store raw text so we can build a TRUE text PDF (selectable, real fonts, exact colors)
  window._clData = {
    name: d.fn + ' ' + d.ln,
    contact: [d.em, d.ph, d.ci].filter(Boolean).join('  |  '),
    date: today,
    company: company,
    role: role,
    paragraphs: [
      greeting,
      'I am writing to apply for the position of ' + role + ' at ' + company + '. ' + why,
      summaryLine + ' ' + expSentence,
      skillsSentence + ' I am a reliable, hardworking person who shows up consistently and takes pride in doing a job well. I am confident that I can make a positive contribution to ' + company + ' from day one.',
      'I would welcome the opportunity to discuss how my skills and dedication align with your needs. Thank you for taking the time to consider my application. I look forward to hearing from you.'
    ]
  };

  // Show success with download options - into cl-result if it exists, else cv-msg
  var outEl = document.getElementById('cl-result') || document.getElementById('cv-msg');
  outEl.innerHTML =
    '<div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:14px;padding:18px">' +
    '<strong style="color:var(--green);display:block;margin-bottom:8px;font-size:16px">✅ Cover Letter Ready!</strong>' +
    '<p style="font-size:12px;color:var(--muted);margin-bottom:14px">Tailored for <strong style="color:#fff">' + role + '</strong> at <strong style="color:#fff">' + company + '</strong></p>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
    '<button onclick="downloadCoverLetter()" style="flex:1;min-width:130px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:8px;padding:13px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font)">Save as PDF</button>' +
    '<button onclick="previewCoverLetter()" style="flex:1;min-width:120px;background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;border-radius:8px;padding:13px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font)">Preview</button>' +
    '</div>' +
    '<div style="background:rgba(139,92,246,0.08);border-radius:8px;padding:12px;margin-top:12px">' +
    '<p style="font-size:11px;color:#c4b5fd;margin:0;line-height:1.6"><strong>Expert tip:</strong> Read your cover letter out loud before sending. Make sure it explains WHY you want this specific job — recruiters can tell when it is generic!</p>' +
    '</div>' +
    '</div>';
}

function downloadCoverLetter() {
  // TRUE PDF: real selectable text, exact solid colors - not a screenshot
  var jsPDFLib = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : null;
  if (jsPDFLib && window._clData) {
    var c = window._clData;
    var doc = new jsPDFLib({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    var M = 22, W = 210 - M * 2, y = 24;
    var INK = [13, 31, 60], GRAY = [85, 85, 85], BLUE = [56, 189, 248];

    // Header: name + contact + blue rule
    doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(INK[0], INK[1], INK[2]);
    doc.text(c.name, M, y); y += 7;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text(c.contact, M, y); y += 5;
    doc.setDrawColor(BLUE[0], BLUE[1], BLUE[2]); doc.setLineWidth(1);
    doc.line(M, y, 210 - M, y); y += 10;

    // Date + company block
    doc.setFontSize(10); doc.setTextColor(GRAY[0], GRAY[1], GRAY[2]);
    doc.text(c.date, M, y); y += 10;
    doc.setFont('helvetica', 'bold'); doc.setTextColor(INK[0], INK[1], INK[2]);
    doc.text('The Hiring Team', M, y); y += 5;
    doc.text(c.company, M, y); y += 10;

    // Body paragraphs (real wrapped text)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(26, 26, 46);
    c.paragraphs.forEach(function(p) {
      var lines = doc.splitTextToSize(p, W);
      if (y + lines.length * 5.4 > 270) { doc.addPage(); y = 24; }
      doc.text(lines, M, y, { lineHeightFactor: 1.5 });
      y += lines.length * 5.4 + 5;
    });

    // Signature
    if (y + 24 > 280) { doc.addPage(); y = 24; }
    y += 4;
    doc.text('Yours sincerely,', M, y); y += 8;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(INK[0], INK[1], INK[2]);
    doc.text(c.name, M, y);

    // Footer
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(BLUE[0], BLUE[1], BLUE[2]);
    doc.text('Created with Sky Blueprint', 105, 290, { align: 'center' });

    doc.save((window._clName || 'Cover_Letter') + '.pdf');
    return;
  }
  // Fallbacks if jsPDF unavailable
  if (!window._clHTML) { alert('Please create your cover letter first.'); return; }
  if (typeof html2pdf !== 'undefined') {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = window._clHTML;
    wrapper.querySelectorAll('.no-print').forEach(function(n){ n.remove(); });
    var opt = {
      margin: 0,
      filename: (window._clName || 'Cover_Letter') + '.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(wrapper).save().catch(function(){ downloadCoverLetterPrint(); });
    return;
  }
  downloadCoverLetterPrint();
}

function downloadCoverLetterPrint() {
  if (!window._clHTML) { alert('Please create your cover letter first.'); return; }
  var win = window.open('', '_blank');
  if (!win) { alert('Please allow pop-ups, then tap Save as PDF again.'); return; }
  win.document.write(window._clHTML);
  win.document.close();
  win.focus();
  setTimeout(function() { win.print(); }, 700);
}

function previewCoverLetter() {
  if (!window._clHTML) { alert('Please create your cover letter first.'); return; }
  var win = window.open('', '_blank');
  if (!win) { alert('Please allow pop-ups to preview.'); return; }
  win.document.write(window._clHTML);
  win.document.close();
}

function showMatchingJobs(data, name, loc, jobTitle) {
  var q = encodeURIComponent(jobTitle || '');
  var l = encodeURIComponent(loc || 'South Africa');
  var lq = encodeURIComponent(data.levelLabel || '');
  var level = data.level || 'entry';

  // Build job search URLs for all 5 job types
  var jobTypes = {
    permanent: {
      label: 'Permanent / Full-Time Jobs',
      icon: '',
      color: '#0077b5',
      desc: 'Stable permanent employment with benefits',
      links: [
        { name: 'LinkedIn', url: 'https://www.linkedin.com/jobs/search/?keywords='+q+'&location='+l+'&f_JT=F', color: '#0077b5' },
        { name: 'Indeed SA', url: 'https://za.indeed.com/jobs?q='+q+'&l='+l+'&jt=fulltime', color: '#2164f3' },
        { name: 'Pnet SA', url: 'https://www.pnet.co.za/jobs/'+encodeURIComponent((jobTitle||'jobs').toLowerCase().replace(/\s+/g,'-'))+'/', color: '#e84c3d' },
        { name: 'CareerJunction', url: 'https://www.careerjunction.co.za/jobs/results?Keywords='+q+'&Province=0', color: '#ff6900' },
      ]
    },
    learnership: {
      label: 'Learnerships',
      icon: '',
      color: '#10b981',
      desc: 'Earn while you learn — get paid + qualification',
      links: [
        { name: 'Indeed Learnerships', url: 'https://za.indeed.com/jobs?q=learnership+'+q+'&l='+l, color: '#2164f3' },
        { name: 'LinkedIn Learnerships', url: 'https://www.linkedin.com/jobs/search/?keywords=learnership+'+q+'&location='+l, color: '#0077b5' },
        { name: 'Pnet Learnerships', url: 'https://www.pnet.co.za/jobs/learnership/', color: '#e84c3d' },
        { name: 'Limpopo Jobs', url: 'https://www.limpopojobs.co.za/jobs?search=learnership', color: '#7c3aed' },
      ]
    },
    internship: {
      label: 'Internships',
      icon: '',
      color: '#6366f1',
      desc: 'Gain experience and build your career',
      links: [
        { name: 'Indeed Internships', url: 'https://za.indeed.com/jobs?q=internship+'+q+'&l='+l, color: '#2164f3' },
        { name: 'LinkedIn Internships', url: 'https://www.linkedin.com/jobs/search/?keywords=internship+'+q+'&location='+l+'&f_JT=I', color: '#0077b5' },
        { name: 'StudentRoom SA', url: 'https://www.studentroom.co.za/internships', color: '#10b981' },
        { name: 'GradSA', url: 'https://www.grad.ac.za/internships', color: '#f59e0b' },
      ]
    },
    contract: {
      label: 'Contract / Temporary Jobs',
      icon: '',
      color: '#f59e0b',
      desc: 'Short-term contracts and temporary positions',
      links: [
        { name: 'Indeed Contract', url: 'https://za.indeed.com/jobs?q='+q+'&l='+l+'&jt=contract', color: '#2164f3' },
        { name: 'LinkedIn Contract', url: 'https://www.linkedin.com/jobs/search/?keywords='+q+'&location='+l+'&f_JT=C', color: '#0077b5' },
        { name: 'Temp SA Jobs', url: 'https://za.indeed.com/jobs?q=temp+contract+'+q+'&l='+l, color: '#e84c3d' },
        { name: 'PNet Contract', url: 'https://www.pnet.co.za/jobs/contract/', color: '#ff6900' },
      ]
    },
    youth: {
      label: 'Youth & Entry-Level Jobs',
      icon: '',
      color: '#ec4899',
      desc: 'Jobs for young people and first-time job seekers',
      links: [
        { name: 'YouthMobi', url: 'https://youthmobi.com/jobs?q='+q, color: '#7c3aed' },
        { name: 'SA Youth', url: 'https://www.sayouth.mobi/vacancies', color: '#10b981' },
        { name: 'NYDA Jobs', url: 'https://www.nyda.gov.za/opportunities', color: '#e84c3d' },
        { name: 'Indeed Youth', url: 'https://za.indeed.com/jobs?q='+q+'&l='+l+'&jt=parttime', color: '#2164f3' },
      ]
    }
  };

  // Qualification-based advice per job type
  var advice = {
    grade9:   'You qualify for basic labour, general worker and domestic positions. Focus on Youth & Learnerships — they accept Grade 9.',
    grade10:  'You qualify for general worker and some retail positions. Learnerships are your best option to grow your career.',
    grade11:  'You qualify for junior clerk, retail and some admin roles. Many learnerships accept Grade 11 — apply now!',
    entry:    'Matric opens many doors. Apply for learnerships, internships, call centre, sales and admin roles.',
    trade:    'Your N4/N5/N6/Trade qualification is in very high demand! Apply for artisan, technician and skilled trade roles.',
    mid:      'Your diploma or degree qualifies you for professional and supervisory roles. Apply for permanent and contract positions.',
    senior:   'Honours or Masters — apply for management, specialist and senior professional roles.',
    executive:'PhD level — apply for director, academic and executive positions.',
    basic:    'Focus on learnerships and youth programs to build your first work experience.'
  };

  var levelAdvice = advice[level] || advice['entry'];

  // Build job type cards HTML
  var cardsHTML = Object.keys(jobTypes).map(function(key) {
    var jt = jobTypes[key];
    var linksHTML = jt.links.map(function(link) {
      return '<a href="' + link.url + '" target="_blank" style="display:block;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:9px 12px;text-decoration:none;color:#e2e8f0;font-size:12px;font-weight:600;margin-bottom:6px;transition:all 0.2s">' +
        '<span style="color:' + link.color + ';margin-right:6px">→</span>' + link.name +
      '</a>';
    }).join('');

    return '<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:14px;margin-bottom:12px">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
      '<span style="font-size:18px">' + jt.icon + '</span>' +
      '<strong style="color:' + jt.color + ';font-size:13px">' + jt.label + '</strong>' +
      '</div>' +
      '<p style="font-size:11px;color:#64748b;margin:0 0 10px">' + jt.desc + '</p>' +
      linksHTML +
      '</div>';
  }).join('');

  var resultHTML =
    '<div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:14px;padding:18px">' +
    '<strong style="color:var(--green);display:block;margin-bottom:12px;font-size:16px">✅ CV Built for ' + (name||'You') + '!</strong>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">' +
    '<button onclick="downloadCV()" style="flex:1;min-width:130px;background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:8px;padding:13px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font)">Save as PDF</button>' +
    '<button onclick="downloadCVWord()" style="flex:1;min-width:130px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;border:none;border-radius:8px;padding:13px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font)">Save as Word (editable)</button>' +
    '<button onclick="previewCV()" style="flex:1;min-width:120px;background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;border-radius:8px;padding:13px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font)">Preview</button>' +
    '</div>' +
    '<div style="background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.3);border-radius:8px;padding:12px;margin-bottom:10px;text-align:center"><span style="font-size:13px;color:#c4b5fd;font-weight:600">Want a matching cover letter? Tap the <strong style="color:#fff">"Cover Letter"</strong> tab at the top!</span></div>' +
    '<p style="font-size:11px;color:#64748b;margin-bottom:14px">"Save as PDF" works on phone & PC. Then share on WhatsApp or email when applying.</p>' +
    '<div style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.2);border-radius:10px;padding:12px;margin-bottom:16px">' +
    '<strong style="color:#fff;display:block;margin-bottom:4px">Your Level: ' + (data.levelLabel||'') + '</strong>' +
    '<p style="color:var(--muted);font-size:13px;margin:0">' + levelAdvice + '</p>' +
    '</div>' +
    '<p style="font-size:13px;font-weight:700;color:#fff;margin-bottom:12px">Choose the type of job you are looking for:</p>' +
    cardsHTML +
    '</div>';

  document.getElementById('cv-msg').innerHTML = resultHTML;
  attachCoverLetterHandler();

  // Put same content in jobs tab
  var jobTab = document.getElementById('job-match-content');
  if (jobTab) jobTab.innerHTML = resultHTML;

  // Switch to jobs tab
  setTimeout(function() {
    var tabs = document.querySelectorAll('.tab');
    if (tabs && tabs.length > 1) {
      tabs.forEach(function(t){ t.classList.remove('active'); });
      tabs[1].classList.add('active');
      var b = document.getElementById('cvt-build');
      var j = document.getElementById('cvt-jobs');
      if (b) b.style.display = 'none';
      if (j) j.style.display = 'block';
    }
  }, 300);
}


function uploadAndAnalyzeCV(input) {
  if (!input.files || !input.files[0]) return;
  var file = input.files[0];
  var res = document.getElementById('upload-result');
  res.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted)">Reading your CV...</div>';

  var reader = new FileReader();
  reader.onload = async function(e) {
    var text = e.target.result;
    try {
      var response = await fetch(BACKEND_URL + '/api/match-jobs', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({cvText: text, jobTitle:'', location:'South Africa'})
      });
      var data = await response.json();
      res.innerHTML = '';
      document.getElementById('cv-msg').innerHTML = '';
      showMatchingJobs(data, file.name.replace('.pdf','').replace('.docx',''), 'South Africa', '');
    } catch(err) {
      var level = text.toLowerCase().includes('degree')||text.toLowerCase().includes('bcom') ? 'mid' :
                  text.toLowerCase().includes('diploma') ? 'mid' :
                  text.toLowerCase().includes('matric')||text.toLowerCase().includes('grade 12') ? 'entry' : 'entry';
      res.innerHTML = `<div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:16px">
        <strong style="color:var(--green)">✅ CV uploaded!</strong>
        <p style="color:var(--muted);font-size:13px;margin:8px 0">We detected your qualification level. Connect the backend server to get full AI matching.</p>
      </div>`;
    }
  };
  reader.readAsText(file);
}


// ── SA Map ──
function renderCustomerManager(el) {
  el.innerHTML =
    '<div class="tool-screen">' +
    '<h2>Customer Manager</h2>' +
    '<p style="color:var(--muted);font-size:14px;margin-bottom:4px">Keep all your customers in one place — contacts, notes and purchase history.</p>' +
    '<p style="font-size:12px;color:#38bdf8;margin-bottom:20px;font-style:italic">Private and secure. Only you can see your customer list.</p>' +
    '<button class="btn-primary" style="margin-bottom:20px" onclick="openCustomerForm()">+ Add New Customer</button>' +
    '<div id="cm-search-wrap" style="margin-bottom:16px;display:none"><input type="text" id="cm-search" placeholder="🔍 Search customers by name..." oninput="filterCustomers()" style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:12px;color:#fff;font-family:var(--font);font-size:14px"></div>' +
    '<div id="cm-list"><p style="color:var(--muted);text-align:center;padding:30px">Loading your customers...</p></div>' +
    '</div>';
  loadCustomers();
}

var _customers = [];

function requireToken() {
  var token = safeStorage.getItem('sb_token');
  if (!token) {
    if (confirm('For security, please log in again to use this feature. Log in now?')) {
      showPage('login');
    }
    return null;
  }
  return token;
}

function loadCustomers() {
  var token = safeStorage.getItem('sb_token');
  if (!token) {
    document.getElementById('cm-list').innerHTML = '<div style="text-align:center;padding:30px"><p style="color:var(--muted);margin-bottom:14px">Please log in again to use the Customer Manager.</p><button class="btn-primary" onclick="showPage(\'login\')">Log In</button></div>';
    return;
  }
  fetch(BACKEND_URL + '/api/customers/list', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ token: token })
  })
  .then(function(r){ return r.json(); })
  .then(function(data){
    _customers = (data && data.customers) || [];
    renderCustomerList(_customers);
  })
  .catch(function(){ document.getElementById('cm-list').innerHTML = '<p style="color:#f87171;text-align:center;padding:30px">Could not load customers. Check your internet and try again.</p>'; });
}

function renderCustomerList(list) {
  var wrap = document.getElementById('cm-list');
  var searchWrap = document.getElementById('cm-search-wrap');
  if (searchWrap) searchWrap.style.display = _customers.length > 3 ? 'block' : 'none';

  if (!list || !list.length) {
    wrap.innerHTML = '<div style="text-align:center;padding:40px 20px;background:rgba(255,255,255,0.03);border-radius:14px;border:1px dashed rgba(255,255,255,0.1)">' +
      '<div style="font-size:44px;margin-bottom:12px"></div>' +
      '<p style="color:#fff;font-weight:600;margin-bottom:6px">No customers yet</p>' +
      '<p style="color:var(--muted);font-size:13px">Tap "Add New Customer" to start building your customer list.</p>' +
      '</div>';
    return;
  }

  wrap.innerHTML = '<div style="font-size:12px;color:var(--muted);margin-bottom:12px">' + list.length + ' customer' + (list.length===1?'':'s') + '</div>' +
    list.map(function(c){
      return '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px;margin-bottom:12px">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
        '<div style="flex:1;min-width:0">' +
        '<div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:4px">' + escapeHtml(c.name) + '</div>' +
        (c.phone ? '<div style="font-size:13px;color:#38bdf8;margin-bottom:2px">' + escapeHtml(c.phone) + '</div>' : '') +
        (c.email ? '<div style="font-size:12px;color:var(--muted);margin-bottom:2px;word-break:break-all">' + escapeHtml(c.email) + '</div>' : '') +
        (c.lastPurchase ? '<div style="font-size:12px;color:#10b981;margin-top:4px">' + escapeHtml(c.lastPurchase) + '</div>' : '') +
        (c.notes ? '<div style="font-size:12px;color:var(--muted);margin-top:6px;line-height:1.5;background:rgba(255,255,255,0.03);padding:8px 10px;border-radius:8px">' + escapeHtml(c.notes) + '</div>' : '') +
        '</div>' +
        '<div style="display:flex;flex-direction:column;gap:6px">' +
        (c.phone ? '<a href="https://wa.me/' + c.phone.replace(/[^0-9]/g,'').replace(/^0/,'27') + '" target="_blank" style="background:rgba(37,211,102,0.15);border:1px solid rgba(37,211,102,0.3);color:#25d366;border-radius:8px;padding:7px 10px;font-size:11px;font-weight:700;text-decoration:none;text-align:center;white-space:nowrap">WhatsApp</a>' : '') +
        '<button onclick="editCustomer(\'' + c.id + '\')" style="background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;border-radius:8px;padding:7px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font)">Edit</button>' +
        '<button onclick="deleteCustomer(\'' + c.id + '\',\'' + escapeHtml(c.name).replace(/\'/g,"") + '\')" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);color:#f87171;border-radius:8px;padding:7px 10px;font-size:11px;font-weight:700;cursor:pointer;font-family:var(--font)">Delete</button>' +
        '</div>' +
        '</div>' +
        '</div>';
    }).join('');
}

function filterCustomers() {
  var q = (document.getElementById('cm-search') || {value:''}).value.toLowerCase();
  var filtered = _customers.filter(function(c){ return c.name.toLowerCase().indexOf(q) > -1; });
  renderCustomerList(filtered);
}

function openCustomerForm(existing) {
  var c = existing || {};
  var modal = document.createElement('div');
  modal.id = 'cm-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto';
  modal.innerHTML =
    '<div style="background:#0f1629;border:1px solid rgba(56,189,248,0.2);border-radius:20px;padding:28px;max-width:440px;width:100%;max-height:90vh;overflow-y:auto" onclick="event.stopPropagation()">' +
    '<h3 style="color:#fff;font-size:19px;margin-bottom:16px">' + (existing ? 'Edit Customer' : 'Add New Customer') + '</h3>' +
    '<input type="hidden" id="cm-id" value="' + (c.id || '') + '">' +
    '<div class="form-group"><label>Customer Name *</label><input type="text" id="cm-name" value="' + (c.name ? escapeHtml(c.name) : '') + '" placeholder="e.g. John Doe"></div>' +
    '<div class="form-group"><label>Phone Number</label><input type="tel" id="cm-phone" value="' + (c.phone ? escapeHtml(c.phone) : '') + '" placeholder="e.g. 082 123 4567"></div>' +
    '<div class="form-group"><label>Email (optional)</label><input type="email" id="cm-email" value="' + (c.email ? escapeHtml(c.email) : '') + '" placeholder="e.g. john@email.com"></div>' +
    '<div class="form-group"><label>Last Purchase / Service (optional)</label><input type="text" id="cm-purchase" value="' + (c.lastPurchase ? escapeHtml(c.lastPurchase) : '') + '" placeholder="e.g. Haircut R80, or Invoice #12"></div>' +
    '<div class="form-group"><label>Notes (optional)</label><textarea id="cm-notes" rows="3" placeholder="e.g. Prefers appointments on weekends. Allergic to...">' + (c.notes ? escapeHtml(c.notes) : '') + '</textarea></div>' +
    '<button class="btn-primary" style="width:100%;box-sizing:border-box;margin-bottom:8px" onclick="saveCustomer()">' + (existing ? 'Save Changes' : 'Add Customer') + '</button>' +
    '<button style="width:100%;box-sizing:border-box;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#e2e8f0;border-radius:10px;padding:12px;font-family:var(--font);cursor:pointer;font-size:14px" onclick="document.getElementById(\'cm-modal\').remove()">Cancel</button>' +
    '</div>';
  modal.onclick = function(){ modal.remove(); };
  document.body.appendChild(modal);
}

function editCustomer(id) {
  var c = _customers.find(function(x){ return x.id === id; });
  if (c) openCustomerForm(c);
}

function saveCustomer() {
  var token = safeStorage.getItem('sb_token');
  var id = (document.getElementById('cm-id')||{value:''}).value;
  var customer = {
    name: (document.getElementById('cm-name')||{value:''}).value.trim(),
    phone: (document.getElementById('cm-phone')||{value:''}).value.trim(),
    email: (document.getElementById('cm-email')||{value:''}).value.trim(),
    lastPurchase: (document.getElementById('cm-purchase')||{value:''}).value.trim(),
    notes: (document.getElementById('cm-notes')||{value:''}).value.trim()
  };
  if (!customer.name) { alert('Please enter the customer name.'); return; }

  var endpoint, body;
  if (id) { customer.id = id; endpoint = '/api/customers/update'; body = { token: token, customer: customer }; }
  else { endpoint = '/api/customers/add'; body = { token: token, customer: customer }; }

  fetch(BACKEND_URL + endpoint, {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify(body)
  })
  .then(function(r){ return r.json(); })
  .then(function(data){
    if (data && data.success) {
      var m = document.getElementById('cm-modal'); if (m) m.remove();
      loadCustomers();
    } else { alert((data && data.error) || 'Could not save customer.'); }
  })
  .catch(function(){ alert('Could not save. Check your internet and try again.'); });
}

function deleteCustomer(id, name) {
  if (!confirm('Delete ' + name + ' from your customers? This cannot be undone.')) return;
  var token = safeStorage.getItem('sb_token');
  fetch(BACKEND_URL + '/api/customers/delete', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ token: token, customerId: id })
  })
  .then(function(r){ return r.json(); })
  .then(function(){ loadCustomers(); })
  .catch(function(){ alert('Could not delete. Try again.'); });
}

function renderImageEditor(el) {
  el.innerHTML =
    '<div class="tool-screen">' +
    '<h2>Image &amp; Document Editor</h2>' +
    '<p style="color:var(--muted);font-size:14px;margin-bottom:4px">Add movable text, draw, paint, white-out, erase, add shapes. Works on photos and document scans.</p>' +
    '<p style="font-size:12px;color:#38bdf8;margin-bottom:18px;font-style:italic">Everything happens on your device. Your files stay private.</p>' +
    '<div id="ie-start">' +
    '<div id="ie-drop" style="background:rgba(255,255,255,0.03);border:2px dashed rgba(56,189,248,0.35);border-radius:16px;padding:40px 20px;text-align:center;transition:all 0.2s">' +
    '<svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:12px"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' +
    '<p style="color:#fff;font-weight:600;margin-bottom:6px;font-size:15px">Drop an image here, or click to choose</p>' +
    '<p style="color:var(--muted);font-size:12px;margin-bottom:16px">JPG, PNG, or a photo/scan of a document</p>' +
    '<input type="file" id="ie-file" accept="image/*" onchange="ieLoadImage(this)" style="display:none">' +
    '<button class="btn-primary" onclick="document.getElementById(\'ie-file\').click()" style="margin-bottom:10px">Choose Image</button><br>' +
    '<button onclick="ieBlankCanvas()" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#e2e8f0;border-radius:8px;padding:10px 18px;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font)">Start Blank Page</button>' +
    '</div></div>' +

    '<div id="ie-workspace" style="display:none">' +
      '<div class="ie-bar">' +
        '<button onclick="ieSetTool(\'select\')" id="ie-tool-select" class="ie-toolbtn ie-active">Move / Select</button>' +
        '<button onclick="ieAddText()" class="ie-toolbtn">Add Text</button>' +
        '<button onclick="ieSetTool(\'brush\')" id="ie-tool-brush" class="ie-toolbtn">Brush</button>' +
        '<button onclick="ieSetTool(\'white\')" id="ie-tool-white" class="ie-toolbtn">White Out</button>' +
        '<button onclick="ieSetTool(\'erase\')" id="ie-tool-erase" class="ie-toolbtn">Eraser</button>' +
        '<button onclick="ieSetTool(\'line\')" id="ie-tool-line" class="ie-toolbtn">Line</button>' +
        '<button onclick="ieSetTool(\'rect\')" id="ie-tool-rect" class="ie-toolbtn">Rectangle</button>' +
        '<button onclick="ieSetTool(\'circle\')" id="ie-tool-circle" class="ie-toolbtn">Circle</button>' +
        '<button onclick="ieSetTool(\'fill\')" id="ie-tool-fill" class="ie-toolbtn">Fill</button>' +
      '</div>' +

      '<div class="ie-bar" style="align-items:center">' +
        '<span style="font-size:12px;color:var(--muted);margin-right:2px">Colour</span>' +
        '<div id="ie-palette" style="display:flex;gap:4px;flex-wrap:wrap;max-width:100%"></div>' +
        '<input type="color" id="ie-color" value="#000000" onchange="ieSetColor(this.value)" style="width:34px;height:30px;border:none;border-radius:6px;background:none;cursor:pointer" title="Any colour you want">' +
      '</div>' +

      '<div class="ie-bar" style="align-items:center">' +
        '<span style="font-size:12px;color:var(--muted)">Size</span>' +
        '<input type="range" id="ie-size" min="1" max="80" value="8" style="width:110px">' +
        '<span id="ie-size-val" style="font-size:12px;color:#e2e8f0;min-width:24px">8</span>' +
        '<span style="font-size:12px;color:var(--muted);margin-left:8px">Opacity</span>' +
        '<input type="range" id="ie-opacity" min="10" max="100" value="100" style="width:90px">' +
        '<span style="font-size:12px;color:var(--muted);margin-left:8px">Eraser</span>' +
        '<select id="ie-erase-mode" style="font-size:12px;padding:4px;border-radius:6px;background:#0f1629;color:#e2e8f0;border:1px solid rgba(255,255,255,0.15)">' +
        '<option value="transparent">See-through</option>' +
        '<option value="match">Match background</option>' +
        '</select>' +
      '</div>' +

      '<div id="ie-text-controls" class="ie-bar" style="display:none;align-items:center">' +
        '<span style="font-size:12px;color:var(--muted)">Font</span>' +
        '<select id="ie-font" onchange="ieUpdateActiveText()" style="font-size:12px;padding:5px;border-radius:6px;background:#0f1629;color:#e2e8f0;border:1px solid rgba(255,255,255,0.15)">' +
        '<option value="Arial, sans-serif">Arial</option>' +
        '<option value="Georgia, serif">Georgia</option>' +
        '<option value="Times New Roman, serif">Times</option>' +
        '<option value="Courier New, monospace">Courier</option>' +
        '<option value="Verdana, sans-serif">Verdana</option>' +
        '<option value="Impact, sans-serif">Impact</option>' +
        '</select>' +
        '<span style="font-size:12px;color:var(--muted);margin-left:6px">Text size</span>' +
        '<button onclick="ieTextSize(-2)" class="ie-toolbtn" style="padding:6px 12px;font-weight:800" title="Smaller">A−</button>' +
        '<span id="ie-textsize-val" style="font-size:12px;color:#e2e8f0;min-width:30px;text-align:center">34</span>' +
        '<button onclick="ieTextSize(2)" class="ie-toolbtn" style="padding:6px 12px;font-weight:800" title="Bigger">A+</button>' +
        '<button onclick="ieToggleBold()" id="ie-bold-btn" class="ie-toolbtn" style="padding:6px 12px;font-weight:800">B</button>' +
        '<button onclick="ieToggleItalic()" id="ie-italic-btn" class="ie-toolbtn" style="padding:6px 12px;font-style:italic">i</button>' +
        '<button onclick="ieTextRotate(-15)" class="ie-toolbtn" style="padding:6px 12px" title="Rotate left">⟲</button>' +
        '<span id="ie-textrot-val" style="font-size:12px;color:#e2e8f0;min-width:34px;text-align:center">0°</span>' +
        '<button onclick="ieTextRotate(15)" class="ie-toolbtn" style="padding:6px 12px" title="Rotate right">⟳</button>' +
        '<button onclick="ieDeleteActiveText()" class="ie-toolbtn" style="padding:6px 12px;color:#f87171">Delete Text</button>' +
        '<span style="font-size:11px;color:#64748b;flex-basis:100%">Tip: scroll your mouse wheel over the text to resize it</span>' +
      '</div>' +

      '<div class="ie-bar">' +
        '<button onclick="ieRotateCanvas()" class="ie-toolbtn">Rotate Image 90°</button>' +
        '<button onclick="ieEnhancePhoto()" class="ie-toolbtn" style="background:rgba(16,185,129,0.12);border-color:rgba(16,185,129,0.35);color:#10b981">Enhance Photo</button>' +
        '<button onclick="ieCleanScan()" class="ie-toolbtn" style="background:rgba(56,189,248,0.12);border-color:rgba(56,189,248,0.35);color:#38bdf8">Document B&amp;W</button>' +
        '<button onclick="ieUndo()" class="ie-toolbtn">Undo</button>' +
        '<button onclick="ieClear()" class="ie-toolbtn">Reset</button>' +
        '<button onclick="ieDownload()" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:8px;padding:10px 18px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font)">Download</button>' +
        '<button onclick="ieReset()" class="ie-toolbtn">New Image</button>' +
      '</div>' +

      '<div id="ie-stage" style="position:relative;display:inline-block;overflow:auto;max-width:100%;border:1px solid rgba(255,255,255,0.1);border-radius:12px;background:repeating-conic-gradient(#2a2a2a 0% 25%, #222 0% 50%) 50% / 24px 24px;margin-top:6px">' +
        '<canvas id="ie-canvas" style="display:block;max-width:100%;touch-action:none"></canvas>' +
        '<div id="ie-text-layer" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none"></div>' +
      '</div>' +
      '<p style="font-size:11px;color:#64748b;margin-top:10px">Add Text places a movable box — drag it anywhere, then style it. White Out now matches the background colour so it blends on any image. Eraser can be see-through or match the background colour. Download flattens everything into one image.</p>' +
    '</div>' +
    '</div>';

  ieBuildPalette();
  var sizeEl = document.getElementById('ie-size');
  if (sizeEl) sizeEl.oninput = function(){ document.getElementById('ie-size-val').textContent = this.value; };
  ieSetupDrop();
}

// Full global colour set + all common ones
var IE_COLORS = ['#000000','#434343','#666666','#999999','#b7b7b7','#cccccc','#ffffff',
  '#ff0000','#e11d48','#dc2626','#ea580c','#f59e0b','#eab308','#facc15',
  '#84cc16','#22c55e','#16a34a','#059669','#10b981','#14b8a6','#06b6d4',
  '#0ea5e9','#3b82f6','#2563eb','#4f46e5','#6366f1','#7c3aed','#8b5cf6',
  '#a855f7','#c026d3','#d946ef','#ec4899','#f43f5e','#78350f','#92400e','#1e3a8a'];

function ieBuildPalette() {
  var pal = document.getElementById('ie-palette');
  if (!pal) return;
  pal.innerHTML = IE_COLORS.map(function(c){
    return '<button onclick="ieSetColor(\'' + c + '\')" title="' + c + '" style="width:20px;height:20px;border-radius:4px;border:1.5px solid rgba(255,255,255,0.15);background:' + c + ';cursor:pointer;padding:0"></button>';
  }).join('');
}

function ieSetupDrop() {
  var drop = document.getElementById('ie-drop');
  if (!drop) return;
  drop.ondragover = function(e){ e.preventDefault(); drop.style.background = 'rgba(56,189,248,0.12)'; drop.style.borderColor = '#38bdf8'; };
  drop.ondragleave = function(e){ e.preventDefault(); drop.style.background = 'rgba(255,255,255,0.03)'; drop.style.borderColor = 'rgba(56,189,248,0.35)'; };
  drop.ondrop = function(e){
    e.preventDefault();
    drop.style.background = 'rgba(255,255,255,0.03)';
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      var input = document.getElementById('ie-file');
      input.files = e.dataTransfer.files;
      ieLoadImage(input);
    }
  };
}

function ieSetColor(c) {
  ieState.color = c;
  var picker = document.getElementById('ie-color');
  if (picker) picker.value = c;
  if (ieState.activeText) { ieState.activeText.el.style.color = c; ieState.activeText.color = c; }
  if (ieState.tool === 'erase' || ieState.tool === 'white') ieSetTool('brush');
}

function ieBtnStyle() {
  return 'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#e2e8f0;border-radius:8px;padding:10px 16px;font-size:13px;font-weight:600;cursor:pointer;font-family:var(--font)';
}

var ieState = { tool:'select', color:'#000000', drawing:false, ctx:null, canvas:null, history:[], lastX:0, lastY:0, startX:0, startY:0, snapshot:null, texts:[], activeText:null, bgColor:'#ffffff' };

function ieBlankCanvas() {
  var canvas = document.getElementById('ie-canvas');
  canvas.width = 900; canvas.height = 1200;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ieState.bgColor = '#ffffff';
  ieInit(canvas, ctx);
}

function ieLoadImage(input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var canvas = document.getElementById('ie-canvas');
      var maxDim = 1600;
      var w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
        else { w = Math.round(w * maxDim / h); h = maxDim; }
      }
      canvas.width = w; canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      // sample top-left pixel as background colour guess for the eraser
      try {
        var px = ctx.getImageData(2, 2, 1, 1).data;
        ieState.bgColor = 'rgb(' + px[0] + ',' + px[1] + ',' + px[2] + ')';
      } catch(err) { ieState.bgColor = '#ffffff'; }
      ieInit(canvas, ctx);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function ieInit(canvas, ctx) {
  ieInitDragHandlers();
  ieState.canvas = canvas;
  ieState.ctx = ctx;
  // BULLETPROOF wheel-resize: catch the wheel anywhere over a text box,
  // stop the page from scrolling, and resize the text instead.
  if (!window._ieWheelBound) {
    window._ieWheelBound = true;
    document.addEventListener('wheel', function(e){
      var boxEl = e.target && e.target.closest ? e.target.closest('.ie-textbox') : null;
      if (!boxEl) return;
      e.preventDefault();
      e.stopPropagation();
      var tObj = null;
      for (var i = 0; i < ieState.texts.length; i++) {
        if (ieState.texts[i].el === boxEl) { tObj = ieState.texts[i]; break; }
      }
      if (!tObj) return;
      ieSelectText(tObj);
      ieTextSize(e.deltaY < 0 ? 2 : -2);
    }, { passive: false, capture: true });
  }
  ieState.history = [];
  ieState.texts = [];
  ieState.activeText = null;
  var layer = document.getElementById('ie-text-layer');
  if (layer) layer.innerHTML = '';
  ieSaveHistory();
  document.getElementById('ie-start').style.display = 'none';
  document.getElementById('ie-workspace').style.display = 'block';
  ieBindEvents();
  ieSetTool('select');
}

function ieSetTool(tool) {
  ieState.tool = tool;
  ['select','brush','white','erase','line','rect','circle','fill'].forEach(function(t){
    var b = document.getElementById('ie-tool-' + t);
    if (b) {
      if (t === tool) { b.style.background = 'linear-gradient(135deg,#38bdf8,#6366f1)'; b.style.color = '#fff'; b.style.borderColor = 'transparent'; }
      else { b.style.background = 'rgba(255,255,255,0.06)'; b.style.color = '#e2e8f0'; b.style.borderColor = 'rgba(255,255,255,0.12)'; }
    }
  });
  var canvas = ieState.canvas;
  if (canvas) canvas.style.cursor = (tool === 'select') ? 'default' : 'crosshair';
  // text layer only receives clicks in select mode
  var layer = document.getElementById('ie-text-layer');
  if (layer) layer.style.pointerEvents = (tool === 'select') ? 'none' : 'none';
  if (tool === 'fill') ieFillCanvas();
}

function ieFillCanvas() {
  if (!ieState.ctx) return;
  var op = (parseInt(document.getElementById('ie-opacity').value) || 100) / 100;
  ieState.ctx.globalAlpha = op;
  ieState.ctx.fillStyle = ieState.color;
  ieState.ctx.fillRect(0, 0, ieState.canvas.width, ieState.canvas.height);
  ieState.ctx.globalAlpha = 1;
  ieState.bgColor = ieState.color;
  ieSaveHistory();
  ieSetTool('select');
}

// ---- Movable text boxes (like I Love PDF) ----
function ieAddText() {
  if (!ieState.ctx) { alert('Open an image first.'); return; }
  var txt = prompt('Type your text:');
  if (!txt) return;
  ieSetTool('select');
  var stage = document.getElementById('ie-stage');
  var layer = document.getElementById('ie-text-layer');
  var size = 28; // comfortable default; resize with A-/A+ or mouse wheel

  var box = document.createElement('div');
  box.className = 'ie-textbox';
  box.contentEditable = 'true';
  box.textContent = txt;
  box.style.cssText = 'position:absolute;left:30px;top:30px;color:' + ieState.color + ';font-size:' + size + 'px;font-family:Arial,sans-serif;cursor:move;pointer-events:auto;padding:2px 4px;border:1px dashed rgba(56,189,248,0.7);white-space:nowrap;min-width:20px;user-select:text';

  var textObj = { el:box, color:ieState.color, font:'Arial, sans-serif', size:size, bold:false, italic:false };
  layer.appendChild(box);
  ieState.texts.push(textObj);
  ieMakeDraggable(box, textObj);
  ieSelectText(textObj);
}

function ieMakeDraggable(box, textObj) {
  // Mouse wheel over the text = resize it (scroll up bigger, down smaller)
  box.addEventListener('wheel', function(e){
    e.preventDefault();
    e.stopPropagation();
    ieSelectText(textObj);
    var delta = e.deltaY < 0 ? 2 : -2;
    ieTextSize(delta);
  }, { passive: false });

  var dragging = false;
  function down(e) {
    if (e.target === box && box.isContentEditable && document.activeElement === box && e.type === 'mousedown') {
      // allow text editing clicks
    }
    ieSelectText(textObj);
    dragging = true;
    ieState._draggingBox = { box: box, ox: 0, oy: 0 };
    var pt = e.touches ? e.touches[0] : e;
    var rect = box.getBoundingClientRect();
    ieState._draggingBox.ox = pt.clientX - rect.left;
    ieState._draggingBox.oy = pt.clientY - rect.top;
    e.stopPropagation();
  }
  // Only attach the per-box start handlers here. The document-level move/up
  // handlers are attached ONCE globally (see ieInitDragHandlers) so they don't
  // stack up every time a text box is added.
  box.addEventListener('mousedown', down);
  box.addEventListener('touchstart', down);
}

function ieInitDragHandlers() {
  if (window._ieDragBound) return;
  window._ieDragBound = true;
  function move(e) {
    var db = ieState._draggingBox;
    if (!db) return;
    e.preventDefault();
    var pt = e.touches ? e.touches[0] : e;
    var stage = document.getElementById('ie-stage');
    if (!stage) return;
    var srect = stage.getBoundingClientRect();
    var x = pt.clientX - srect.left - db.ox + stage.scrollLeft;
    var y = pt.clientY - srect.top - db.oy + stage.scrollTop;
    db.box.style.left = Math.max(0, x) + 'px';
    db.box.style.top = Math.max(0, y) + 'px';
  }
  function up() { ieState._draggingBox = null; }
  document.addEventListener('mousemove', move);
  document.addEventListener('touchmove', move, { passive:false });
  document.addEventListener('mouseup', up);
  document.addEventListener('touchend', up);
}

function ieSelectText(textObj) {
  ieState.activeText = textObj;
  ieState.texts.forEach(function(t){ t.el.style.borderColor = 'rgba(56,189,248,0.3)'; });
  textObj.el.style.borderColor = 'rgba(56,189,248,0.9)';
  document.getElementById('ie-text-controls').style.display = 'flex';
  var fontSel = document.getElementById('ie-font');
  if (fontSel) fontSel.value = textObj.font;
  var sv = document.getElementById('ie-textsize-val');
  if (sv) sv.textContent = Math.round(textObj.size);
  var rv = document.getElementById('ie-textrot-val');
  if (rv) rv.textContent = (textObj.rotation || 0) + '°';
}

function ieTextSize(delta) {
  if (!ieState.activeText) return;
  var t = ieState.activeText;
  t.size = Math.max(8, Math.min(200, (t.size || 28) + delta));
  t.el.style.fontSize = t.size + 'px';
  var sv = document.getElementById('ie-textsize-val');
  if (sv) sv.textContent = Math.round(t.size);
}

function ieUpdateActiveText() {
  if (!ieState.activeText) return;
  var font = document.getElementById('ie-font').value;
  ieState.activeText.font = font;
  ieState.activeText.el.style.fontFamily = font;
}

function ieToggleBold() {
  if (!ieState.activeText) return;
  ieState.activeText.bold = !ieState.activeText.bold;
  ieState.activeText.el.style.fontWeight = ieState.activeText.bold ? '800' : 'normal';
  document.getElementById('ie-bold-btn').style.background = ieState.activeText.bold ? 'linear-gradient(135deg,#38bdf8,#6366f1)' : 'rgba(255,255,255,0.06)';
}

function ieToggleItalic() {
  if (!ieState.activeText) return;
  ieState.activeText.italic = !ieState.activeText.italic;
  ieState.activeText.el.style.fontStyle = ieState.activeText.italic ? 'italic' : 'normal';
  document.getElementById('ie-italic-btn').style.background = ieState.activeText.italic ? 'linear-gradient(135deg,#38bdf8,#6366f1)' : 'rgba(255,255,255,0.06)';
}

function ieDeleteActiveText() {
  if (!ieState.activeText) return;
  var idx = ieState.texts.indexOf(ieState.activeText);
  if (idx > -1) ieState.texts.splice(idx, 1);
  ieState.activeText.el.remove();
  ieState.activeText = null;
  document.getElementById('ie-text-controls').style.display = 'none';
}

function ieEnhancePhoto() {
  if (!ieState.canvas || !ieState.ctx) { alert('Open an image first.'); return; }
  var canvas = ieState.canvas, ctx = ieState.ctx;
  var w = canvas.width, h = canvas.height;
  var imgData;
  try { imgData = ctx.getImageData(0, 0, w, h); }
  catch(e) { alert('Could not read this image.'); return; }
  var d = imgData.data;

  var brightness = 6;
  var satBoost = 1.15;
  var contrast = 1.25; // gentle contrast, applied around mid-grey

  for (var i = 0; i < d.length; i += 4) {
    // Gentle contrast around 128 + brightness, per channel, but MILD so colour survives
    for (var c = 0; c < 3; c++) {
      var v = (d[i+c] - 128) * contrast + 128 + brightness;
      d[i+c] = v < 0 ? 0 : (v > 255 ? 255 : v);
    }
    // Saturation boost around the pixel's own luminance (keeps hue, richer colour)
    var lum = d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114;
    d[i]   = Math.max(0, Math.min(255, lum + (d[i]   - lum) * satBoost));
    d[i+1] = Math.max(0, Math.min(255, lum + (d[i+1] - lum) * satBoost));
    d[i+2] = Math.max(0, Math.min(255, lum + (d[i+2] - lum) * satBoost));
  }
  ctx.putImageData(imgData, 0, 0);
  ieSharpen(ctx, w, h);
  ieSaveHistory();
  ieScanNote('Photo enhanced — brighter, richer colour and sharper. Colour is kept. Tap again for more, or Undo to revert.');
}

function ieScanNote(msg) {
  var res = document.getElementById('ie-scan-note');
  if (!res) {
    res = document.createElement('p');
    res.id = 'ie-scan-note';
    res.style.cssText = 'font-size:12px;color:#10b981;margin-top:8px';
    var ws = document.getElementById('ie-workspace');
    if (ws) ws.appendChild(res);
  }
  res.textContent = msg;
}

function ieCleanScan() {
  if (!ieState.canvas || !ieState.ctx) { alert('Open an image first.'); return; }
  var canvas = ieState.canvas, ctx = ieState.ctx;
  var w = canvas.width, h = canvas.height;
  var imgData;
  try { imgData = ctx.getImageData(0, 0, w, h); }
  catch(e) { alert('Could not read this image to clean it.'); return; }
  var d = imgData.data;

  // Pass 1: collect luminance values to find percentiles (paper vs ink).
  var lumArr = new Float32Array(d.length / 4);
  var li = 0;
  for (var i = 0; i < d.length; i += 4) {
    lumArr[li++] = d[i] * 0.299 + d[i+1] * 0.587 + d[i+2] * 0.114;
  }
  // Sort a sampled copy to get percentiles cheaply on big images
  var sample = [];
  var step = Math.max(1, Math.floor(lumArr.length / 20000));
  for (var k = 0; k < lumArr.length; k += step) sample.push(lumArr[k]);
  sample.sort(function(a, b){ return a - b; });
  function pct(p){ return sample[Math.min(sample.length - 1, Math.floor(p * sample.length))]; }
  var p20 = pct(0.20), p60 = pct(0.60);

  // Paper is the bright majority; push it to white. Ink is the dark fifth.
  var whitePoint = p60 * 0.92;
  var blackPoint = p20;
  var range = Math.max(1, whitePoint - blackPoint);

  // Pass 2: whiten background (even under uneven lighting), deepen text.
  for (var j = 0; j < d.length; j += 4) {
    var lum = d[j] * 0.299 + d[j+1] * 0.587 + d[j+2] * 0.114;
    var out;
    if (lum >= whitePoint) {
      out = 255;
    } else if (lum <= blackPoint) {
      out = 0;
    } else {
      var norm = (lum - blackPoint) / range;
      norm = Math.pow(norm, 1.5);
      out = Math.round(norm * 255);
    }
    d[j] = out; d[j+1] = out; d[j+2] = out;
  }
  ctx.putImageData(imgData, 0, 0);

  // Light sharpen pass for text edges using a convolution
  ieSharpen(ctx, w, h);

  ieSaveHistory();
  ieScanNote('Document cleaned to black & white — background whitened, text sharpened. This mode is for paper documents. For colour photos, use Enhance Photo instead. Undo to revert.');
}

function ieSharpen(ctx, w, h) {
  try {
    var src = ctx.getImageData(0, 0, w, h);
    var out = ctx.createImageData(w, h);
    var s = src.data, o = out.data;
    // Mild sharpen kernel
    var k = [0, -0.4, 0, -0.4, 2.6, -0.4, 0, -0.4, 0];
    for (var y = 1; y < h - 1; y++) {
      for (var x = 1; x < w - 1; x++) {
        for (var c = 0; c < 3; c++) {
          var idx = (y * w + x) * 4 + c;
          var acc = 0, ki = 0;
          for (var dy = -1; dy <= 1; dy++) {
            for (var dx = -1; dx <= 1; dx++) {
              acc += s[((y+dy) * w + (x+dx)) * 4 + c] * k[ki++];
            }
          }
          o[idx] = acc < 0 ? 0 : (acc > 255 ? 255 : acc);
        }
        o[(y * w + x) * 4 + 3] = 255;
      }
    }
    // copy edges unchanged
    ctx.putImageData(out, 0, 0);
  } catch(e) { /* sharpen is optional; ignore if it fails */ }
}

function ieRotateCanvas() {
  if (!ieState.canvas || !ieState.ctx) return;
  var c = ieState.canvas;
  var tmp = document.createElement('canvas');
  tmp.width = c.height; tmp.height = c.width;
  var tctx = tmp.getContext('2d');
  tctx.translate(tmp.width / 2, tmp.height / 2);
  tctx.rotate(Math.PI / 2);
  tctx.drawImage(c, -c.width / 2, -c.height / 2);
  // Swap the real canvas dimensions and paint the rotated result
  c.width = tmp.width; c.height = tmp.height;
  ieState.ctx.drawImage(tmp, 0, 0);
  // Old history snapshots have the wrong dimensions - start fresh from here
  ieState.history = [];
  ieSaveHistory();
}

function ieTextRotate(delta) {
  if (!ieState.activeText) { alert('Tap a text first, then rotate it.'); return; }
  var t = ieState.activeText;
  t.rotation = ((t.rotation || 0) + delta) % 360;
  t.el.style.transform = 'rotate(' + t.rotation + 'deg)';
  var rv = document.getElementById('ie-textrot-val');
  if (rv) rv.textContent = t.rotation + '°';
}

function ieSaveHistory() {
  if (!ieState.ctx) return;
  try {
    if (ieState.history.length > 12) ieState.history.shift();
    ieState.history.push(ieState.ctx.getImageData(0, 0, ieState.canvas.width, ieState.canvas.height));
  } catch(e) {}
}

function ieUndo() {
  if (ieState.history.length > 1) {
    ieState.history.pop();
    ieState.ctx.putImageData(ieState.history[ieState.history.length - 1], 0, 0);
  }
}

function ieClear() {
  if (ieState.history.length > 0) {
    ieState.ctx.putImageData(ieState.history[0], 0, 0);
    ieState.history = [ieState.history[0]];
  }
  document.getElementById('ie-text-layer').innerHTML = '';
  ieState.texts = [];
  ieState.activeText = null;
  document.getElementById('ie-text-controls').style.display = 'none';
}

function ieReset() {
  document.getElementById('ie-start').style.display = 'block';
  document.getElementById('ie-workspace').style.display = 'none';
  document.getElementById('ie-file').value = '';
  document.getElementById('ie-text-layer').innerHTML = '';
  ieState.texts = [];
  ieState.activeText = null;
}

function ieGetPos(e) {
  var canvas = ieState.canvas;
  var rect = canvas.getBoundingClientRect();
  var scaleX = canvas.width / rect.width;
  var scaleY = canvas.height / rect.height;
  var clientX = e.touches ? e.touches[0].clientX : e.clientX;
  var clientY = e.touches ? e.touches[0].clientY : e.clientY;
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

function ieBindEvents() {
  var canvas = ieState.canvas;
  function start(e) {
    if (ieState.tool === 'select') return; // select mode = text dragging only
    e.preventDefault();
    ieState.drawing = true;
    var p = ieGetPos(e);
    ieState.lastX = p.x; ieState.lastY = p.y;
    ieState.startX = p.x; ieState.startY = p.y;
    if (ieState.tool === 'line' || ieState.tool === 'rect' || ieState.tool === 'circle') {
      ieState.snapshot = ieState.ctx.getImageData(0, 0, canvas.width, canvas.height);
    } else {
      ieDraw(e);
    }
  }
  function move(e) {
    if (!ieState.drawing) return;
    e.preventDefault();
    if (ieState.tool === 'line' || ieState.tool === 'rect' || ieState.tool === 'circle') ieDrawShape(e);
    else ieDraw(e);
  }
  function end() { if (ieState.drawing) { ieState.drawing = false; ieState.snapshot = null; ieSaveHistory(); } }
  canvas.onmousedown = start; canvas.onmousemove = move; canvas.onmouseup = end; canvas.onmouseleave = end;
  canvas.ontouchstart = start; canvas.ontouchmove = move; canvas.ontouchend = end;
}

function ieSampleBg() {
  // Sample a small patch a little away from the current stroke point to find
  // the surrounding background colour, so White Paint blends into it.
  try {
    var ctx = ieState.ctx;
    var x = Math.round(ieState.lastX), y = Math.round(ieState.lastY);
    var size = parseInt(document.getElementById('ie-size').value) || 8;
    var off = size + 6;
    var pts = [[x - off, y], [x + off, y], [x, y - off], [x, y + off]];
    var rs = 0, gs = 0, bs = 0, n = 0;
    for (var i = 0; i < pts.length; i++) {
      var px = pts[i][0], py = pts[i][1];
      if (px < 0 || py < 0 || px >= ieState.canvas.width || py >= ieState.canvas.height) continue;
      var dd = ctx.getImageData(px, py, 1, 1).data;
      rs += dd[0]; gs += dd[1]; bs += dd[2]; n++;
    }
    if (n === 0) return ieState.bgColor || '#ffffff';
    return 'rgb(' + Math.round(rs/n) + ',' + Math.round(gs/n) + ',' + Math.round(bs/n) + ')';
  } catch(e) { return ieState.bgColor || '#ffffff'; }
}

function ieApplyStroke(ctx) {
  var size = parseInt(document.getElementById('ie-size').value) || 8;
  var op = (parseInt(document.getElementById('ie-opacity').value) || 100) / 100;
  ctx.lineWidth = size; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = op;
  if (ieState.tool === 'erase') {
    var mode = document.getElementById('ie-erase-mode').value;
    if (mode === 'match') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = ieState.bgColor;
      ctx.fillStyle = ieState.bgColor;
    } else {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    }
  } else if (ieState.tool === 'white') {
    ctx.globalCompositeOperation = 'source-over';
    // "Smart cover": sample the background colour near the stroke so it blends
    // on ANY coloured image (like a real white-out that matches the paper/theme),
    // not just pure white. Falls back to white if sampling fails.
    var coverColor = ieSampleBg();
    ctx.strokeStyle = coverColor; ctx.fillStyle = coverColor;
  } else {
    ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = ieState.color; ctx.fillStyle = ieState.color;
  }
}

function ieDraw(e) {
  var ctx = ieState.ctx;
  var p = ieGetPos(e);
  ieApplyStroke(ctx);
  ctx.beginPath();
  ctx.moveTo(ieState.lastX, ieState.lastY);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ieState.lastX = p.x; ieState.lastY = p.y;
}

function ieDrawShape(e) {
  var ctx = ieState.ctx;
  var p = ieGetPos(e);
  ctx.putImageData(ieState.snapshot, 0, 0);
  ieApplyStroke(ctx);
  if (ieState.tool === 'line') {
    ctx.beginPath(); ctx.moveTo(ieState.startX, ieState.startY); ctx.lineTo(p.x, p.y); ctx.stroke();
  } else if (ieState.tool === 'rect') {
    ctx.strokeRect(ieState.startX, ieState.startY, p.x - ieState.startX, p.y - ieState.startY);
  } else if (ieState.tool === 'circle') {
    var rx = Math.abs(p.x - ieState.startX) / 2, ry = Math.abs(p.y - ieState.startY) / 2;
    var cx = (p.x + ieState.startX) / 2, cy = (p.y + ieState.startY) / 2;
    ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function ieDownload() {
  if (!requirePaidAction('download your image')) return;
  if (!ieState.canvas) return;
  // Flatten text boxes onto the canvas
  var canvas = ieState.canvas;
  var ctx = ieState.ctx;
  var stage = document.getElementById('ie-stage');
  var srect = document.getElementById('ie-canvas').getBoundingClientRect();
  var scaleX = canvas.width / srect.width;
  var scaleY = canvas.height / srect.height;

  ieState.texts.forEach(function(t){
    // Use layout position (style.left/top) and layout size (offsetWidth/Height),
    // which are NOT affected by rotation - then rotate around the box centre,
    // exactly matching how CSS transform:rotate displays it on screen.
    var left = parseFloat(t.el.style.left) || 0;
    var top = parseFloat(t.el.style.top) || 0;
    var cx = (left + t.el.offsetWidth / 2) * scaleX;
    var cy = (top + t.el.offsetHeight / 2) * scaleY;
    var fontSize = (t.size || parseFloat(t.el.style.fontSize) || 28) * scaleY;
    var weight = t.bold ? 'bold ' : '';
    var italic = t.italic ? 'italic ' : '';
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(((t.rotation || 0) * Math.PI) / 180);
    ctx.fillStyle = t.color;
    ctx.font = italic + weight + fontSize + 'px ' + t.font;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t.el.textContent, 0, 0);
    ctx.restore();
  });

  var url = canvas.toDataURL('image/png');
  var a = document.createElement('a');
  a.href = url;
  a.download = 'edited-image.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Re-save so text isn't doubled if they keep editing
  ieSaveHistory();
}


function renderCompressor(el) {
  el.innerHTML =
    '<div class="tool-screen">' +
    '<h2>File Compressor</h2>' +
    '<p style="color:var(--muted);font-size:14px;margin-bottom:4px">Make your images, audio and short videos smaller — right on your device.</p>' +
    '<p style="font-size:12px;color:#38bdf8;margin-bottom:20px;font-style:italic">Private & secure. Your files never leave your device.</p>' +
    '<div class="pdf-tabs" style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap">' +
    '<div class="tab active" onclick="compTab(\'image\',this)">Image</div>' +
    '<div class="tab" onclick="compTab(\'audio\',this)">Audio</div>' +
    '<div class="tab" onclick="compTab(\'video\',this)">Video</div>' +
    '</div>' +
    '<div id="comp-body"></div>' +
    '</div>';
  compTab('image', document.querySelector('.pdf-tabs .tab'));
}

function compTab(type, elem) {
  document.querySelectorAll('#tool-page-body .tab').forEach(function(t){ t.classList.remove('active'); });
  if (elem) elem.classList.add('active');
  var body = document.getElementById('comp-body');

  if (type === 'image') {
    body.innerHTML =
      '<div style="background:rgba(255,255,255,0.03);border:1px dashed rgba(255,255,255,0.15);border-radius:14px;padding:24px;text-align:center;margin-bottom:16px">' +
      '<p style="color:#fff;font-weight:600;margin-bottom:6px">Compress an Image</p>' +
      '<p style="color:var(--muted);font-size:12px;margin-bottom:14px">JPG or PNG. Makes photos smaller for WhatsApp, email, uploads.</p>' +
      '<input type="file" id="comp-img-input" accept="image/*" onchange="handleImageCompress()" style="display:none">' +
      '<button class="btn-primary" onclick="document.getElementById(\'comp-img-input\').click()">Choose Image</button>' +
      '</div>' +
      '<div class="form-group"><label>Quality: <span id="comp-q-val">70%</span> (lower = smaller file)</label>' +
      '<input type="range" id="comp-quality" min="20" max="95" value="70" oninput="document.getElementById(\'comp-q-val\').textContent=this.value+\'%\'" style="width:100%"></div>' +
      '<div id="comp-img-result"></div>';
  } else if (type === 'audio') {
    body.innerHTML =
      '<div style="background:rgba(255,255,255,0.03);border:1px dashed rgba(255,255,255,0.15);border-radius:14px;padding:24px;text-align:center;margin-bottom:16px">' +
      '<p style="color:#fff;font-weight:600;margin-bottom:6px">Compress Audio</p>' +
      '<p style="color:var(--muted);font-size:12px;margin-bottom:14px">Up to 20MB. Reduces audio file size (MP3, WAV, M4A).</p>' +
      '<input type="file" id="comp-audio-input" accept="audio/*" onchange="handleAudioCompress()" style="display:none">' +
      '<button class="btn-primary" onclick="document.getElementById(\'comp-audio-input\').click()">Choose Audio File</button>' +
      '</div>' +
      '<div id="comp-audio-result"></div>';
  } else {
    body.innerHTML =
      '<div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:12px;padding:14px 16px;margin-bottom:16px">' +
      '<p style="font-size:13px;color:#10b981;font-weight:600;margin-bottom:4px">Compressed on our secure server — nothing freezes on your device</p>' +
      '<p style="font-size:12px;color:var(--muted);line-height:1.6">Works for videos up to 250MB and several minutes long. Larger or longer videos may take a minute or two to process.</p>' +
      '</div>' +
      '<div class="form-group"><label>Target file size</label>' +
      '<select id="comp-video-target" style="width:100%;box-sizing:border-box">' +
      '<option value="5">5 MB (smaller, lower quality)</option>' +
      '<option value="10" selected>10 MB (good balance)</option>' +
      '<option value="20">20 MB (better quality)</option>' +
      '<option value="50">50 MB (best quality)</option>' +
      '</select></div>' +
      '<div style="background:rgba(255,255,255,0.03);border:1px dashed rgba(255,255,255,0.15);border-radius:14px;padding:24px;text-align:center;margin-bottom:16px">' +
      '<p style="color:#fff;font-weight:600;margin-bottom:6px">Compress a Video</p>' +
      '<p style="color:var(--muted);font-size:12px;margin-bottom:14px">MP4, MOV and most video formats. Up to 250MB.</p>' +
      '<input type="file" id="comp-video-input" accept="video/*" onchange="handleVideoCompress()" style="display:none">' +
      '<button class="btn-primary" onclick="document.getElementById(\'comp-video-input\').click()">Choose Video</button>' +
      '</div>' +
      '<div id="comp-video-result"></div>';
  }
}

function fmtSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes/1024).toFixed(1) + ' KB';
  return (bytes/1048576).toFixed(2) + ' MB';
}

function handleImageCompress() {
  if (!requirePaidAction('compress and download')) return;
  var input = document.getElementById('comp-img-input');
  var file = input.files[0];
  if (!file) return;
  var result = document.getElementById('comp-img-result');
  result.innerHTML = '<p style="color:var(--muted);text-align:center;padding:20px">Compressing...</p>';
  var quality = parseInt(document.getElementById('comp-quality').value) / 100;
  var origSize = file.size;

  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var canvas = document.createElement('canvas');
      // Optionally scale down very large images
      var maxDim = 1920;
      var w = img.width, h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
        else { w = Math.round(w * maxDim / h); h = maxDim; }
      }
      canvas.width = w; canvas.height = h;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(function(blob) {
        if (!blob) { result.innerHTML = '<p style="color:#f87171;text-align:center">Could not compress this image.</p>'; return; }
        var newSize = blob.size;
        var saved = Math.max(0, Math.round((1 - newSize/origSize) * 100));
        var url = URL.createObjectURL(blob);
        var fname = (file.name.replace(/\.[^.]+$/, '') || 'image') + '-compressed.jpg';
        result.innerHTML =
          '<div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.3);border-radius:14px;padding:18px;text-align:center">' +
          '<p style="color:#10b981;font-weight:700;font-size:15px;margin-bottom:10px">Done! Saved ' + saved + '%</p>' +
          '<p style="font-size:13px;color:var(--muted);margin-bottom:4px">Original: ' + fmtSize(origSize) + '</p>' +
          '<p style="font-size:13px;color:#fff;margin-bottom:14px">Compressed: ' + fmtSize(newSize) + '</p>' +
          '<a href="' + url + '" download="' + fname + '" class="btn-primary" style="text-decoration:none;display:inline-block">Download Compressed Image</a>' +
          '</div>';
      }, 'image/jpeg', quality);
    };
    img.onerror = function(){ result.innerHTML = '<p style="color:#f87171;text-align:center">Could not read this image.</p>'; };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function handleAudioCompress() {
  if (!requirePaidAction('compress and download')) return;
  var input = document.getElementById('comp-audio-input');
  var file = input.files[0];
  if (!file) return;
  var result = document.getElementById('comp-audio-result');
  if (file.size > 20 * 1048576) {
    result.innerHTML = '<div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:16px;text-align:center"><p style="color:#f87171;font-weight:600">File too large (' + fmtSize(file.size) + ')</p><p style="color:var(--muted);font-size:12px;margin-top:6px">Please choose an audio file under 20MB.</p></div>';
    return;
  }
  result.innerHTML = '<p style="color:var(--muted);text-align:center;padding:20px">Processing audio...</p>';

  var reader = new FileReader();
  reader.onload = function(e) {
    var AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) { result.innerHTML = '<p style="color:#f87171;text-align:center">Your browser does not support audio processing.</p>'; return; }
    var actx = new AudioCtx();
    actx.decodeAudioData(e.target.result.slice(0), function(buffer) {
      // Downsample to mono 22050Hz to reduce size
      var targetRate = 22050;
      var length = Math.round(buffer.duration * targetRate);
      var offline = new OfflineAudioContext(1, length, targetRate);
      var src = offline.createBufferSource();
      src.buffer = buffer;
      src.connect(offline.destination);
      src.start();
      offline.startRendering().then(function(rendered) {
        var wav = audioBufferToWav(rendered);
        var blob = new Blob([wav], { type: 'audio/wav' });
        var origSize = file.size, newSize = blob.size;
        var saved = Math.max(0, Math.round((1 - newSize/origSize) * 100));
        var url = URL.createObjectURL(blob);
        var fname = (file.name.replace(/\.[^.]+$/, '') || 'audio') + '-compressed.wav';
        result.innerHTML =
          '<div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.3);border-radius:14px;padding:18px;text-align:center">' +
          '<p style="color:#10b981;font-weight:700;font-size:15px;margin-bottom:10px">' + (saved > 0 ? 'Done! Saved ' + saved + '%' : 'Processed') + '</p>' +
          '<p style="font-size:13px;color:var(--muted);margin-bottom:4px">Original: ' + fmtSize(origSize) + '</p>' +
          '<p style="font-size:13px;color:#fff;margin-bottom:14px">Compressed: ' + fmtSize(newSize) + '</p>' +
          '<a href="' + url + '" download="' + fname + '" class="btn-primary" style="text-decoration:none;display:inline-block">Download Compressed Audio</a>' +
          '</div>';
      });
    }, function(){ result.innerHTML = '<p style="color:#f87171;text-align:center">Could not process this audio file.</p>'; });
  };
  reader.readAsArrayBuffer(file);
}

function audioBufferToWav(buffer) {
  var numCh = buffer.numberOfChannels, len = buffer.length * numCh * 2 + 44;
  var out = new DataView(new ArrayBuffer(len));
  var ch = [], offset = 0, pos = 0;
  function setStr(s){ for(var i=0;i<s.length;i++) out.setUint8(pos++, s.charCodeAt(i)); }
  function set16(d){ out.setUint16(pos, d, true); pos += 2; }
  function set32(d){ out.setUint32(pos, d, true); pos += 4; }
  setStr('RIFF'); set32(len-8); setStr('WAVE'); setStr('fmt '); set32(16); set16(1); set16(numCh);
  set32(buffer.sampleRate); set32(buffer.sampleRate*2*numCh); set16(numCh*2); set16(16); setStr('data'); set32(len-44-8);
  for (var i=0;i<numCh;i++) ch.push(buffer.getChannelData(i));
  while (offset < buffer.length) {
    for (var c=0;c<numCh;c++) {
      var s = Math.max(-1, Math.min(1, ch[c][offset]));
      out.setInt16(pos, s<0 ? s*0x8000 : s*0x7FFF, true); pos += 2;
    }
    offset++;
  }
  return out.buffer;
}

function handleVideoCompress() {
  if (!requirePaidAction('compress and download')) return;
  var input = document.getElementById('comp-video-input');
  var file = input.files[0];
  if (!file) return;
  var result = document.getElementById('comp-video-result');

  if (file.size > 250 * 1048576) {
    result.innerHTML = '<div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:16px;text-align:center"><p style="color:#f87171;font-weight:600">Video too large (' + fmtSize(file.size) + ')</p><p style="color:var(--muted);font-size:12px;margin-top:6px">Please choose a video under 250MB.</p></div>';
    return;
  }

  var targetMB = (document.getElementById('comp-video-target') || {value:'10'}).value;

  result.innerHTML =
    '<div style="text-align:center;padding:20px">' +
    '<div style="display:inline-block;width:32px;height:32px;border:3px solid rgba(56,189,248,0.2);border-top-color:#38bdf8;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:14px"></div>' +
    '<p style="color:var(--muted)">Compressing your video on our server... this can take a minute or two for longer clips. Please keep this page open.</p>' +
    '</div>';

  var formData = new FormData();
  formData.append('video', file);
  formData.append('targetMB', targetMB);

  var origSize = file.size;

  fetch(BACKEND_URL + '/api/compress-video', {
    method: 'POST',
    body: formData
  })
  .then(function(r) {
    if (!r.ok) { return r.json().then(function(d){ throw new Error(d.error || 'Compression failed'); }); }
    return r.blob();
  })
  .then(function(blob) {
    var newSize = blob.size;
    var saved = Math.max(0, Math.round((1 - newSize/origSize) * 100));
    var url = URL.createObjectURL(blob);
    var fname = (file.name.replace(/\.[^.]+$/, '') || 'video') + '-compressed.mp4';
    result.innerHTML =
      '<div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.3);border-radius:14px;padding:18px;text-align:center">' +
      '<p style="color:#10b981;font-weight:700;font-size:15px;margin-bottom:10px">' + (saved > 0 ? 'Done! Saved ' + saved + '%' : 'Compressed') + '</p>' +
      '<p style="font-size:13px;color:var(--muted);margin-bottom:4px">Original: ' + fmtSize(origSize) + '</p>' +
      '<p style="font-size:13px;color:#fff;margin-bottom:14px">Compressed: ' + fmtSize(newSize) + ' (.mp4)</p>' +
      '<a href="' + url + '" download="' + fname + '" class="btn-primary" style="text-decoration:none;display:inline-block">Download Compressed Video</a>' +
      '</div>';
  })
  .catch(function(err) {
    result.innerHTML = '<div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:16px;text-align:center"><p style="color:#f87171;font-weight:600">Could not compress this video</p><p style="color:var(--muted);font-size:12px;margin-top:6px">' + (err.message || 'Please try again or use a different file.') + '</p></div>';
  });
}

function renderPDFTools(el) {
  el.innerHTML =
    '<div class="tool-screen">' +
    '<h2>PDF Tools</h2>' +
    '<p style="color:var(--muted);font-size:14px;margin-bottom:4px">Convert your files to PDF instantly — right in your browser.</p>' +
    '<p style="font-size:12px;color:#38bdf8;margin-bottom:20px;font-style:italic">Fast, private and secure. Your files never leave your device.</p>' +

    '<div class="tab-bar">' +
    '<div class="tab active" onclick="pdfTab(\'csv\',this)">CSV / Excel to PDF</div>' +
    '<div class="tab" onclick="pdfTab(\'image\',this)">Images to PDF</div>' +
    '<div class="tab" onclick="pdfTab(\'text\',this)">Text to PDF</div>' +
    '<div class="tab" onclick="pdfTab(\'book\',this)">eBook Manuscript</div>' +
    '</div>' +

    // CSV/Excel to PDF
    '<div id="pdf-csv">' +
    '<div class="cv-sec-title">Convert CSV or Excel to PDF</div>' +
    '<p style="font-size:13px;color:var(--muted);margin-bottom:14px">Upload a .csv or .xlsx file and we turn it into a clean, printable PDF table.</p>' +
    '<div style="border:2px dashed rgba(56,189,248,0.3);border-radius:12px;padding:30px;text-align:center;margin-bottom:16px">' +
    '<input type="file" id="csv-file" accept=".csv,.xlsx,.xls" onchange="handleCSVFile(this)" style="display:none">' +
    '<div style="font-size:40px;margin-bottom:10px"></div>' +
    '<button class="btn-primary" onclick="document.getElementById(\'csv-file\').click()">Choose CSV / Excel File</button>' +
    '<p id="csv-filename" style="font-size:12px;color:#38bdf8;margin-top:10px"></p>' +
    '</div>' +
    '<div id="csv-result"></div>' +
    '</div>' +

    // Images to PDF
    '<div id="pdf-image" style="display:none">' +
    '<div class="cv-sec-title">Convert Images to PDF</div>' +
    '<p style="font-size:13px;color:var(--muted);margin-bottom:14px">Upload one or more photos (JPG/PNG) and we combine them into a single PDF.</p>' +
    '<div style="border:2px dashed rgba(56,189,248,0.3);border-radius:12px;padding:30px;text-align:center;margin-bottom:16px">' +
    '<input type="file" id="img-file" accept="image/*" multiple onchange="handleImageFiles(this)" style="display:none">' +
    '<div style="font-size:40px;margin-bottom:10px"></div>' +
    '<button class="btn-primary" onclick="document.getElementById(\'img-file\').click()">Choose Images</button>' +
    '<p id="img-filename" style="font-size:12px;color:#38bdf8;margin-top:10px"></p>' +
    '</div>' +
    '<div id="img-result"></div>' +
    '</div>' +

    // Text to PDF
    '<div id="pdf-book" style="display:none">' +
    '<div class="cv-sec-title">eBook / Print Manuscript Formatter</div>' +
    '<p style="font-size:12px;color:var(--muted);margin-bottom:14px;line-height:1.6">Turn your writing into a print-ready book PDF for Amazon KDP and other platforms — title page, copyright page, chapters, page numbers and correct book size, all done for you.</p>' +
    '<div class="form-group"><label>Book title</label><input type="text" id="bk-title" placeholder="e.g. Start Your Business in South Africa"></div>' +
    '<div class="form-group"><label>Subtitle (optional)</label><input type="text" id="bk-subtitle" placeholder="e.g. A practical guide for first-time entrepreneurs"></div>' +
    '<div class="form-group"><label>Author name</label><input type="text" id="bk-author" placeholder="e.g. Wongalethu Mkapu"></div>' +
    '<div class="form-group"><label>Book size (trim)</label><select id="bk-trim" style="width:100%;box-sizing:border-box">' +
    '<option value="6x9" selected>6" × 9" — most popular on Amazon KDP</option>' +
    '<option value="5x8">5" × 8" — compact paperback</option>' +
    '<option value="a5">A5 — common in South Africa</option>' +
    '</select></div>' +
    '<div class="form-group"><label>Your manuscript</label>' +
    '<p style="font-size:11px;color:#38bdf8;margin-bottom:6px">Start each chapter on a line beginning with # — for example:<br><span style="color:var(--muted)"># Chapter 1: The Idea</span></p>' +
    '<textarea id="bk-text" rows="12" placeholder="# Chapter 1: The Idea\nIt all started when...\n\n# Chapter 2: The First Sale\nThe next morning..." style="width:100%;box-sizing:border-box"></textarea></div>' +
    '<button class="btn-primary" style="width:100%;box-sizing:border-box" onclick="formatManuscript()">Create My Book PDF</button>' +
    '<div id="bk-result" style="margin-top:12px"></div>' +
    '</div>' +

    '<div id="pdf-text" style="display:none">' +
    '<div class="cv-sec-title">Convert Text to PDF</div>' +
    '<p style="font-size:13px;color:var(--muted);margin-bottom:14px">Type or paste your text and download it as a clean PDF document.</p>' +
    '<div class="form-group"><label>Document Title</label><input type="text" id="txt-title" placeholder="e.g. My Notes"></div>' +
    '<div class="form-group"><label>Your Text</label><textarea id="txt-body" rows="10" placeholder="Type or paste your text here..."></textarea></div>' +
    '<button class="btn-primary" style="width:100%;box-sizing:border-box" onclick="textToPDF()">Convert to PDF</button>' +
    '</div>' +

    '<div style="background:rgba(139,92,246,0.06);border-radius:12px;padding:14px;margin-top:20px">' +
    '<p style="font-size:12px;color:#c4b5fd;margin:0;line-height:1.6"><strong>100% Private:</strong> All conversions happen on your device. Your files are never uploaded to any server.</p>' +
    '</div>' +
    '</div>';
}

// ═══════════ INK WIPER TOOL ═══════════
function formatManuscript() {
  if (!requirePaidAction('format your manuscript')) return;
  var title = (document.getElementById('bk-title').value || '').trim();
  var subtitle = (document.getElementById('bk-subtitle').value || '').trim();
  var author = (document.getElementById('bk-author').value || '').trim();
  var trim = document.getElementById('bk-trim').value;
  var text = (document.getElementById('bk-text').value || '').trim();
  var result = document.getElementById('bk-result');

  if (!title || !author || !text) {
    result.innerHTML = '<p style="color:#f87171;font-size:13px;text-align:center">Please fill in the title, author and your manuscript text.</p>';
    return;
  }
  var jsPDFLib = (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : null;
  if (!jsPDFLib) { result.innerHTML = '<p style="color:#f87171;font-size:13px;text-align:center">PDF engine is still loading — try again in a few seconds.</p>'; return; }

  // Page sizes in inches
  var sizes = { '6x9': [6, 9], '5x8': [5, 8], 'a5': [5.83, 8.27] };
  var pw = sizes[trim][0], ph = sizes[trim][1];
  // KDP-style margins: bigger inner (gutter) margin for binding
  var mTop = 0.75, mBottom = 0.75, mOuter = 0.6, mInner = 0.85;

  var doc = new jsPDFLib({ unit: 'in', format: [pw, ph] });

  // ---- Title page ----
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  var titleLines = doc.splitTextToSize(title, pw - 1.6);
  var ty = ph * 0.32;
  titleLines.forEach(function(ln){ doc.text(ln, pw / 2, ty, { align: 'center' }); ty += 0.42; });
  if (subtitle) {
    doc.setFont('times', 'italic');
    doc.setFontSize(13);
    var subLines = doc.splitTextToSize(subtitle, pw - 1.8);
    ty += 0.15;
    subLines.forEach(function(ln){ doc.text(ln, pw / 2, ty, { align: 'center' }); ty += 0.24; });
  }
  doc.setFont('times', 'normal');
  doc.setFontSize(14);
  doc.text(author, pw / 2, ph * 0.72, { align: 'center' });

  // ---- Copyright page ----
  doc.addPage();
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  var year = new Date().getFullYear();
  var cpy = ['Copyright © ' + year + ' ' + author,
             'All rights reserved.',
             '',
             'No part of this book may be reproduced in any form',
             'without written permission from the author.'];
  var cy = ph - mBottom - 1.2;
  cpy.forEach(function(ln){ doc.text(ln, pw / 2, cy, { align: 'center' }); cy += 0.18; });

  // ---- Chapters ----
  var lines = text.split(/\r?\n/);
  var chapters = [];
  var current = null;
  lines.forEach(function(ln){
    if (ln.trim().indexOf('#') === 0) {
      if (current) chapters.push(current);
      current = { heading: ln.replace(/^#+\s*/, '').trim(), body: [] };
    } else {
      if (!current) current = { heading: '', body: [] };
      current.body.push(ln);
    }
  });
  if (current) chapters.push(current);

  var bodySize = 11, lineH = 0.19;
  var textW; // differs by page side (mirrored margins)
  var pageNum = 1; // body page counter starts after front matter

  chapters.forEach(function(ch){
    doc.addPage();
    var pageIsOdd = (doc.internal.getNumberOfPages() % 2) === 1;
    var mLeft = pageIsOdd ? mInner : mOuter;
    var mRight = pageIsOdd ? mOuter : mInner;
    textW = pw - mLeft - mRight;
    var y = mTop + 0.9;

    if (ch.heading) {
      doc.setFont('times', 'bold');
      doc.setFontSize(17);
      var hLines = doc.splitTextToSize(ch.heading, textW);
      hLines.forEach(function(hl){ doc.text(hl, pw / 2, y, { align: 'center' }); y += 0.3; });
      y += 0.25;
    }

    doc.setFont('times', 'normal');
    doc.setFontSize(bodySize);
    var paragraphs = ch.body.join('\n').split(/\n\s*\n/);
    paragraphs.forEach(function(para){
      para = para.replace(/\n/g, ' ').trim();
      if (!para) return;
      var pLines = doc.splitTextToSize(para, textW);
      pLines.forEach(function(pl){
        if (y > ph - mBottom - 0.25) {
          doc.addPage();
          var odd = (doc.internal.getNumberOfPages() % 2) === 1;
          mLeft = odd ? mInner : mOuter;
          mRight = odd ? mOuter : mInner;
          textW = pw - mLeft - mRight;
          y = mTop;
        }
        doc.text(pl, mLeft, y);
        y += lineH;
      });
      y += lineH * 0.6; // paragraph gap
    });
  });

  // ---- Page numbers (skip title + copyright) ----
  var total = doc.internal.getNumberOfPages();
  for (var p = 3; p <= total; p++) {
    doc.setPage(p);
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.text(String(p - 2), pw / 2, ph - 0.4, { align: 'center' });
  }

  var fname = title.replace(/[^a-z0-9]+/gi, '_') + '_manuscript.pdf';
  doc.save(fname);
  result.innerHTML =
    '<div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.3);border-radius:14px;padding:16px;text-align:center">' +
    '<p style="color:#10b981;font-weight:700;font-size:14px;margin-bottom:6px">Your book PDF is ready — ' + (total - 2) + ' pages</p>' +
    '<p style="font-size:12px;color:var(--muted);line-height:1.6">Print-ready with title page, copyright page, chapters and page numbers. Upload it to Amazon KDP as your paperback interior, or use it as your eBook base.</p>' +
    '</div>';
}

function pdfTab(t, el) {
  document.querySelectorAll('.tab').forEach(function(x){ x.classList.remove('active'); });
  el.classList.add('active');
  ['csv','image','text','book'].forEach(function(id){
    var e = document.getElementById('pdf-' + id);
    if (e) e.style.display = id===t?'block':'none';
  });
}

var _csvData = null;
function handleCSVFile(input) {
  if (!input.files || !input.files[0]) return;
  var file = input.files[0];
  document.getElementById('csv-filename').textContent = '✓ ' + file.name;
  var ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'csv') {
    Papa.parse(file, {
      complete: function(results) {
        _csvData = results.data;
        showCSVReady(file.name);
      }
    });
  } else {
    // Excel
    var reader = new FileReader();
    reader.onload = function(e) {
      var data = new Uint8Array(e.target.result);
      var wb = XLSX.read(data, { type:'array' });
      var sheet = wb.Sheets[wb.SheetNames[0]];
      _csvData = XLSX.utils.sheet_to_json(sheet, { header:1 });
      showCSVReady(file.name);
    };
    reader.readAsArrayBuffer(file);
  }
}

function showCSVReady(filename) {
  document.getElementById('csv-result').innerHTML =
    '<div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:12px;padding:16px;text-align:center">' +
    '<strong style="color:#10b981;display:block;margin-bottom:10px">✅ File loaded! ' + (_csvData ? _csvData.length : 0) + ' rows ready.</strong>' +
    '<button class="btn-primary" onclick="convertCSVtoPDF(\'' + filename.replace(/\.[^.]+$/,'') + '\')">Download as PDF</button>' +
    '</div>';
}

function convertCSVtoPDF(name) {
  if (!requirePaidAction('convert to PDF')) return;
  if (!_csvData || !_csvData.length) { alert('Please upload a file first.'); return; }
  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF();
  var head = [_csvData[0]];
  var body = _csvData.slice(1).filter(function(r){ return r.some(function(c){ return c !== '' && c != null; }); });
  doc.autoTable({ head: head, body: body, styles:{fontSize:8}, headStyles:{fillColor:[37,99,235]} });
  doc.save((name || 'converted') + '.pdf');
  alert('✅ PDF downloaded!');
}

var _imageFiles = [];
function handleImageFiles(input) {
  if (!input.files || !input.files.length) return;
  _imageFiles = Array.from(input.files);
  document.getElementById('img-filename').textContent = '✓ ' + _imageFiles.length + ' image(s) selected';
  document.getElementById('img-result').innerHTML =
    '<div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:12px;padding:16px;text-align:center">' +
    '<button class="btn-primary" onclick="convertImagesToPDF()">Combine into PDF</button>' +
    '</div>';
}

function convertImagesToPDF() {
  if (!requirePaidAction('convert to PDF')) return;
  if (!_imageFiles.length) { alert('Please choose images first.'); return; }
  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF();
  var loaded = 0;
  _imageFiles.forEach(function(file, index) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        if (index > 0) doc.addPage();
        var pw = doc.internal.pageSize.getWidth();
        var ph = doc.internal.pageSize.getHeight();
        var ratio = Math.min(pw / img.width, ph / img.height);
        var w = img.width * ratio;
        var h = img.height * ratio;
        doc.addImage(e.target.result, 'JPEG', (pw-w)/2, (ph-h)/2, w, h);
        loaded++;
        if (loaded === _imageFiles.length) {
          doc.save('images.pdf');
          alert('✅ PDF downloaded!');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function textToPDF() {
  if (!requirePaidAction('convert to PDF')) return;
  var title = (document.getElementById('txt-title') || {value:''}).value.trim() || 'Document';
  var body = (document.getElementById('txt-body') || {value:''}).value.trim();
  if (!body) { alert('Please type some text first.'); return; }
  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(37,99,235);
  doc.text(title, 15, 20);
  doc.setFontSize(11);
  doc.setTextColor(0,0,0);
  var lines = doc.splitTextToSize(body, 180);
  doc.text(lines, 15, 32);
  doc.save(title.replace(/\s+/g,'_') + '.pdf');
  alert('✅ PDF downloaded!');
}

function renderTemplates(el) {
  var templates = [
    { id:'invoice', name:'Professional Invoice', icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h12v20l-2-1.5L14 22l-2-1.5L10 22l-2-1.5L6 22z"/><path d="M9 7h6M9 11h6M9 15h4"/></svg>', price:99, cat:'Business', img:'Professional_Invoice_Template-1.png', desc:'Auto-calculates line totals, subtotal, VAT and total. Includes your banking details.' },
    { id:'quote', name:'Quotation Template', icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 2h6v4H9zM8 10h8M8 14h8M8 18h5"/></svg>', price:99, cat:'Business', img:'Quotation_Template-1.png', desc:'Professional quotes with terms & conditions. Send before invoicing.' },
    { id:'stock', name:'Stock / Inventory Tracker', icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 8 9-5 9 5-9 5-9-5z"/><path d="M3 8v9l9 5 9-5V8M12 13v9"/></svg>', price:149, cat:'Business', img:'Stock_Inventory_Tracker-1.png', desc:'Tracks products, flags LOW/OUT of stock automatically, shows total stock value.' },
    { id:'bizbudget', name:'Business Budget / Cash Flow', icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 2.5-2c1.5 0 2.5 1 2.5 2s-1 1.5-2.5 2-2.5 1-2.5 2 1 2 2.5 2 2.5-1 2.5-2M12 6v2M12 16v2"/></svg>', price:149, cat:'Business', img:'Business_Budget_Planner-1.png', desc:'Income vs expenses, budgeted vs actual, auto money-left calculation.' },
    { id:'wages', name:'Staff Wage Register', icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5"/><path d="M16 6a3 3 0 0 1 0 6M21 20c0-2-1-4-3-4.5"/></svg>', price:149, cat:'Business', img:'Staff_Wage_Register-1.png', desc:'Enter hours & rate — auto-calculates gross, deductions and net pay per employee.' },
    { id:'monthly', name:'Monthly Budget Planner', icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>', price:59, cat:'Personal', img:'Monthly_Budget_Planner-1.png', desc:'Simple personal budget. Money in vs out. Perfect for families.' },
    { id:'marksheet', name:'School Mark Sheet', icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13l2 2 4-4"/></svg>', price:89, cat:'School', img:'School_Mark_Sheet-1.png', desc:'Auto-calculates totals, averages, PASS/FAIL and class average.' },
    { id:'attendance', name:'Class Attendance Register', icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m8 15 2 2 4-4"/></svg>', price:89, cat:'School', img:'Class_Attendance_Register-1.png', desc:'Mark P/A/L/S daily. Auto-counts attendance percentage per learner.' },
    { id:'merchant-agreement', name:'Merchant Agreement Sheet', icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>', price:100, cat:'Business', img:'SkyBlueprint_Merchant_Agreement_Sheet-1.png', desc:'Professional merchant onboarding form — company, bank, directors and business profile. Ready for payment providers.' },
    { id:'instore-details', name:'In-Store Details Sheet', icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l1-5h16l1 5M4 9h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM9 21v-6h6v6"/></svg>', price:100, cat:'Business', img:'SkyBlueprint_Instore_Details_Sheet-1.png', desc:'Capture head office, store branches, bank accounts and POS terminals in one clean sheet.' }
  ];

  var bundles = [
    { id:'bundle-biz', name:'Business Bundle', icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg>', price:499, desc:'All 5 business templates (Invoice, Quote, Stock, Budget, Wages). Save R146!' },
    { id:'bundle-school', name:'School Bundle', icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 2 8l10 5 10-5z"/><path d="M6 10v6c0 1 3 3 6 3s6-2 6-3v-6"/></svg>', price:149, desc:'Mark Sheet + Attendance Register. Save R29!' },
    { id:'bundle-all', name:'Everything Bundle', icon:'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3 6.5 7 1-5 5 1.2 7L12 18l-6.2 3.5L7 14.5l-5-5 7-1z"/></svg>', price:699, desc:'ALL 8 templates. Best value — save over R180!' }
  ];

  var cards = templates.map(function(t){
    return '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:18px;display:flex;flex-direction:column">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
      '<div style="width:44px;height:44px;border-radius:10px;background:rgba(56,189,248,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0">' + t.icon + '</div>' +
      '<div><div style="font-size:15px;font-weight:700;color:#fff">' + t.name + '</div>' +
      '<span style="font-size:10px;background:rgba(56,189,248,0.15);color:#38bdf8;padding:2px 8px;border-radius:10px">' + t.cat + '</span></div>' +
      '</div>' +
      '<p style="font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:14px;flex:1">' + t.desc + '</p>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">' +
      '<span style="font-size:22px;font-weight:800;color:#10b981">R' + t.price + '</span>' +
      '<div style="display:flex;gap:6px">' +
      (t.img ? '<button onclick="previewTemplate(\'' + t.img + '\',\'' + t.name + '\')" style="background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;border-radius:8px;padding:9px 12px;font-size:12px;font-weight:700;cursor:pointer;font-family:var(--font)">Preview</button>' : '') +
      '<button onclick="buyTemplate(\'' + t.id + '\',\'' + t.name + '\',' + t.price + ')" style="background:linear-gradient(135deg,#38bdf8,#6366f1);color:#fff;border:none;border-radius:8px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font)">Buy Now</button>' +
      '</div></div></div>';
  }).join('');

  var bundleCards = bundles.map(function(b){
    return '<div style="background:linear-gradient(135deg,rgba(56,189,248,0.1),rgba(99,102,241,0.08));border:1px solid rgba(56,189,248,0.3);border-radius:14px;padding:18px;display:flex;flex-direction:column">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
      '<div style="width:44px;height:44px;border-radius:10px;background:rgba(16,185,129,0.12);display:flex;align-items:center;justify-content:center;flex-shrink:0">' + b.icon + '</div>' +
      '<div style="font-size:16px;font-weight:800;color:#fff">' + b.name + '</div></div>' +
      '<p style="font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:14px;flex:1">' + b.desc + '</p>' +
      '<div style="display:flex;align-items:center;justify-content:space-between">' +
      '<span style="font-size:24px;font-weight:800;color:#10b981">R' + b.price + '</span>' +
      '<button onclick="buyTemplate(\'' + b.id + '\',\'' + b.name + '\',' + b.price + ')" style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;border:none;border-radius:8px;padding:9px 20px;font-size:13px;font-weight:700;cursor:pointer;font-family:var(--font)">Buy Bundle</button>' +
      '</div></div>';
  }).join('');

  el.innerHTML =
    '<div class="tool-screen">' +
    '<h2>Templates Store</h2>' +
    '<p style="color:var(--muted);font-size:14px;margin-bottom:4px">Professional, ready-to-use spreadsheets for business, school and home.</p>' +
    '<p style="font-size:12px;color:#38bdf8;margin-bottom:8px;font-style:italic">Every template auto-calculates for you. Buy once, keep forever.</p>' +
    '<div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);border-radius:8px;padding:10px 14px;margin-bottom:20px;text-align:center"><span style="font-size:12px;color:#10b981;font-weight:600">✅ No subscription needed — just buy the template you want and keep it forever!</span></div>' +

    '<div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:14px;margin-bottom:20px">' +
    '<div style="font-size:13px;font-weight:700;color:#10b981;margin-bottom:8px">BEST VALUE — BUNDLES</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px">' + bundleCards + '</div>' +
    '</div>' +

    '<div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:12px">Individual Templates</div>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px">' + cards + '</div>' +

    '<div style="background:rgba(56,189,248,0.06);border-radius:12px;padding:16px;margin-top:20px">' +
    '<p style="font-size:12px;color:var(--muted);margin:0;line-height:1.6"><strong style="color:#fff">How it works:</strong> Click Buy, pay securely with Paystack, and we email your template file to you within a few hours. Keep it forever and use it as many times as you like.</p>' +
    '</div>' +
    '</div>';
}

function previewTemplate(img, name) {
  var existing = document.getElementById('tpl-preview-modal');
  if (existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'tpl-preview-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
  modal.onclick = function(){ modal.remove(); };

  // Build the image URL using the current site path (works no matter the repo path)
  var base = window.location.pathname.replace(/[^/]*$/, '');
  var imgUrl = base + img;

  modal.innerHTML =
    '<div style="max-width:600px;width:100%;text-align:center" onclick="event.stopPropagation()">' +
    '<div style="color:#fff;font-size:18px;font-weight:700;margin-bottom:12px">' + name + ' — Preview</div>' +
    '<img id="tpl-preview-img" src="' + imgUrl + '" style="max-width:100%;max-height:75vh;border-radius:12px;border:2px solid rgba(56,189,248,0.4);background:#fff">' +
    '<div id="tpl-preview-err" style="display:none;color:#f87171;padding:20px;font-size:13px"></div>' +
    '<div style="margin-top:14px"><button onclick="document.getElementById(\'tpl-preview-modal\').remove()" style="background:linear-gradient(135deg,#38bdf8,#6366f1);color:#fff;border:none;border-radius:10px;padding:12px 28px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font)">Close</button></div>' +
    '</div>';
  document.body.appendChild(modal);

  // Handle image error with the exact URL shown so we can debug
  var imgEl = document.getElementById('tpl-preview-img');
  imgEl.onerror = function() {
    imgEl.style.display = 'none';
    var err = document.getElementById('tpl-preview-err');
    err.style.display = 'block';
    err.innerHTML = 'Could not load the preview image.<br><br>The site looked for it at:<br><span style="color:#38bdf8;word-break:break-all">' + imgUrl + '</span><br><br>Make sure a file with this EXACT name is in your repo.';
  };
}

function buyTemplate(id, name, price) {
  // No subscription needed - just need an email to send the file to
  var email = (currentUser && currentUser.email) ? currentUser.email : '';
  if (!email) {
    email = prompt('Enter your email address so we can send you "' + name + '" after payment:');
    if (!email || email.indexOf('@') === -1) { alert('A valid email is needed to receive your template.'); return; }
  }

  // Notify owner of the purchase intent + open Paystack
  fetch(BACKEND_URL + '/api/template-order', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ templateId:id, templateName:name, price:price, email:email, name:(currentUser ? (currentUser.fname||'')+' '+(currentUser.lname||'') : 'Guest') })
  }).catch(function(){});

  if (typeof PaystackPop !== 'undefined') {
    var handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: price * 100,
      currency: 'ZAR',
      ref: 'TPL-' + id + '-' + Date.now(),
      metadata: { template: name, buyer: email },
      callback: function(response) {
        deliverTemplate(id, name, email, response.reference);
      },
      onClose: function() {}
    });
    handler.openIframe();
  } else {
    alert('Opening secure checkout for ' + name + ' (R' + price + ')...');
    window.open(PAYSTACK_MONTHLY_LINK, '_blank');
  }
}

// Map each template/bundle to its downloadable file(s) in the repo
var TEMPLATE_FILES = {
  invoice: ['Professional_Invoice_Template.xlsx'],
  quote: ['Quotation_Template.xlsx'],
  stock: ['Stock_Inventory_Tracker.xlsx'],
  bizbudget: ['Business_Budget_Planner.xlsx'],
  wages: ['Staff_Wage_Register.xlsx'],
  monthly: ['Monthly_Budget_Planner.xlsx'],
  marksheet: ['School_Mark_Sheet.xlsx'],
  attendance: ['Class_Attendance_Register.xlsx'],
  'merchant-agreement': ['SkyBlueprint_Merchant_Agreement_Sheet.xlsx'],
  'instore-details': ['SkyBlueprint_Instore_Details_Sheet.xlsx'],
  'bundle-biz': ['Professional_Invoice_Template.xlsx','Quotation_Template.xlsx','Stock_Inventory_Tracker.xlsx','Business_Budget_Planner.xlsx','Staff_Wage_Register.xlsx'],
  'bundle-school': ['School_Mark_Sheet.xlsx','Class_Attendance_Register.xlsx'],
  'bundle-all': ['Professional_Invoice_Template.xlsx','Quotation_Template.xlsx','Stock_Inventory_Tracker.xlsx','Business_Budget_Planner.xlsx','Staff_Wage_Register.xlsx','Monthly_Budget_Planner.xlsx','School_Mark_Sheet.xlsx','Class_Attendance_Register.xlsx']
};

function deliverTemplate(id, name, email, reference) {
  var files = TEMPLATE_FILES[id] || [];
  // Auto-download each file to the customer device
  files.forEach(function(fname, i) {
    setTimeout(function() {
      var a = document.createElement('a');
      a.href = 'templates/' + fname;
      a.download = fname;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, i * 800);
  });

  // Confirm to buyer + notify owner it was delivered
  fetch(BACKEND_URL + '/api/template-order', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ templateId:id, templateName:name, email:email, reference:reference, delivered:true })
  }).catch(function(){});

  var msg = files.length > 1
    ? 'Payment successful! Your ' + files.length + ' files are downloading now. Check your Downloads folder!'
    : 'Payment successful! "' + name + '" is downloading now. Check your Downloads folder!';
  alert(msg + '\n\nReference: ' + reference + '\n\nIf the download did not start, email us at ' + OWNER_EMAIL + ' with your reference.');
}

function renderLearnerships(el) {
  el.innerHTML = `
  <div class="tool-screen">
    <h2>Learnerships & Internships</h2>
    <p style="color:var(--muted);font-size:14px;margin-bottom:4px">Find learnerships and internships you qualify for — sent straight to your email.</p>
    <p style="font-size:12px;color:#38bdf8;margin-bottom:20px;font-style:italic">We check if you qualify, then send you the best matching opportunities and apply links.</p>

    <div id="ls-form">
      <div class="cv-sec-title">Your Details</div>
      <div class="form-row">
        <div class="form-group"><label>Full Name *</label><input type="text" id="ls-name" placeholder="e.g. Thabo Nkosi"></div>
        <div class="form-group"><label>Email Address *</label><input type="email" id="ls-email" placeholder="your@email.com"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Your Age *</label><input type="number" id="ls-age" placeholder="e.g. 22" min="15" max="60"></div>
        <div class="form-group"><label>Province *</label>
          <select id="ls-province">
            <option value="">Select province</option>
            <option>Gauteng</option><option>Western Cape</option><option>KwaZulu-Natal</option>
            <option>Eastern Cape</option><option>Free State</option><option>Limpopo</option>
            <option>Mpumalanga</option><option>North West</option><option>Northern Cape</option>
          </select>
        </div>
      </div>

      <div class="cv-sec-title">Your Qualification</div>
      <div class="form-group"><label>Highest Qualification *</label>
        <select id="ls-qual">
          <option value="">Select your highest qualification</option>
          <option value="below-matric">Below Matric (Grade 9-11)</option>
          <option value="matric">Matric / Grade 12</option>
          <option value="n-cert">N4-N6 Certificate</option>
          <option value="diploma">Diploma</option>
          <option value="degree">Degree</option>
          <option value="honours">Honours or higher</option>
        </select>
      </div>
      <div class="form-group"><label>Field of Interest *</label>
        <select id="ls-field">
          <option value="">Select your field</option>
          <option>Information Technology / IT</option>
          <option>Finance / Accounting</option>
          <option>Business / Admin</option>
          <option>Engineering / Artisan</option>
          <option>Retail / Sales</option>
          <option>Healthcare / Nursing</option>
          <option>Construction / Trades</option>
          <option>Marketing / Media</option>
          <option>Hospitality / Tourism</option>
          <option>Human Resources</option>
          <option>Security</option>
          <option>Agriculture</option>
          <option>General / Any field</option>
        </select>
      </div>
      <div class="form-group"><label>Are you currently employed? *</label>
        <select id="ls-employed">
          <option value="no">No — I am unemployed</option>
          <option value="yes">Yes — I am employed</option>
        </select>
      </div>
      <div class="form-group"><label>What are you looking for? *</label>
        <select id="ls-type">
          <option value="both">Both Learnerships & Internships</option>
          <option value="learnership">Learnerships only</option>
          <option value="internship">Internships only</option>
        </select>
      </div>

      <button class="btn-primary" style="width:100%;box-sizing:border-box;font-size:15px;padding:14px" onclick="checkLearnerships()">
        🔍 Check What I Qualify For
      </button>
    </div>

    <div id="ls-result" style="display:none"></div>
  </div>`;

  setTimeout(function() {
    var em = document.getElementById('ls-email');
    if (em && currentUser && currentUser.email) em.value = currentUser.email;
    var nm = document.getElementById('ls-name');
    if (nm && currentUser && currentUser.fname) nm.value = currentUser.fname + ' ' + (currentUser.lname||'');
  }, 100);
}

function checkLearnerships() {
  var name = (document.getElementById('ls-name') || {value:''}).value.trim();
  var email = (document.getElementById('ls-email') || {value:''}).value.trim();
  var age = parseInt((document.getElementById('ls-age') || {value:'0'}).value);
  var province = (document.getElementById('ls-province') || {value:''}).value;
  var qual = (document.getElementById('ls-qual') || {value:''}).value;
  var field = (document.getElementById('ls-field') || {value:''}).value;
  var employed = (document.getElementById('ls-employed') || {value:'no'}).value;
  var type = (document.getElementById('ls-type') || {value:'both'}).value;

  if (!name || !email || !age || !province || !qual || !field) {
    alert('Please fill in all required fields.');
    return;
  }

  // QUALIFICATION CHECKING LOGIC
  var reasons = [];
  var qualifies = true;

  // Age check - most SA learnerships/internships are 18-35
  if (age < 18) {
    qualifies = false;
    reasons.push('Most learnerships and internships require you to be at least 18 years old. You are ' + age + '.');
  } else if (age > 35) {
    qualifies = false;
    reasons.push('Most SA youth learnerships and internships are for ages 18-35 (Presidential Youth programmes). You are ' + age + '. Some general positions may still be open to you.');
  }

  // Employment check - learnerships are mostly for unemployed
  if (employed === 'yes' && type === 'learnership') {
    reasons.push('Note: Most learnerships are designed for UNEMPLOYED youth. As an employed person, your options are more limited but some exist.');
  }

  // Internship qualification check
  if (type === 'internship' && (qual === 'below-matric' || qual === 'matric')) {
    reasons.push('Note: Most INTERNSHIPS require a Diploma or Degree. With your qualification, LEARNERSHIPS are a better fit for you (they accept Matric and below).');
  }

  // Below matric for internships
  if (qual === 'below-matric' && type === 'internship') {
    qualifies = false;
    reasons.push('Internships require at least a Diploma or Degree. But GOOD NEWS — you qualify for many learnerships that accept Grade 9-11!');
  }

  showLearnershipResult(qualifies, reasons, {name:name, email:email, age:age, province:province, qual:qual, field:field, employed:employed, type:type});
}

function showLearnershipResult(qualifies, reasons, data) {
  document.getElementById('ls-form').style.display = 'none';
  var resultEl = document.getElementById('ls-result');
  resultEl.style.display = 'block';

  // Get matching opportunities/links based on their profile
  var opportunities = getMatchingOpportunities(data);

  var html = '';

  if (!qualifies && opportunities.length === 0) {
    // Does not qualify at all
    html = '<div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:14px;padding:24px;text-align:center">' +
      '<div style="font-size:48px;margin-bottom:12px"></div>' +
      '<h3 style="color:#f87171;font-size:18px;margin-bottom:10px">You Do Not Meet the Requirements Yet</h3>' +
      reasons.map(function(r){ return '<p style="color:var(--muted);font-size:13px;margin-bottom:8px">' + r + '</p>'; }).join('') +
      '<p style="color:#38bdf8;font-size:13px;margin-top:16px">Tip: Keep checking back. New opportunities open every week, and your qualifications may match future ones.</p>' +
      '</div>';
  } else {
    // Qualifies - show opportunities + notes
    html = '<div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:14px;padding:20px;margin-bottom:16px">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
      '<span style="font-size:32px"></span>' +
      '<div><h3 style="color:#10b981;font-size:18px;margin:0">Good News, ' + data.name.split(' ')[0] + '!</h3>' +
      '<p style="color:var(--muted);font-size:13px;margin:2px 0 0">You qualify for ' + opportunities.length + ' opportunity source' + (opportunities.length>1?'s':'') + ' in ' + data.field + '</p></div>' +
      '</div>';

    if (reasons.length > 0) {
      html += '<div style="background:rgba(245,158,11,0.08);border-radius:8px;padding:12px;margin-top:10px">' +
        reasons.map(function(r){ return '<p style="color:#fbbf24;font-size:12px;margin-bottom:4px">⚠️ ' + r + '</p>'; }).join('') +
        '</div>';
    }
    html += '</div>';

    // List opportunities
    html += '<div style="font-size:14px;font-weight:700;color:#fff;margin-bottom:12px">Where to Apply (verified SA sites):</div>';
    html += opportunities.map(function(opp) {
      return '<div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;margin-bottom:10px">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
        '<span style="font-size:20px">' + opp.icon + '</span>' +
        '<strong style="color:#fff;font-size:14px">' + opp.name + '</strong>' +
        (opp.dataFree ? '<span style="font-size:10px;background:rgba(16,185,129,0.15);color:#10b981;padding:2px 8px;border-radius:10px">DATA-FREE</span>' : '') +
        '</div>' +
        '<p style="font-size:12px;color:var(--muted);margin-bottom:10px">' + opp.desc + '</p>' +
        '<a href="' + opp.url + '" target="_blank" style="display:inline-block;background:linear-gradient(135deg,#38bdf8,#6366f1);color:#fff;text-decoration:none;border-radius:8px;padding:9px 18px;font-size:13px;font-weight:600">Apply on ' + opp.name + ' →</a>' +
        '</div>';
    }).join('');

    // Email the opportunities
    html += '<button class="btn-primary" style="width:100%;box-sizing:border-box;margin-top:14px;font-size:14px" onclick="emailLearnerships()">' +
      'Email These Opportunities to Me' +
      '</button>';

    // Store for emailing
    window._lsData = data;
    window._lsOpps = opportunities;
  }

  html += '<button style="width:100%;box-sizing:border-box;margin-top:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:#e2e8f0;border-radius:10px;padding:12px;font-family:var(--font);cursor:pointer;font-weight:600;font-size:13px" onclick="resetLearnerships()">← Check Again</button>';

  resultEl.innerHTML = html;
}

function getMatchingOpportunities(data) {
  var opps = [];
  var fieldLower = data.field.toLowerCase();

  // SAYouth - for everyone 18-35, data-free (verified SA government platform)
  if (data.age >= 18 && data.age <= 35) {
    opps.push({
      name: 'SAYouth.mobi', icon: '🇿🇦', dataFree: true,
      desc: 'Government platform (Presidential Youth programme). Free, no data needed. Thousands of paid learnerships and internships. Works on all networks.',
      url: 'https://www.sayouth.mobi/'
    });
  }

  // StudentRoom - learnerships and internships listings
  opps.push({
    name: 'StudentRoom', icon: '', dataFree: false,
    desc: 'Lists current SA learnerships and internships from companies and TVET colleges with closing dates and requirements.',
    url: 'https://www.studentroom.co.za/category/internships/'
  });

  // Pnet - if matric or higher
  if (data.qual !== 'below-matric') {
    opps.push({
      name: 'Pnet', icon: '', dataFree: false,
      desc: 'Major SA job site with hundreds of learnership and internship listings. Filter by your field and province.',
      url: 'https://www.pnet.co.za/jobs/' + (data.type === 'internship' ? 'internship' : 'learnership')
    });
  }

  // Graduates24 - for diploma/degree
  if (data.qual === 'diploma' || data.qual === 'degree' || data.qual === 'honours') {
    opps.push({
      name: 'Graduates24', icon: '', dataFree: false,
      desc: 'Internships, graduate programmes and bursaries for SA graduates. Banking, finance, IT and engineering programmes.',
      url: 'https://www.graduates24.com/internshipprogrammes'
    });
  }

  // Internships-SA
  opps.push({
    name: 'Internships-SA', icon: '', dataFree: false,
    desc: 'Dedicated SA internship and learnership board updated regularly across all fields.',
    url: 'https://www.internships-sa.co.za/'
  });

  // Indeed - general
  opps.push({
    name: 'Indeed SA', icon: '🔍', dataFree: false,
    desc: 'Search "' + data.field + ' ' + (data.type === 'internship' ? 'internship' : 'learnership') + '" in ' + data.province + '. New listings daily.',
    url: 'https://za.indeed.com/jobs?q=' + encodeURIComponent(data.field + ' ' + (data.type==='internship'?'internship':'learnership')) + '&l=' + encodeURIComponent(data.province)
  });

  return opps;
}

function emailLearnerships() {
  var data = window._lsData;
  var opps = window._lsOpps;
  if (!data || !opps) { alert('Please check your qualifications first.'); return; }

  var oppList = opps.map(function(o){ return { name:o.name, url:o.url, desc:o.desc }; });

  fetch(BACKEND_URL + '/api/learnership-email', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({
      name: data.name, email: data.email,
      field: data.field, province: data.province,
      qual: data.qual, type: data.type,
      opportunities: oppList
    })
  }).then(function(r){ return r.json(); }).then(function(){
    alert('Done! The opportunities and apply links have been sent to ' + data.email + '. Check your inbox (and spam folder).');
  }).catch(function(){
    alert('Could not send email right now, but you can click the apply links above directly.');
  });
}

function resetLearnerships() {
  document.getElementById('ls-result').style.display = 'none';
  document.getElementById('ls-form').style.display = 'block';
}

function renderReminders(el) {
  el.innerHTML = `
  <div class="tool-screen">
    <h2>My Reminders & Tasks</h2>
    <p style="color:var(--muted);font-size:14px;margin-bottom:4px">Never miss a meeting, task, habit or family gathering again.</p>
    <p style="font-size:12px;color:#38bdf8;margin-bottom:20px;font-style:italic">Your personal assistant that reminds you while you focus on what matters.</p>

    <div id="notif-permission" style="display:none;background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:12px;padding:14px;margin-bottom:16px">
      <div style="font-size:13px;color:#fff;font-weight:600;margin-bottom:8px">Enable notifications to get reminders</div>
      <p style="font-size:12px;color:var(--muted);margin-bottom:10px">Allow Sky Blueprint to chime and notify you when a task is due — even when this tab is in the background.</p>
      <button class="btn-primary" style="font-size:13px;padding:10px 18px" onclick="enableNotifications()">Turn On Reminders</button>
    </div>

    <div class="tab-bar">
      <div class="tab active" onclick="reminderTab('add',this)">➕ Add New</div>
      <div class="tab" onclick="reminderTab('today',this)">Today</div>
      <div class="tab" onclick="reminderTab('all',this)">All</div>
    </div>

    <!-- ADD TAB -->
    <div id="rt-add">
      <div class="form-group"><label>What do you need to remember? *</label>
        <input type="text" id="rem-title" placeholder="e.g. Board meeting with investors">
      </div>
      <div class="form-group"><label>Category</label>
        <select id="rem-cat">
          <option value="meeting">Meeting / Work</option>
          <option value="task">✅ Task / To-Do</option>
          <option value="habit">Daily Habit</option>
          <option value="family"> Family / Personal</option>
          <option value="plan">Plan / Goal</option>
          <option value="payment">Payment / Bill</option>
          <option value="health">Health / Appointment</option>
        </select>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Date *</label><input type="date" id="rem-date"></div>
        <div class="form-group"><label>Time *</label><input type="time" id="rem-time"></div>
      </div>
      <div class="form-group"><label>Repeat?</label>
        <select id="rem-repeat">
          <option value="none">Once only</option>
          <option value="daily">Every day (habit)</option>
          <option value="weekly">Every week</option>
          <option value="monthly">Every month</option>
        </select>
      </div>
      <div class="form-group"><label>Notes (optional)</label>
        <textarea id="rem-notes" rows="2" placeholder="e.g. Bring the financial report, location: Sandton office"></textarea>
      </div>
      <button class="btn-primary" style="width:100%;box-sizing:border-box;font-size:15px;padding:14px" onclick="addReminder()">
        Set This Reminder
      </button>
    </div>

    <!-- TODAY TAB -->
    <div id="rt-today" style="display:none"></div>

    <!-- ALL TAB -->
    <div id="rt-all" style="display:none"></div>
  </div>`;

  // Set default date to today
  setTimeout(function() {
    var d = document.getElementById('rem-date');
    if (d) d.value = new Date().toISOString().split('T')[0];
    // Show notification permission prompt if not granted
    if ('Notification' in window && Notification.permission !== 'granted') {
      var np = document.getElementById('notif-permission');
      if (np) np.style.display = 'block';
    }
    // Start the reminder checker
    startReminderChecker();
  }, 100);
}

function reminderTab(tab, el) {
  ['add','today','all'].forEach(function(t){
    var e = document.getElementById('rt-' + t);
    if (e) e.style.display = 'none';
  });
  var target = document.getElementById('rt-' + tab);
  if (target) target.style.display = 'block';
  document.querySelectorAll('.tab').forEach(function(t){ t.classList.remove('active'); });
  if (el) el.classList.add('active');

  if (tab === 'today') renderTodayReminders();
  if (tab === 'all') renderAllReminders();
}

function getReminders() {
  try { return JSON.parse(safeStorage.getItem('sb_reminders') || '[]'); }
  catch(e) { return []; }
}

function saveReminders(list) {
  safeStorage.setItem('sb_reminders', JSON.stringify(list));
}

function addReminder() {
  var title  = (document.getElementById('rem-title')  || {value:''}).value.trim();
  var cat    = (document.getElementById('rem-cat')    || {value:'task'}).value;
  var date   = (document.getElementById('rem-date')   || {value:''}).value;
  var time   = (document.getElementById('rem-time')   || {value:''}).value;
  var repeat = (document.getElementById('rem-repeat') || {value:'none'}).value;
  var notes  = (document.getElementById('rem-notes')  || {value:''}).value.trim();

  if (!title) { alert('Please write what you need to remember.'); return; }
  if (!date || !time) { alert('Please set both a date and time for your reminder.'); return; }

  var reminders = getReminders();
  reminders.push({
    id: Date.now(),
    title: title, cat: cat, date: date, time: time,
    repeat: repeat, notes: notes, done: false, notified: false
  });
  saveReminders(reminders);

  // Ask for notification permission if not set
  if ('Notification' in window && Notification.permission === 'default') {
    enableNotifications();
  }

  alert('Reminder set!\n\n"' + title + '"\non ' + formatReminderDate(date, time) + (repeat !== 'none' ? '\nRepeats: ' + repeat : ''));

  // Clear form
  document.getElementById('rem-title').value = '';
  document.getElementById('rem-notes').value = '';
  document.getElementById('rem-time').value = '';

  // Switch to today tab
  var tabs = document.querySelectorAll('.tab');
  if (tabs[1]) reminderTab('today', tabs[1]);
}

var CAT_INFO = {
  meeting: { icon:'', label:'Meeting', color:'#38bdf8' },
  task:    { icon:'✅', label:'Task', color:'#10b981' },
  habit:   { icon:'', label:'Habit', color:'#a855f7' },
  family:  { icon:'', label:'Family', color:'#ec4899' },
  plan:    { icon:'', label:'Plan', color:'#f59e0b' },
  payment: { icon:'', label:'Payment', color:'#22c55e' },
  health:  { icon:'', label:'Health', color:'#ef4444' }
};

function formatReminderDate(date, time) {
  try {
    var d = new Date(date + 'T' + time);
    return d.toLocaleDateString('en-ZA', { weekday:'short', day:'numeric', month:'short' }) + ' at ' +
           d.toLocaleTimeString('en-ZA', { hour:'2-digit', minute:'2-digit' });
  } catch(e) { return date + ' ' + time; }
}

function renderTodayReminders() {
  var el = document.getElementById('rt-today');
  if (!el) return;
  var today = new Date().toISOString().split('T')[0];
  var reminders = getReminders().filter(function(r){
    return r.date === today || r.repeat === 'daily';
  }).sort(function(a,b){ return a.time.localeCompare(b.time); });

  if (reminders.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--muted)"><div style="font-size:48px;margin-bottom:12px"></div><p>No reminders for today.<br>Tap "Add New" to set one.</p></div>';
    return;
  }

  el.innerHTML = '<div style="font-size:13px;color:var(--muted);margin-bottom:14px">You have <strong style="color:#fff">' + reminders.length + '</strong> reminder' + (reminders.length>1?'s':'') + ' for today</div>' +
    reminders.map(renderReminderCard).join('');
}

function renderAllReminders() {
  var el = document.getElementById('rt-all');
  if (!el) return;
  var reminders = getReminders().sort(function(a,b){
    return (a.date + a.time).localeCompare(b.date + b.time);
  });

  if (reminders.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--muted)"><div style="font-size:48px;margin-bottom:12px"></div><p>No reminders yet.<br>Tap "Add New" to create your first one.</p></div>';
    return;
  }

  el.innerHTML = '<div style="font-size:13px;color:var(--muted);margin-bottom:14px">All your reminders (' + reminders.length + ')</div>' +
    reminders.map(renderReminderCard).join('');
}

function renderReminderCard(r) {
  var ci = CAT_INFO[r.cat] || CAT_INFO.task;
  var repeatBadge = r.repeat !== 'none' ? '<span style="font-size:10px;background:rgba(168,85,247,0.15);color:#a855f7;padding:2px 8px;border-radius:10px;margin-left:6px">' + r.repeat + '</span>' : '';
  return '<div id="rem-card-' + r.id + '" style="background:' + (r.done ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.04)') + ';border:1px solid ' + ci.color + '33;border-left:3px solid ' + ci.color + ';border-radius:10px;padding:14px;margin-bottom:10px;' + (r.done ? 'opacity:0.5' : '') + '">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">' +
    '<div style="flex:1;min-width:0">' +
    '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">' +
    '<span style="font-size:16px">' + ci.icon + '</span>' +
    '<span style="font-size:14px;font-weight:700;color:#fff;' + (r.done ? 'text-decoration:line-through' : '') + '">' + r.title + '</span>' +
    repeatBadge +
    '</div>' +
    '<div style="font-size:12px;color:' + ci.color + ';font-weight:600;margin-bottom:2px">' + formatReminderDate(r.date, r.time) + '</div>' +
    (r.notes ? '<div style="font-size:12px;color:var(--muted);margin-top:4px">' + r.notes + '</div>' : '') +
    '</div>' +
    '<div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">' +
    (!r.done ? '<button onclick="completeReminder(' + r.id + ')" style="background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3);color:#10b981;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:11px;font-family:var(--font);font-weight:600">✓ Done</button>' : '') +
    '<button onclick="deleteReminder(' + r.id + ')" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:11px;font-family:var(--font)">Delete</button>' +
    '</div></div></div>';
}

function completeReminder(id) {
  var reminders = getReminders();
  var r = reminders.find(function(x){ return x.id === id; });
  if (r) {
    if (r.repeat !== 'none') {
      // For repeating, advance to next occurrence instead of marking done
      var d = new Date(r.date + 'T' + r.time);
      if (r.repeat === 'daily') d.setDate(d.getDate() + 1);
      else if (r.repeat === 'weekly') d.setDate(d.getDate() + 7);
      else if (r.repeat === 'monthly') d.setMonth(d.getMonth() + 1);
      r.date = d.toISOString().split('T')[0];
      r.notified = false;
      alert('✓ Done! This repeating reminder is set for its next time: ' + formatReminderDate(r.date, r.time));
    } else {
      r.done = true;
    }
    saveReminders(reminders);
    renderTodayReminders();
    renderAllReminders();
  }
}

function deleteReminder(id) {
  if (!confirm('Delete this reminder?')) return;
  var reminders = getReminders().filter(function(x){ return x.id !== id; });
  saveReminders(reminders);
  renderTodayReminders();
  renderAllReminders();
}

function enableNotifications() {
  if (!('Notification' in window)) {
    alert('Your browser does not support notifications. Reminders will still show when you open Sky Blueprint.');
    return;
  }
  Notification.requestPermission().then(function(perm) {
    if (perm === 'granted') {
      var np = document.getElementById('notif-permission');
      if (np) np.style.display = 'none';
      new Notification('Sky Blueprint Reminders On!', { body: 'Great! We will now remind you of your tasks and meetings.' });
    } else {
      alert('Notifications were not enabled. You can turn them on later in your browser settings. Reminders will still chime when Sky Blueprint is open.');
    }
  });
}

var _reminderCheckerStarted = false;
function startReminderChecker() {
  if (_reminderCheckerStarted) return;
  _reminderCheckerStarted = true;
  setInterval(checkReminders, 30000); // check every 30 seconds
  checkReminders();
}

function checkReminders() {
  var now = new Date();
  var reminders = getReminders();
  var changed = false;

  reminders.forEach(function(r) {
    if (r.done || r.notified) return;
    var due = new Date(r.date + 'T' + r.time);
    // Fire if due time has arrived (within the last 2 minutes window)
    var diff = now - due;
    if (diff >= 0 && diff < 120000) {
      fireReminder(r);
      r.notified = true;
      changed = true;
    }
  });

  if (changed) saveReminders(reminders);
}

function fireReminder(r) {
  var ci = CAT_INFO[r.cat] || CAT_INFO.task;
  var body = ci.label + ' • ' + formatReminderDate(r.date, r.time) + (r.notes ? '\n' + r.notes : '');

  // Browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    var n = new Notification('' + r.title, { body: body, requireInteraction: true });
  }

  // Chime sound
  playChime();

  // On-screen alert as backup
  showReminderPopup(r);
}

function playChime() {
  try {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    var notes = [523.25, 659.25, 783.99]; // C, E, G chord
    notes.forEach(function(freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      var start = ctx.currentTime + i * 0.15;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.8);
      osc.start(start);
      osc.stop(start + 0.8);
    });
  } catch(e) {}
}

function showReminderPopup(r) {
  var ci = CAT_INFO[r.cat] || CAT_INFO.task;
  var existing = document.getElementById('reminder-popup');
  if (existing) existing.remove();

  var popup = document.createElement('div');
  popup.id = 'reminder-popup';
  popup.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999;background:#0f1629;border:2px solid ' + ci.color + ';border-radius:16px;padding:20px 24px;box-shadow:0 10px 40px rgba(0,0,0,0.5);max-width:90vw;width:380px;animation:slideDown 0.3s ease';
  popup.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
    '<span style="font-size:28px">' + ci.icon + '</span>' +
    '<div><div style="font-size:11px;color:' + ci.color + ';font-weight:700;text-transform:uppercase;letter-spacing:1px">Reminder — ' + ci.label + '</div>' +
    '<div style="font-size:17px;font-weight:800;color:#fff">' + r.title + '</div></div>' +
    '</div>' +
    (r.notes ? '<div style="font-size:13px;color:var(--muted);margin:8px 0">' + r.notes + '</div>' : '') +
    '<div style="font-size:12px;color:' + ci.color + ';margin-bottom:14px">' + formatReminderDate(r.date, r.time) + '</div>' +
    '<button onclick="document.getElementById(\'reminder-popup\').remove()" style="width:100%;background:linear-gradient(135deg,#38bdf8,#6366f1);color:#fff;border:none;border-radius:10px;padding:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font)">Got it ✓</button>';

  document.body.appendChild(popup);
  // Auto-remove after 30 seconds
  setTimeout(function(){ var p = document.getElementById('reminder-popup'); if (p) p.remove(); }, 30000);
}

function renderSAMap(el) {
  el.innerHTML = `
  <div class="tool-screen">
    <h2>SA Map & Location</h2>
    <p>Explore South Africa. Search any city, suburb or address.</p>
    <div style="display:flex;gap:10px;margin-bottom:20px">
      <input type="text" id="ms" placeholder="Search any SA location..." style="flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px 16px;color:var(--text);font-family:var(--font);font-size:14px;outline:none">
      <button class="send-btn" onclick="searchM()">Search</button>
    </div>
    <div class="map-frame" id="map-f"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7335215!2d25.0843!3d-29.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1c34a689d9ee1251%3A0xe85d630c1fa4e8a0!2sSouth%20Africa!5e0!3m2!1sen!2sza!4v1234567890" allowfullscreen loading="lazy"></iframe></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
      ${['Cape Town','Johannesburg','Durban','Pretoria','Port Elizabeth','Bloemfontein','Polokwane','Nelspruit'].map(c=>`<button class="chip" onclick="mapCity('${c}')">${c}</button>`).join('')}
    </div>
  </div>`;
}
function searchM(){const q=document.getElementById('ms').value;if(!q)return;document.getElementById('map-f').innerHTML=`<iframe src="https://www.google.com/maps?q=${encodeURIComponent(q+' South Africa')}&output=embed" allowfullscreen loading="lazy" style="width:100%;height:100%;border:none"></iframe>`;}
function mapCity(c){document.getElementById('ms').value=c;searchM();}

// ── Paystack Payment ──
function startPaystack(plan) {
  currentPlan = plan;
  var titles = {
    website: 'Order Your Website — R450',
    monthly: 'Subscribe Monthly — R55/month',
    yearly: '3-Year Plan — R1,980/year'
  };
  var subs = {
    website: 'R450 once-off · We build your professional website in 24-48 hours',
    monthly: 'R55/month · All 11 tools · Auto-debit via Paystack · Cancel anytime',
    yearly: 'R1,980 per year for 3 years · Auto-renews yearly · All tools'
  };
  document.getElementById('modal-title').textContent = titles[plan] || 'Subscribe to Sky Blueprint';
  document.getElementById('modal-sub').textContent = subs[plan] || '';
  if (currentUser) {
    document.getElementById('pay-name').value = (currentUser.fname + ' ' + currentUser.lname).trim();
    document.getElementById('pay-email').value = currentUser.email || '';
    document.getElementById('pay-phone').value = currentUser.phone || '';
  }
  document.getElementById('pay-modal').classList.remove('hidden');
}
function closeModal() { document.getElementById('pay-modal').classList.add('hidden'); }

function processPayment() {
  const name = document.getElementById('pay-name').value.trim();
  const email = document.getElementById('pay-email').value.trim();
  const phone = document.getElementById('pay-phone').value.trim();
  if (!name || !email) { alert('Please enter your name and email to continue.'); return; }

  // MONTHLY - charge R55 via Paystack popup. Access is granted ONLY after payment succeeds.
  if (currentPlan === 'monthly') {
    if (typeof PaystackPop === 'undefined') {
      // Popup library not loaded - fall back to the payment page (access NOT granted until confirmed)
      closeModal();
      alert('Opening secure Paystack checkout. Your access activates once payment is confirmed.');
      window.open(PAYSTACK_MONTHLY_LINK + '?email=' + encodeURIComponent(email), '_blank');
      return;
    }
    var handlerM = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: 5500, // R55.00 in cents
      currency: 'ZAR',
      ref: 'SB-M-' + Date.now(),
      metadata: { name: name, phone: phone, plan: 'monthly' },
      callback: function(response) {
        // This ONLY fires on a real successful payment - verify with server
        closeModal();
        markPlanActive('monthly', name, email, phone, response.reference);
      },
      onClose: function() {
        // User closed without paying - NO access granted
      }
    });
    handlerM.openIframe();
    return;
  }

  // YEARLY - use Paystack subscription plan (R1,980/year for 3 years) via popup
  if (currentPlan === 'yearly') {
    if (typeof PaystackPop === 'undefined') {
      // Popup not loaded - open checkout but do NOT grant access until confirmed
      closeModal();
      alert('Opening secure Paystack checkout. Your access activates once payment is confirmed.');
      window.open('https://paystack.com/pay/' + PAYSTACK_YEARLY_PLAN, '_blank');
      return;
    }
    const handlerY = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      plan: PAYSTACK_YEARLY_PLAN,
      currency: 'ZAR',
      ref: 'SB-Y-' + Date.now(),
      metadata: { name: name, phone: phone, plan: 'yearly' },
      callback: function(response) {
        closeModal();
        markPlanActive('yearly', name, email, phone, response.reference);
      },
      onClose: function() {}
    });
    handlerY.openIframe();
    return;
  }

  // WEBSITE and other once-off payments via popup
  if (typeof PaystackPop === 'undefined') {
    closeModal();
    alert('Redirecting to secure Paystack checkout...');
    window.open(PAYSTACK_MONTHLY_LINK, '_blank');
    return;
  }

  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: PRICES[currentPlan] || 45000,
    currency: 'ZAR',
    ref: 'SB-' + Date.now(),
    metadata: { name: name, phone: phone, plan: currentPlan },
    callback: function(response) {
      closeModal();
      markPlanActive(currentPlan, name, email, phone, response.reference);
    },
    onClose: function() {}
  });
  handler.openIframe();
}

function markPlanActive(plan, name, email, phone, reference) {
  // SECURE: verify the payment with the server before granting access.
  // The server asks Paystack directly if the payment is real.
  var token = safeStorage.getItem('sb_token');
  if (!token) { alert('Please log in first, then subscribe.'); showPage('login'); return; }
  if (plan === 'website') {
    // website orders are leads, not access - just notify
    fetch(BACKEND_URL + '/api/login-notify', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ fname:name, lname:'', email:email, action:'website-order' }) }).catch(function(){});
    return;
  }
  if (!reference) { alert('Payment reference missing. If you were charged, please contact support.'); return; }

  fetch(BACKEND_URL + '/api/verify-payment', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ reference: reference, token: token, plan: plan })
  })
  .then(function(r){ return r.json().then(function(d){ return { ok:r.ok, d:d }; }); })
  .then(function(res){
    if (res.ok && res.d.success) {
      // Server confirmed the payment is REAL. Update our view from the server's truth.
      currentUser = res.d.user;
      safeStorage.setItem('sb_current', JSON.stringify(currentUser));
      var banner = document.getElementById('trial-banner');
      if (banner) {
        banner.innerHTML = '✅ <strong>Payment verified! You are now on Sky Blueprint ' + (currentUser.plan||'').toUpperCase() + '.</strong> All tools unlocked.';
        banner.style.background = 'rgba(16,185,129,0.08)';
        banner.style.borderColor = 'rgba(16,185,129,0.3)';
      }
      updateNav();
      showPage('dashboard');
    } else {
      alert('We could not verify your payment yet. If you were charged, it may take a moment — please refresh, or contact support with your reference: ' + reference);
    }
  })
  .catch(function(){ alert('Could not verify payment right now. If you were charged, please contact support with reference: ' + reference); });
}

// ── Init ──
// ── REVIEWS SYSTEM ──
var _rmRating = 0;

function loadReviews() {
  fetch(BACKEND_URL + '/api/reviews')
    .then(function(r){ return r.json(); })
    .then(function(data){
      renderReviews(data.reviews || []);
    })
    .catch(function(){
      // Fallback to a few starter reviews if backend not reachable
      renderReviews([]);
    });
}

function renderReviews(reviews) {
  // If no reviews yet, show friendly starter state
  var avgEl = document.getElementById('rs-avg');
  var starsEl = document.getElementById('rs-stars');
  var countEl = document.getElementById('rs-count');
  var barsEl = document.getElementById('rs-bars');
  var gridEl = document.getElementById('review-grid');
  if (!avgEl) return;

  if (reviews.length === 0) {
    avgEl.textContent = '5.0';
    starsEl.textContent = '★★★★★';
    countEl.textContent = 'Be the first to review!';
    barsEl.innerHTML = '';
    gridEl.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--muted)">No reviews yet. Be the first to share your experience! </div>';
    return;
  }

  // Calculate average
  var total = 0;
  var counts = {1:0,2:0,3:0,4:0,5:0};
  reviews.forEach(function(r){ total += r.rating; counts[r.rating] = (counts[r.rating]||0) + 1; });
  var avg = (total / reviews.length).toFixed(1);

  avgEl.textContent = avg;
  starsEl.textContent = starString(Math.round(avg));
  countEl.textContent = 'Based on ' + reviews.length + ' verified review' + (reviews.length>1?'s':'');

  // Bars (5 down to 1)
  var barsHtml = '';
  for (var s = 5; s >= 1; s--) {
    var c = counts[s] || 0;
    var pct = reviews.length ? (c / reviews.length * 100) : 0;
    barsHtml += '<div class="rs-bar-row">' +
      '<span class="rs-bar-label">' + s + '<span class="star">★</span></span>' +
      '<span class="rs-bar-track"><span class="rs-bar-fill" style="width:' + pct + '%"></span></span>' +
      '<span class="rs-bar-count">' + c + '</span>' +
      '</div>';
  }
  barsEl.innerHTML = barsHtml;

  // Review cards (newest first)
  var sorted = reviews.slice().reverse();
  gridEl.innerHTML = sorted.map(function(r){
    return '<div class="review-card">' +
      '<div class="rc-stars">' + starString(r.rating) + '</div>' +
      '<div class="rc-text">"' + escapeHtml(r.text) + '"</div>' +
      '<div class="rc-name">' + escapeHtml(r.name) + '</div>' +
      '<div class="rc-meta">✓ Verified user' + (r.city ? ' · ' + escapeHtml(r.city) : '') + '</div>' +
      '</div>';
  }).join('');
}

function starString(n) {
  n = Math.max(0, Math.min(5, n));
  return '★★★★★'.substring(0, n) + '☆☆☆☆☆'.substring(0, 5-n);
}

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function openReviewForm() {
  var modal = document.getElementById('review-modal');
  if (modal) modal.style.display = 'flex';
  _rmRating = 0;
  updateStarPicker();
  // Pre-fill name if logged in
  if (currentUser) {
    var nm = document.getElementById('rm-name');
    if (nm && currentUser.fname) nm.value = currentUser.fname + ' ' + (currentUser.lname ? currentUser.lname.charAt(0) + '.' : '');
  }
}

function closeReviewForm() {
  var modal = document.getElementById('review-modal');
  if (modal) modal.style.display = 'none';
}

function setupStarPicker() {
  var stars = document.querySelectorAll('#rm-stars span');
  stars.forEach(function(star){
    star.addEventListener('click', function(){
      _rmRating = parseInt(this.getAttribute('data-star'));
      updateStarPicker();
    });
  });
}

function updateStarPicker() {
  var stars = document.querySelectorAll('#rm-stars span');
  stars.forEach(function(star){
    var v = parseInt(star.getAttribute('data-star'));
    if (v <= _rmRating) star.classList.add('active');
    else star.classList.remove('active');
  });
}

function submitReview() {
  var name = (document.getElementById('rm-name') || {value:''}).value.trim();
  var city = (document.getElementById('rm-city') || {value:''}).value.trim();
  var text = (document.getElementById('rm-text') || {value:''}).value.trim();

  if (_rmRating === 0) { alert('Please tap the stars to give a rating.'); return; }
  if (!name) { alert('Please enter your name.'); return; }
  if (!text) { alert('Please write a few words about your experience.'); return; }

  var review = { rating: _rmRating, name: name, city: city, text: text };

  fetch(BACKEND_URL + '/api/reviews', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(review)
  }).then(function(r){ return r.json(); }).then(function(){
    closeReviewForm();
    alert('Thank you for your review! It has been posted.');
    // Clear form
    document.getElementById('rm-name').value = '';
    document.getElementById('rm-city').value = '';
    document.getElementById('rm-text').value = '';
    _rmRating = 0;
    loadReviews();
  }).catch(function(){
    alert('Could not post your review right now. Please try again later.');
  });
}

// ── REVIEWS SYSTEM ──
var _selectedRating = 0;

// Starter reviews shown until real ones come in (these are examples)
var SEED_REVIEWS = [
  { name:'Thabo M.', city:'Johannesburg', rating:5, text:'Sky Blueprint helped me build my CV and I got a learnership within two weeks. This is exactly what young South Africans need!' },
  { name:'Nomsa D.', city:'Durban', rating:5, text:'The AI Email Secretary sorted my messy inbox in seconds. I never miss important emails now. Worth every rand.' },
  { name:'Sipho K.', city:'Pretoria', rating:4, text:'Got my business website in 3 days. Professional and affordable. The team really knows what they are doing.' },
  { name:'Lerato P.', city:'Cape Town', rating:5, text:'I love the reminders tool! It keeps my whole day organised. As a busy entrepreneur this is a lifesaver.' },
  { name:'Ayanda N.', city:'Bloemfontein', rating:5, text:'All these tools for R55 a month is incredible value. The learnerships tool found me opportunities I did not know existed.' },
  { name:'Kagiso R.', city:'Polokwane', rating:4, text:'Great platform built for South Africans. Easy to use even if you are not good with technology. Highly recommend.' }
];

function getReviews() {
  try {
    var stored = JSON.parse(safeStorage.getItem('sb_reviews') || 'null');
    if (stored && stored.length) return stored;
  } catch(e) {}
  return SEED_REVIEWS.slice();
}

function loadReviews() {
  // Try backend first, fall back to local
  fetch(BACKEND_URL + '/api/get-reviews')
    .then(function(r){ return r.json(); })
    .then(function(data){
      if (data && data.reviews && data.reviews.length) {
        renderReviews(data.reviews);
      } else {
        renderReviews(getReviews());
      }
    })
    .catch(function(){ renderReviews(getReviews()); });
}

function renderReviews(reviews) {
  if (!reviews || !reviews.length) reviews = getReviews();

  // Calculate average and breakdown
  var total = reviews.length;
  var sum = 0;
  var counts = {1:0,2:0,3:0,4:0,5:0};
  reviews.forEach(function(r){ sum += r.rating; counts[r.rating] = (counts[r.rating]||0)+1; });
  var avg = (sum / total).toFixed(1);

  // Update summary
  var avgEl = document.getElementById('rs-avg');
  var starsEl = document.getElementById('rs-stars');
  var countEl = document.getElementById('rs-count');
  if (avgEl) avgEl.textContent = avg;
  if (starsEl) starsEl.textContent = starString(Math.round(avg));
  if (countEl) countEl.textContent = 'Based on ' + total + ' verified review' + (total===1?'':'s');

  // Build bars (5 down to 1)
  var barsEl = document.getElementById('rs-bars');
  if (barsEl) {
    var html = '';
    for (var star = 5; star >= 1; star--) {
      var c = counts[star] || 0;
      var pct = total > 0 ? Math.round((c/total)*100) : 0;
      html += '<div class="rs-bar-row">' +
        '<span class="rs-bar-label">' + star + '★</span>' +
        '<div class="rs-bar-track"><div class="rs-bar-fill" style="width:' + pct + '%"></div></div>' +
        '<span class="rs-bar-count">' + c + '</span>' +
        '</div>';
    }
    barsEl.innerHTML = html;
  }

  // Build review cards
  var gridEl = document.getElementById('review-grid');
  if (gridEl) {
    gridEl.innerHTML = reviews.map(function(r){
      return '<div class="review-card">' +
        '<div class="rc-stars">' + starString(r.rating) + '</div>' +
        '<div class="rc-text">"' + escapeHtml(r.text) + '"</div>' +
        '<div class="rc-name">' + escapeHtml(r.name) + '</div>' +
        '<div class="rc-verified">✓ Verified buyer' + (r.city ? ' · ' + escapeHtml(r.city) : '') + '</div>' +
        '</div>';
    }).join('');
  }
}

function starString(n) {
  n = Math.max(0, Math.min(5, n));
  return '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5-n);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function openReviewForm() {
  var modal = document.getElementById('review-modal');
  if (modal) modal.style.display = 'flex';
  _selectedRating = 0;
  updateStarPicker();
}

function closeReviewForm() {
  var modal = document.getElementById('review-modal');
  if (modal) modal.style.display = 'none';
}

function updateStarPicker() {
  var stars = document.querySelectorAll('#rm-stars span');
  stars.forEach(function(s){
    var v = parseInt(s.getAttribute('data-star'));
    if (v <= _selectedRating) s.classList.add('active');
    else s.classList.remove('active');
  });
}

function submitReview() {
  var name = (document.getElementById('rm-name') || {value:''}).value.trim();
  var city = (document.getElementById('rm-city') || {value:''}).value.trim();
  var text = (document.getElementById('rm-text') || {value:''}).value.trim();

  if (_selectedRating === 0) { alert('Please tap the stars to give a rating.'); return; }
  if (!name) { alert('Please enter your name.'); return; }
  if (!text) { alert('Please write a few words about your experience.'); return; }

  var review = { name:name, city:city, rating:_selectedRating, text:text, date:Date.now() };

  // Save locally
  var reviews = getReviews();
  reviews.unshift(review);
  safeStorage.setItem('sb_reviews', JSON.stringify(reviews));

  // Send to backend so everyone sees it + notify owner
  fetch(BACKEND_URL + '/api/add-review', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify(review)
  }).catch(function(){});

  closeReviewForm();
  alert('Thank you for your review, ' + name + '! Your feedback means a lot to us.');

  // Clear form
  document.getElementById('rm-name').value = '';
  document.getElementById('rm-city').value = '';
  document.getElementById('rm-text').value = '';
  _selectedRating = 0;

  renderReviews(reviews);
}

document.addEventListener('DOMContentLoaded', function() {
  // Check if user is already logged in
  const saved = safeStorage.getItem('sb_current');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      document.getElementById('dash-greeting').textContent = 'Welcome back, ' + currentUser.fname + '! ';
    } catch(e) {}
  }
  // SECURITY: ask the server for the REAL plan. Overrides any tampered browser value.
  var _tok = safeStorage.getItem('sb_token');
  if (_tok) {
    fetch(BACKEND_URL + '/api/auth/me', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ token: _tok })
    })
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(data){
      if (data && data.success) {
        currentUser = data.user;
        safeStorage.setItem('sb_current', JSON.stringify(currentUser));
        updateNav();
      } else {
        currentUser = null;
        safeStorage.removeItem('sb_token');
        safeStorage.removeItem('sb_current');
        updateNav();
      }
    })
    .catch(function(){});
  }
  // Update nav to show name + trial days if logged in
  updateNav();
  // Start reminder checker globally so reminders chime anywhere
  if (typeof startReminderChecker === 'function') startReminderChecker();
  // Load and display reviews
  if (typeof loadReviews === 'function') loadReviews();
  // Star picker click handlers
  var starPicker = document.getElementById('rm-stars');
  if (starPicker) {
    starPicker.querySelectorAll('span').forEach(function(s){
      s.addEventListener('click', function(){
        _selectedRating = parseInt(s.getAttribute('data-star'));
        updateStarPicker();
      });
    });
  }
  // Load reviews and set up star picker
  if (typeof loadReviews === 'function') loadReviews();
  if (typeof setupStarPicker === 'function') setupStarPicker();
  // Load Paystack script
  const ps = document.createElement('script');
  ps.src = 'https://js.paystack.co/v1/inline.js';
  document.head.appendChild(ps);
});function searchJ(platform,el){
  if(el){document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));el.classList.add('active');}

  var q = document.getElementById('js-q').value || '';
  var l = document.getElementById('js-l').value || 'South Africa';
  var skills = document.getElementById('cv-sk') ? document.getElementById('cv-sk').value : '';
  var qual = document.getElementById('cv-qu') ? document.getElementById('cv-qu').value : '';
  var jobTitle = document.getElementById('cv-jt') ? document.getElementById('cv-jt').value : '';

  var res = document.getElementById('job-res');
  res.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted)">🔍 AI is matching your CV to available jobs...</div>';

  // Call backend for AI matching
  fetch(BACKEND_URL + '/api/match-jobs', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ skills, qualification: qual, jobTitle, city: l, searchQuery: q })
  })
  .then(function(r){ return r.json(); })
  .then(function(data){
    showJobResults(data, platform, q, l);
  })
  .catch(function(){
    // Fallback if backend not connected yet
    showJobResults({ level:'entry', levelName:'Entry Level', jobTitle: q||jobTitle, location: l }, platform, q, l);
  });
}

function showJobResults(data, platform, q, l) {
  var jobTitle = data.jobTitle || q || 'jobs';
  var location = data.location || l;
  var level = data.level || 'entry';
  var levelName = data.levelName || 'Entry Level';

  var encode = encodeURIComponent;
  var li = 'https://www.linkedin.com/jobs/search/?keywords='+encode(jobTitle)+'&location='+encode(location);
  var ind = 'https://za.indeed.com/jobs?q='+encode(jobTitle)+'&l='+encode(location);
  var pnet = 'https://www.pnet.co.za/jobs/'+encode(jobTitle.toLowerCase().replace(/\s+/g,'-'))+'/';
  var youth = 'https://www.youthmobi.com/jobs?search='+encode(jobTitle);

  var levelColors = {
    entry: '#10b981', skilled: '#f59e0b',
    mid: '#38bdf8', executive: '#8b5cf6'
  };

  var res = document.getElementById('job-res');
  res.innerHTML = `
    <div style="background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.15);border-radius:12px;padding:14px 16px;margin-bottom:16px">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:10px;height:10px;border-radius:50%;background:${levelColors[level]};flex-shrink:0"></div>
        <p style="font-size:13px;color:#fff;margin:0">CV Level detected: <strong style="color:${levelColors[level]}">${levelName}</strong></p>
      </div>
      <p style="font-size:12px;color:var(--muted);margin:6px 0 0">Showing only jobs matching your qualification level</p>
    </div>

    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      ${platform!=='indeed'&&platform!=='pnet'&&platform!=='youth'?`<a href="${li}" target="_blank" style="flex:1;min-width:120px;background:rgba(0,102,255,0.1);border:1px solid rgba(0,102,255,0.25);color:#6699ff;border-radius:10px;padding:10px;text-align:center;font-size:12px;font-weight:600;text-decoration:none">LinkedIn Jobs</a>`:''}
      ${platform!=='linkedin'&&platform!=='pnet'&&platform!=='youth'?`<a href="${ind}" target="_blank" style="flex:1;min-width:120px;background:rgba(245,130,0,0.1);border:1px solid rgba(245,130,0,0.25);color:#ffa040;border-radius:10px;padding:10px;text-align:center;font-size:12px;font-weight:600;text-decoration:none">🔍 Indeed Jobs</a>`:''}
      ${platform==='both'||platform==='pnet'?`<a href="${pnet}" target="_blank" style="flex:1;min-width:120px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);color:var(--green);border-radius:10px;padding:10px;text-align:center;font-size:12px;font-weight:600;text-decoration:none">Pnet SA Jobs</a>`:''}
      <a href="${youth}" target="_blank" style="flex:1;min-width:120px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.25);color:#a78bfa;border-radius:10px;padding:10px;text-align:center;font-size:12px;font-weight:600;text-decoration:none">YouthMobi</a>
    </div>

    <p style="font-size:12px;color:var(--muted);margin-bottom:10px">Click any button above to see real live jobs matching your CV on that platform</p>
    <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);border-radius:10px;padding:12px 14px">
      <p style="font-size:12px;color:#f59e0b;margin:0">⚠️ <strong>CV Level Warning:</strong> ${
        level==='entry' ? 'Your CV matches entry level positions (Matric/Grade 12). Apply for junior, internship and learnership positions.' :
        level==='skilled' ? 'Your CV matches skilled trade positions (Diploma/Trade Certificate). Apply for artisan, technician and skilled worker roles.' :
        level==='mid' ? 'Your CV matches mid-level positions (Degree holder). Apply for professional, supervisor and management roles.' :
        'Your CV matches executive level positions. Apply for senior management, director and C-suite roles only.'
      }</p>
    </div>`;
}


// ── SA Map ──
function renderSAMap(el) {
  el.innerHTML = `
  <div class="tool-screen">
    <h2>SA Map & Location</h2>
    <p>Explore South Africa. Search any city, suburb or address.</p>
    <div style="display:flex;gap:10px;margin-bottom:20px">
      <input type="text" id="ms" placeholder="Search any SA location..." style="flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px 16px;color:var(--text);font-family:var(--font);font-size:14px;outline:none">
      <button class="send-btn" onclick="searchM()">Search</button>
    </div>
    <div class="map-frame" id="map-f"><iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7335215!2d25.0843!3d-29.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1c34a689d9ee1251%3A0xe85d630c1fa4e8a0!2sSouth%20Africa!5e0!3m2!1sen!2sza!4v1234567890" allowfullscreen loading="lazy"></iframe></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
      ${['Cape Town','Johannesburg','Durban','Pretoria','Port Elizabeth','Bloemfontein','Polokwane','Nelspruit'].map(c=>`<button class="chip" onclick="mapCity('${c}')">${c}</button>`).join('')}
    </div>
  </div>`;
}
function searchM(){const q=document.getElementById('ms').value;if(!q)return;document.getElementById('map-f').innerHTML=`<iframe src="https://www.google.com/maps?q=${encodeURIComponent(q+' South Africa')}&output=embed" allowfullscreen loading="lazy" style="width:100%;height:100%;border:none"></iframe>`;}
function mapCity(c){document.getElementById('ms').value=c;searchM();}

// ── Paystack Payment ──
// ── Init ──

// ═══════════════════════════════════════════
// THEME SWITCHER
// ═══════════════════════════════════════════
function setTheme(theme) {
  document.body.className = document.body.className
    .replace(/\btheme-\w+\b/g, '').trim();
  document.body.classList.add('theme-' + theme);
  try { localStorage.setItem('sb_theme', theme); } catch(e){}
}

// ═══════════════════════════════════════════
// WELCOME VOICE
// ═══════════════════════════════════════════
function playWelcomeVoice() {
  if (!window.speechSynthesis) return;
  var msg = new SpeechSynthesisUtterance(
    'Welcome to Sky Blueprint — your all-in-one digital toolkit, built for South Africa.'
  );
  msg.rate = 0.92;
  msg.pitch = 1.0;
  msg.volume = 1;
  // Pick a deep male voice if available
  var voices = window.speechSynthesis.getVoices();
  var male = voices.find(function(v){
    return v.lang.indexOf('en') === 0 && /male|guy|david|mark|james|daniel/i.test(v.name);
  }) || voices.find(function(v){ return v.lang.indexOf('en') === 0; });
  if (male) msg.voice = male;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(msg);
}

// ═══════════════════════════════════════════
// REFERRAL / AFFILIATE
// ═══════════════════════════════════════════
function openReferral() {
  var user = window.currentUser;
  var email = (user && user.email) ? user.email : null;
  var code = email ? btoa(email).replace(/[^a-z0-9]/gi,'').substring(0,8).toUpperCase() : 'SKYREF';
  var link = 'https://skyblueprint.company/?ref=' + code;

  var existing = document.getElementById('ref-modal');
  if (existing) existing.remove();
  var modal = document.createElement('div');
  modal.id = 'ref-modal';
  modal.className = 'modal-overlay';
  modal.onclick = function(e){ if (e.target === modal) modal.remove(); };
  modal.innerHTML =
    '<div style="background:var(--bg,#0f1629);border:1px solid var(--border,rgba(56,189,248,0.2));border-radius:20px;padding:0;max-width:420px;width:100%;max-height:90vh;overflow-y:auto" onclick="event.stopPropagation()">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;padding:24px 24px 0">' +
        '<div>' +
          '<h3 style="color:var(--text,#fff);font-size:19px;margin-bottom:6px">Refer friends. Earn rewards.</h3>' +
          '<p style="color:var(--muted,#94a3b8);font-size:13px;line-height:1.6;margin:0">Share your link and earn commission on each friend\'s first payment.</p>' +
        '</div>' +
        '<button onclick="document.getElementById(\'ref-modal\').remove()" style="background:none;border:none;color:var(--muted,#94a3b8);font-size:20px;cursor:pointer;line-height:1;padding:4px" aria-label="Close">✕</button>' +
      '</div>' +
      '<div style="padding:20px 24px">' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:12px 14px">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>' +
          '<div><div style="font-size:11px;color:var(--muted,#94a3b8)">You earn</div><div style="font-weight:700;color:var(--text,#fff);font-size:14px">R25 per referral</div></div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:18px;background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.2);border-radius:12px;padding:12px 14px">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>' +
          '<div><div style="font-size:11px;color:var(--muted,#94a3b8)">Your friend gets</div><div style="font-weight:700;color:var(--text,#fff);font-size:14px">20% off their first month</div></div>' +
        '</div>' +
        '<div style="font-size:12px;font-weight:700;color:var(--muted,#94a3b8);margin-bottom:8px">Your referral link</div>' +
        '<div style="display:flex;gap:8px;margin-bottom:16px">' +
          '<input id="ref-link-input" readonly value="' + link + '" style="flex:1;min-width:0;background:rgba(255,255,255,0.05);border:1px solid var(--border,rgba(255,255,255,0.12));border-radius:10px;padding:11px 12px;color:var(--text,#fff);font-size:12px;font-family:var(--font)">' +
        '</div>' +
        '<button onclick="copyReferralLink(\'' + link + '\')" style="width:100%;box-sizing:border-box;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:12px;padding:14px;font-size:14px;font-weight:700;cursor:pointer;font-family:var(--font);display:flex;align-items:center;justify-content:center;gap:8px">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
          'Copy referral link' +
        '</button>' +
        '<p style="text-align:center;margin-top:14px"><a href="#" onclick="alert(\'Contact us on WhatsApp 065 601 3544 to track your referrals and get paid.\');return false" style="color:#8b5cf6;font-size:13px;font-weight:600;text-decoration:none">Track your referrals →</a></p>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
}

function copyReferralLink(link) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(link).then(function(){
      var btn = event.target.closest('button');
      if (btn) { var orig = btn.innerHTML; btn.innerHTML = '✓ Copied!'; setTimeout(function(){ btn.innerHTML = orig; }, 2000); }
    }).catch(function(){ alert('Your link: ' + link); });
  } else {
    alert('Your link: ' + link);
  }
}

// ═══════════════════════════════════════════
// TOOL LANDING PAGES — each tool has its own page
// (Hostinger-style: benefits first, then open the tool)
// ═══════════════════════════════════════════
var TOOL_LANDINGS = {
  'website-builder': {
    title: 'Website Builder',
    tag: 'Get a professional business website built for you in 72 hours — no coding, no stress.',
    benefits: [
      'We build it FOR you — just fill in your business details and we handle everything',
      'Delivered in 72 hours, ready to share with customers',
      'Premium option: 5 pages, Paystack payments, .co.za domain (1st year free) and business email'
    ],
    steps: ['Fill in your business details', 'We design and build your site', 'Receive your live website in 72 hours'],
    price: 'From R450 once-off (≈ $25 USD)',
    action: "requireAuth('website-builder')", cta: 'Order My Website'
  },
  'email-cleaner': {
    title: 'AI Email Secretary',
    tag: 'Never drown in your inbox again — AI sorts your emails by priority so you only read what matters.',
    benefits: [
      'Automatically finds urgent emails, invoices and opportunities',
      'Cuts inbox time from hours to minutes every day',
      'Works like a personal secretary, available 24/7'
    ],
    steps: ['Open the tool', 'Paste or connect your emails', 'Get a sorted, prioritised inbox instantly'],
    price: 'Included in your R55/month plan (≈ $3 USD)',
    action: "requireAuth('email-cleaner')", cta: 'Sort My Inbox'
  },
  'find-phone': {
    title: 'Find My Phone',
    tag: 'Lost your phone? Locate it fast — coming soon to Sky Blueprint.',
    benefits: [
      'Locate your phone from any browser',
      'Works even when your phone is on silent',
      'Built for South African networks'
    ],
    steps: ['Create your free account now', 'We notify you the moment it launches', 'Locate your phone in seconds'],
    price: 'Launching soon — included in your R55/month plan (≈ $3 USD)',
    action: "requireAuth('find-phone')", cta: 'Get Notified — Sign Up'
  },
  'ai-mentor': {
    title: 'AI Business Mentor',
    tag: 'Never get stuck again — get a real business plan and expert advice in minutes, any time of day.',
    benefits: [
      '24/7 business coaching that never sleeps',
      'Step-by-step guidance on registering, funding and growing your business in SA',
      'Ask anything — from CIPC registration to marketing your spaza shop'
    ],
    steps: ['Open the mentor', 'Ask your business question', 'Get a clear, practical plan instantly'],
    price: 'Included in your R55/month plan (≈ $3 USD)',
    action: "requireAuth('ai-mentor')", cta: 'Ask My Mentor'
  },
  'cv-builder': {
    title: 'CV Builder & Jobs',
    tag: 'Land your next job faster — build a professional CV and get matched to real openings.',
    benefits: [
      'Professional CV templates employers actually read',
      'Job matching with links to LinkedIn and Indeed openings',
      'Download your CV as a polished PDF in minutes'
    ],
    steps: ['Enter your details and experience', 'Pick a professional template', 'Download your CV and apply'],
    price: 'Included in your R55/month plan (≈ $3 USD)',
    action: "requireAuth('cv-builder')", cta: 'Build My CV'
  },
  'sa-map': {
    title: 'SA Map',
    tag: 'Explore South Africa on a live interactive map — completely free, forever.',
    benefits: [
      'Live interactive map of all 9 provinces',
      'Find places, plan routes and explore your area',
      'Free forever — no subscription needed'
    ],
    steps: ['Click Open', 'Search any place in South Africa', 'Explore the live map'],
    price: '100% Free — no account needed',
    action: "openTool('sa-map')", cta: 'Open SA Map Free'
  },
  'reminders': {
    title: 'Reminders & Tasks',
    tag: 'Never miss a meeting, deadline or family event again — your personal assistant that chimes on time.',
    benefits: [
      'Set reminders that alert you anywhere in the app',
      'Organise tasks for business, school and family',
      'Simple enough to use every single day'
    ],
    steps: ['Add your task or reminder', 'Set the date and time', 'Get chimed when it matters'],
    price: 'Included in your R55/month plan (≈ $3 USD)',
    action: "requireAuth('reminders')", cta: 'Set My First Reminder'
  },
  'learnerships': {
    title: 'Learnerships & Internships',
    tag: 'Find learnerships and internships you actually qualify for — opportunities matched to you.',
    benefits: [
      'Matched to your qualifications and province',
      'Learnerships, internships and graduate programmes in one place',
      'Direct application links — no endless searching'
    ],
    steps: ['Tell us your qualification and area', 'See opportunities that match you', 'Apply directly'],
    price: 'Included in your R55/month plan (≈ $3 USD)',
    action: "requireAuth('learnerships')", cta: 'Find My Opportunity'
  },
  'templates': {
    title: 'Templates Store',
    tag: 'Professional spreadsheet templates that do the maths for you — invoices, budgets, registers and more.',
    benefits: [
      'Auto-calculating invoices, quotes, budgets and wage registers',
      'Built for SA businesses, schools and families',
      'Buy once, keep forever — instant download'
    ],
    steps: ['Browse the store', 'Pick your template', 'Pay once and download instantly'],
    price: 'From R59 once-off per template (≈ $4 USD)',
    action: "openTool('templates')", cta: 'Browse Templates'
  },
  'pdf-tools': {
    title: 'PDF Tools',
    tag: 'Convert any file to PDF instantly — CVs, documents, images, ready to send.',
    benefits: [
      'Convert Word docs and images to professional PDFs',
      'Everything happens in your browser — fast and private',
      'Perfect for CVs, contracts and school documents'
    ],
    steps: ['Upload your file', 'Click convert', 'Download your PDF'],
    price: 'Included in your R55/month plan (≈ $3 USD)',
    action: "requireAuth('pdf-tools')", cta: 'Convert My File'
  },
  'customers': {
    title: 'Customer Manager',
    tag: 'Keep every customer in one place — names, numbers and notes your business can grow on.',
    benefits: [
      'Save customer names, contacts and notes',
      'Never lose a customer number again',
      'Your own mini-CRM, made simple'
    ],
    steps: ['Add your customers', 'Keep notes on every deal', 'Grow repeat business'],
    price: 'Included in your R55/month plan (≈ $3 USD)',
    action: "requireAuth('customers')", cta: 'Manage My Customers'
  },
  'compressor': {
    title: 'File Compressor',
    tag: 'Shrink images, audio and video so they send fast on WhatsApp and email — even on mobile data.',
    benefits: [
      'Compress photos, audio and video in seconds',
      'Save mobile data when sharing files',
      'Smart compression that keeps your quality'
    ],
    steps: ['Upload your file', 'Choose the size you need', 'Download the smaller file'],
    price: 'Included in your R55/month plan (≈ $3 USD)',
    action: "requireAuth('compressor')", cta: 'Compress My File'
  },
  'imgeditor': {
    title: 'Image Editor',
    tag: 'Draw, paint and erase on your photos — quick edits without expensive software.',
    benefits: [
      'Draw and paint directly on any photo',
      'Erase mistakes and unwanted marks',
      'Simple tools that work on any device'
    ],
    steps: ['Upload your image', 'Edit with draw, paint and erase tools', 'Download your edited photo'],
    price: 'Included in your R55/month plan (≈ $3 USD)',
    action: "requireAuth('imgeditor')", cta: 'Edit My Image'
  }
};

function openToolPage(name) {
  var L = TOOL_LANDINGS[name];
  if (!L) { // fallback: behave exactly like before
    if (name === 'sa-map' || name === 'templates') { openTool(name); } else { requireAuth(name); }
    return;
  }
  var check = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:2px"><path d="M20 6 9 17l-5-5"/></svg>';
  var benefitsHtml = L.benefits.map(function(b){
    return '<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:12px">' + check + '<div style="font-size:14px;color:var(--text,#e2e8f0);line-height:1.6">' + b + '</div></div>';
  }).join('');
  var stepsHtml = L.steps.map(function(s, i){
    return '<div style="flex:1;min-width:140px;background:var(--surface-1,rgba(255,255,255,0.04));border:1px solid var(--border,rgba(255,255,255,0.08));border-radius:14px;padding:16px 14px;text-align:center">' +
      '<div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#38bdf8,#6366f1);color:#fff;font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 10px">' + (i+1) + '</div>' +
      '<div style="font-size:13px;color:var(--muted,#94a3b8);line-height:1.5">' + s + '</div></div>';
  }).join('');
  document.getElementById('tool-page-title').textContent = L.title;
  document.getElementById('tool-page-body').innerHTML =
    '<div class="tool-screen" style="max-width:720px;margin:0 auto">' +
      '<h2 style="margin-bottom:10px">' + L.title + '</h2>' +
      '<p style="color:var(--muted,#94a3b8);font-size:15px;line-height:1.7;margin-bottom:24px">' + L.tag + '</p>' +
      '<div style="margin-bottom:26px">' + benefitsHtml + '</div>' +
      '<div style="font-weight:700;color:var(--text,#e2e8f0);font-size:14px;margin-bottom:12px">How it works</div>' +
      '<div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:26px">' + stepsHtml + '</div>' +
      '<div style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.25);border-radius:12px;padding:13px 16px;font-size:13px;color:#38bdf8;font-weight:700;margin-bottom:22px;text-align:center">' + L.price + '</div>' +
      '<button class="btn-primary landing-cta" style="width:100%;box-sizing:border-box;font-size:16px;padding:16px" onclick="' + L.action + '">' + L.cta + ' →</button>' +
      '<p style="text-align:center;margin-top:14px"><a href="#" onclick="showPage(\'home\');return false" style="color:var(--muted,#94a3b8);font-size:13px">← Back to all tools</a></p>' +
    '</div>';
  showPage('tool');
}

document.addEventListener('DOMContentLoaded', function() {
  // Check if user is already logged in
  const saved = safeStorage.getItem('sb_current');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      document.getElementById('dash-greeting').textContent = 'Welcome back, ' + currentUser.fname + '! ';
    } catch(e) {}
  }
  // SECURITY: ask the server for the REAL plan. Overrides any tampered browser value.
  var _tok = safeStorage.getItem('sb_token');
  if (_tok) {
    fetch(BACKEND_URL + '/api/auth/me', {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ token: _tok })
    })
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(data){
      if (data && data.success) {
        currentUser = data.user;
        safeStorage.setItem('sb_current', JSON.stringify(currentUser));
        updateNav();
      } else {
        currentUser = null;
        safeStorage.removeItem('sb_token');
        safeStorage.removeItem('sb_current');
        updateNav();
      }
    })
    .catch(function(){});
  }
  // Update nav to show name + trial days if logged in
  updateNav();
  // Start reminder checker globally so reminders chime anywhere
  if (typeof startReminderChecker === 'function') startReminderChecker();
  // Load and display reviews
  if (typeof loadReviews === 'function') loadReviews();
  // Star picker click handlers
  var starPicker = document.getElementById('rm-stars');
  if (starPicker) {
    starPicker.querySelectorAll('span').forEach(function(s){
      s.addEventListener('click', function(){
        _selectedRating = parseInt(s.getAttribute('data-star'));
        updateStarPicker();
      });
    });
  }
  // Load reviews and set up star picker
  if (typeof loadReviews === 'function') loadReviews();
  if (typeof setupStarPicker === 'function') setupStarPicker();
  // Load Paystack script
  const ps = document.createElement('script');
  ps.src = 'https://js.paystack.co/v1/inline.js';
  document.head.appendChild(ps);
});

// ══════════════════════════════════════
// SKY BLUEPRINT AI GUIDE ASSISTANT v2
// Full knowledge of every tool and step
// ══════════════════════════════════════

var guideOpen = false;
var guideState = { step: 'welcome', tool: null, data: {} };

function toggleGuide() {
  guideOpen = !guideOpen;
  var win = document.getElementById('guide-window');
  var fab = document.getElementById('guide-fab-label');
  if (guideOpen) {
    win.classList.remove('guide-hidden');
    fab.textContent = 'Close guide';
    if (document.getElementById('guide-messages').children.length === 0) {
      startGuide();
    }
  } else {
    win.classList.add('guide-hidden');
    fab.textContent = 'Need help?';
  }
}

function guideMsg(text, delay) {
  delay = delay || 0;
  return new Promise(function(resolve) {
    setTimeout(function() {
      var msgs = document.getElementById('guide-messages');
      var typing = document.createElement('div');
      typing.className = 'gm-bot';
      typing.id = 'gm-typing-indicator';
      typing.innerHTML = '<div class="gm-bot-icon"></div><div class="gm-bot-bubble"><div class="gm-typing"><span></span><span></span><span></span></div></div>';
      msgs.appendChild(typing);
      msgs.scrollTop = msgs.scrollHeight;
      setTimeout(function() {
        var t = document.getElementById('gm-typing-indicator');
        if (t) t.remove();
        var bubble = document.createElement('div');
        bubble.className = 'gm-bot';
        bubble.innerHTML = '<div class="gm-bot-icon"></div><div class="gm-bot-bubble">' + text + '</div>';
        msgs.appendChild(bubble);
        msgs.scrollTop = msgs.scrollHeight;
        resolve();
      }, 600 + Math.min(text.length * 8, 1500));
    }, delay);
  });
}

function guideUserSay(text) {
  var msgs = document.getElementById('guide-messages');
  var bubble = document.createElement('div');
  bubble.className = 'gm-user';
  bubble.innerHTML = '<div class="gm-user-bubble">' + text + '</div>';
  msgs.appendChild(bubble);
  msgs.scrollTop = msgs.scrollHeight;
}

function guideOptions(opts) {
  var el = document.getElementById('guide-options');
  el.innerHTML = '';
  opts.forEach(function(opt) {
    var btn = document.createElement('button');
    btn.className = 'g-opt';
    btn.textContent = opt.label;
    btn.onclick = function() {
      el.innerHTML = '';
      guideUserSay(opt.label);
      opt.action();
    };
    el.appendChild(btn);
  });
}

function guideClear() {
  document.getElementById('guide-options').innerHTML = '';
}

function guideUserInput() {
  var inp = document.getElementById('guide-input');
  var val = inp.value.trim();
  if (!val) return;
  inp.value = '';
  guideUserSay(val);
  guideHandleInput(val);
}

// ── WELCOME ──
async function startGuide() {
  guideState = { step: 'welcome', tool: null, data: {} };
  await guideMsg('Hello! Welcome to <strong>Sky Blueprint</strong>!<br><br>I am <strong>Sky Guide</strong> — your personal assistant. I know every tool on this platform and I will walk you through anything step by step.<br><br>Can I help you today?');
  guideOptions([
    { label: '✅ Yes please help me!', action: showToolMenu },
    { label: 'What is Sky Blueprint?', action: explainPlatform },
    { label: 'Tell me about pricing', action: explainPricing },
    { label: 'No thanks, I know what to do', action: guideDismiss }
  ]);
}

async function explainPlatform() {
  await guideMsg('Sky Blueprint is a South African digital platform with <strong>13 powerful tools</strong> in one place:<br><br><strong>Website Builder</strong> — build your business website<br><strong>AI Email Secretary</strong> — sort your real Gmail, Outlook or Yahoo inbox<br><strong>CV Builder</strong> — build your CV and find matching jobs<br><strong>Learnerships & Internships</strong> — find opportunities you qualify for<br><strong>Find My Phone</strong> — track your phone if lost or stolen<br><strong>AI Business Mentor</strong> — get business advice 24/7<br><strong>Reminders & Tasks</strong> — never miss a meeting or task<br><strong>SA Map</strong> — explore South Africa (FREE for everyone)<br><br>All tools in one subscription — R55/month or R1,980/year!');
  guideOptions([
    { label: 'Let me start using the tools!', action: showToolMenu },
    { label: 'Tell me about pricing', action: explainPricing },
  ]);
}

async function explainPricing() {
  await guideMsg('Sky Blueprint has 3 simple plans:<br><br><strong>Free Trial</strong> — 7 days full access, no credit card needed<br><br><strong>Monthly Plan — R55/month</strong><br>Pay every month via Paystack. Cancel anytime. Auto-debit from your card.<br><br><strong>3-Year Plan — R1,980 once-off</strong><br>Pay once, use for 3 full years. Save money long term!<br><br><strong>Find My Phone — R450 once-off</strong><br>One time activation fee to register and track your device.<br><br>Payments are processed securely by <strong>Paystack</strong> — Visa, Mastercard, EFT, Ozow all accepted.');
  guideOptions([
    { label: '✅ Start my free trial!', action: function() { showPage('signup'); toggleGuide(); } },
    { label: 'Show me the tools', action: showToolMenu },
  ]);
}

// ── TOOL MENU ──
async function showToolMenu() {
  await guideMsg('Which tool do you need help with?');
  guideOptions([
    { label: 'Website Builder', action: function() { guideTool('website-builder'); } },
    { label: 'Email Cleaner', action: function() { guideTool('email-cleaner'); } },
    { label: 'Find My Phone', action: function() { guideTool('find-phone'); } },
    { label: 'AI Business Mentor', action: function() { guideTool('ai-mentor'); } },
    { label: 'CV Builder & Jobs', action: function() { guideTool('cv-builder'); } },
    { label: 'SA Map (Free)', action: function() { guideTool('sa-map'); } },
    { label: '❓ I have another question', action: function() {
      guideMsg('Go ahead — type your question below and I will answer it!');
      guideState.step = 'freeask';
      document.getElementById('guide-input').placeholder = 'Type your question here...';
    }}
  ]);
}

async function guideTool(tool) {
  guideState.tool = tool;
  var flows = {
    'website-builder': guideWebsite,
    'email-cleaner': guideEmail,
    'find-phone': guidePhone,
    'ai-mentor': guideAI,
    'cv-builder': guideCV,
    'sa-map': guideMap,
  };
  if (flows[tool]) flows[tool]();
}

// ── WEBSITE BUILDER ──
async function guideWebsite() {
  await guideMsg('Let me open the Website Builder for you!');
  requireAuth('website-builder');
  await guideMsg('The Website Builder creates a professional website for your business in minutes. Here are the steps:<br><br><strong>Step 1</strong> — Type your <strong>Business Name</strong> in the first box<br>Example: Sipho Tech Shop or "M&H Dynamic Tech"<br><br>What is your business name?');
  guideState.step = 'wb-name';
  document.getElementById('guide-input').placeholder = 'Type your business name...';
}

// ── EMAIL CLEANER ──
async function guideEmail() {
  await guideMsg('Let me open the Email Cleaner!');
  requireAuth('email-cleaner');
  await guideMsg('The Email Cleaner connects to your REAL email account and uses AI to sort important emails from spam — then deletes the junk for you.<br><br>Which email provider do you use?');
  guideOptions([
    { label: 'Gmail (Google)', action: guideEmailGmail },
    { label: 'Outlook / Hotmail', action: guideEmailOutlook },
    { label: 'Yahoo Mail', action: guideEmailYahoo },
  ]);
}

async function guideEmailGmail() {
  await guideMsg('To connect your Gmail to Sky Blueprint, follow these exact steps I will walk you through one by one:<br><br>⚠️ <strong>Important:</strong> You cannot use your normal Gmail password here. Gmail requires a special <strong>App Password</strong> for security. Here is how to get it:');
  await guideMsg('1️⃣ <strong>Open a new tab on your COMPUTER</strong> — not your phone browser<br><br>Go to: <strong>myaccount.google.com</strong><br>Sign in with your Gmail account if asked');
  await guideMsg('2️⃣ <strong>Click "Security"</strong> on the left side menu<br><br>You will see a page called "Security & sign-in"');
  await guideMsg('3️⃣ <strong>Scroll down</strong> until you see <strong>"2-Step Verification"</strong><br><br>Click on it → follow the steps to turn it ON → verify with your phone number when asked<br><br>Once it shows <strong>"On"</strong> with a green tick — you are ready for the next step');
  await guideMsg('4️⃣ <strong>Go back to the Security page</strong> → scroll down again<br><br>Now you will see <strong>"App Passwords"</strong> listed below 2-Step Verification<br><br>Click on <strong>App Passwords</strong>');
  await guideMsg('5️⃣ You will see a box that says <strong>"App name"</strong><br><br>Type exactly: <strong>Sky Blueprint</strong><br><br>Then click the <strong>Create</strong> button');
  await guideMsg('6️⃣ Google will show you a <strong>16-character password</strong> like this:<br><br><code style="background:#1a1a2e;padding:6px 10px;border-radius:4px;color:#38bdf8;font-size:14px;letter-spacing:3px">abcd efgh ijkl mnop</code><br><br>⚠️ <strong>Copy it now</strong> — it only shows once! Select all the characters including spaces → copy');
  await guideMsg('7️⃣ <strong>Come back to Sky Blueprint Email Cleaner</strong><br><br>Click <strong>Gmail</strong> → Enter your Gmail address → In the password box paste the <strong>16-character code</strong> Google gave you → Click <strong>Scan My Inbox</strong><br><br>Your real emails will load and AI will sort Important from Spam automatically! ✅');
  guideOptions([
    { label: '✅ It is working — emails loaded!', action: async function() {
      await guideMsg('Excellent! Your inbox is now connected!<br><br>You will see two sections:<br>✅ <strong>Important Emails</strong> — emails you need to keep<br><strong>Spam Emails</strong> — junk mail you can delete<br><br>You can:<br>• Delete spam one by one using the <strong>Delete</strong> button<br>• Delete all spam at once using <strong>Delete All Spam</strong> button<br><br>This frees up storage on your device and keeps your inbox clean!');
      guideOptions([
        { label: '⬅️ Back to tools', action: showToolMenu },
        { label: 'Thank you, I am done!', action: guideDismiss }
      ]);
    }},
    { label: '❓ I cannot find App Passwords', action: async function() {
      await guideMsg('App Passwords only appears on a <strong>computer browser</strong> — not on a phone browser.<br><br>Also make sure <strong>2-Step Verification is turned ON first</strong> — App Passwords will not show if 2-Step Verification is OFF.<br><br>Steps again:<br>1️⃣ Computer browser → myaccount.google.com<br>2️⃣ Security → 2-Step Verification → Turn ON<br>3️⃣ Security → scroll down → App Passwords<br>4️⃣ Type Sky Blueprint → Create → copy the 16 characters');
    }},
    { label: '❓ It still shows connection error', action: async function() {
      await guideMsg('Check these things one by one:<br><br>✅ Gmail address is spelled correctly<br>✅ App Password is pasted correctly — all 16 characters with spaces<br>✅ 2-Step Verification is ON in your Google Account<br>✅ You are connected to the internet<br>✅ You opened myaccount.google.com on a COMPUTER not a phone<br><br>If still not working — go to <strong>myaccount.google.com/apppasswords</strong> and create a brand new App Password and try again');
    }}
  ]);
}

async function guideEmailOutlook() {
  await guideMsg('Good news — Outlook is easier than Gmail!<br><br>1️⃣ Click <strong>Outlook</strong> on the Email Cleaner screen<br>2️⃣ Enter your Outlook email address (example@outlook.com or example@hotmail.com)<br>3️⃣ Enter your <strong>normal Outlook password</strong><br>4️⃣ Click <strong>Scan My Inbox</strong><br><br>Outlook does not need a special App Password — your normal password works!');
  guideOptions([
    { label: '✅ Got it!', action: showToolMenu },
    { label: '❓ It shows error', action: async function() {
      await guideMsg('If Outlook shows an error:<br><br>✅ Check your email address is spelled correctly<br>✅ Make sure your Outlook password is correct<br>✅ If you use Microsoft 2-factor auth, you may need an App Password from <strong>account.microsoft.com/security</strong>');
    }}
  ]);
}

async function guideEmailYahoo() {
  await guideMsg('Yahoo also needs an App Password for security.<br><br>1️⃣ Go to <strong>login.yahoo.com</strong><br>2️⃣ Click your profile → <strong>Account Security</strong><br>3️⃣ Turn on <strong>2-Step Verification</strong><br>4️⃣ Click <strong>Generate App Password</strong><br>5️⃣ Select "Other App" → type <strong>Sky Blueprint</strong> → Generate<br>6️⃣ Copy the password → come back → use it in Email Cleaner');
  guideOptions([
    { label: '✅ Got it!', action: showToolMenu },
  ]);
}

// ── FIND MY PHONE ──
async function guidePhone() {
  await guideMsg('Let me open Find My Phone!');
  requireAuth('find-phone');
  await guideMsg('Find My Phone lets you track, ring, lock or wipe your phone remotely if it is lost or stolen.<br><br>⚠️ There is a <strong>once-off R450 activation fee</strong> to use this tool. This funds the development of the Sky Blueprint tracking app.<br><br>What you get with R450:<br>✅ Register unlimited devices<br>✅ Live GPS tracking on SA map<br>✅ Get directions to your phone<br>✅ Ring your phone remotely<br>✅ Lock your phone remotely<br>✅ See 7 days of location history<br><br>Would you like to proceed?');
  guideOptions([
    { label: '✅ Yes, pay R450 and activate', action: async function() {
      await guideMsg('To pay and activate:<br><br>1️⃣ Click <strong>Pay R450 & Activate Now</strong> on the screen<br>2️⃣ Enter your Full Name, Email and Phone Number<br>3️⃣ Click <strong>Pay Securely with Paystack</strong><br>4️⃣ Complete payment with your card, EFT or Ozow<br>5️⃣ After payment you go to the <strong>Register Device</strong> screen');
      guideOptions([
        { label: 'How to register my device?', action: guidePhoneRegister },
        { label: '🔍 How to track my phone?', action: guidePhoneTrack },
      ]);
    }},
    { label: '❓ Tell me more first', action: async function() {
      await guideMsg('Find My Phone works with the Sky Blueprint tracking app on your device.<br><br>Once you register your device and download the app, it silently records your phone GPS location every few minutes.<br><br>If your phone is stolen — log into Sky Blueprint from any device → open Find My Phone → see the last known location on the SA map → ring it, lock it or wipe it remotely.<br><br>This has already helped many people recover their stolen phones in South Africa!');
      guideOptions([
        { label: '✅ Lets activate it!', action: function() { guideTool('find-phone'); }},
        { label: '⬅️ Back to tools', action: showToolMenu },
      ]);
    }}
  ]);
}

async function guidePhoneRegister() {
  await guideMsg('To register your device:<br><br>1️⃣ Click the <strong>Register Device</strong> tab<br>2️⃣ Enter your <strong>Full Name</strong><br>3️⃣ Enter your <strong>Phone Number</strong><br>4️⃣ Enter your <strong>Device Make & Model</strong> (example: Samsung Galaxy A54)<br>5️⃣ Enter your <strong>IMEI number</strong> — to find it dial <strong>*#06#</strong> on your phone<br>6️⃣ Enter your device colour<br>7️⃣ Click <strong>Register My Device</strong><br><br>Your device is now protected! ✅');
  guideOptions([
    { label: '🔍 How to track my phone now?', action: guidePhoneTrack },
    { label: '⬅️ Back to tools', action: showToolMenu },
  ]);
}

async function guidePhoneTrack() {
  await guideMsg('To track your phone:<br><br>1️⃣ Click the <strong>Track Device</strong> tab<br>2️⃣ Click <strong>Locate My Device</strong> button<br>3️⃣ The map will show your phone last known location<br>4️⃣ You can also:<br>&nbsp;&nbsp;Click <strong>Get Directions</strong> to get Google Maps directions to your phone<br>&nbsp;&nbsp;️ Click <strong>Street View</strong> to see the street your phone is on<br>&nbsp;&nbsp;Click <strong>Ring Device</strong> to make it ring loudly<br>&nbsp;&nbsp;Click <strong>Lock Device</strong> to lock the screen remotely<br>5️⃣ Click <strong>Location History</strong> tab to see where your phone has been for the last 7 days');
  guideOptions([
    { label: '⬅️ Back to tools', action: showToolMenu },
  ]);
}

// ── AI BUSINESS MENTOR ──
async function guideAI() {
  await guideMsg('Let me open the AI Business Mentor!');
  requireAuth('ai-mentor');
  await guideMsg('The AI Business Mentor is your <strong>24/7 South African business coach</strong>. It knows everything about:<br><br>✅ CIPC business registration (R175 fee at cipc.co.za)<br>✅ SARS tax and eFiling<br>✅ SMME funding (SEFA, IDC, NEF, Khula)<br>✅ BEE/BBBEE compliance<br>✅ Load shedding business strategies<br>✅ Marketing on social media<br>✅ Writing a business plan<br>✅ Starting any type of business in SA<br><br>Just type your question in the chat box at the bottom and press Send!<br><br>Here are some questions to get you started:');
  guideOptions([
    { label: 'How do I register my business?', action: async function() {
      await guideMsg('Type that question in the AI chat box and press Send. The AI will explain exactly how to register at CIPC — the cost, the steps and how long it takes.<br><br>Tip: You can ask follow up questions too — like "What about tax?" or "Do I need BEE compliance?"');
    }},
    { label: 'How do I get funding in SA?', action: async function() {
      await guideMsg('Type that in the chat! The AI will tell you about SEFA, IDC, NEF, the DTI and other funding sources for small businesses in South Africa — including which ones you qualify for based on your business type.');
    }},
    { label: 'How do I write a business plan?', action: async function() {
      await guideMsg('Ask the AI to write a business plan for you! Just type: "Help me write a business plan for [your business type]" and it will create a full professional plan for you.');
    }},
    { label: '✏️ I want to ask my own question', action: async function() {
      await guideMsg('Go ahead! Type anything in the AI chat box below the chat window. The mentor knows everything about South African business. I am here if you need me! ');
      guideOptions([{ label: '⬅️ Back to tools', action: showToolMenu }]);
    }}
  ]);
}

// ── CV BUILDER ──
async function guideCV() {
  await guideMsg('Let me open the CV Builder!');
  requireAuth('cv-builder');
  await guideMsg('The CV Builder creates your professional CV and finds jobs that match your exact qualification level. Let me guide you step by step!<br><br><strong>Step 1</strong> — Enter your <strong>First Name</strong> in the first box.<br><br>What is your first name?');
  guideState.step = 'cv-firstname';
  document.getElementById('guide-input').placeholder = 'Type your first name...';
}

// ── SA MAP ──
async function guideMap() {
  await guideMsg('Opening the SA Map — this is completely FREE for everyone, no login needed! ');
  openTool('sa-map');
  await guideMsg('The SA Map lets you explore anywhere in South Africa. Here is how to use it:<br><br>1️⃣ Type any <strong>city, suburb, street or address</strong> in the search box at the top<br>Example: "Cape Town CBD" or "Sandton Johannesburg" or "15 Long Street Cape Town"<br>2️⃣ Click <strong>Search</strong> or press Enter<br>3️⃣ The map zooms in to that exact location<br>4️⃣ Or just click one of the <strong>quick city buttons</strong> below the map — Cape Town, Johannesburg, Durban, Pretoria and more!<br><br>You can also use it to find directions, check an area before visiting, or track your registered phone location!');
  guideOptions([
    { label: '✅ Got it, let me explore!', action: async function() {
      await guideMsg('Enjoy! 🇿🇦 The map works on both phone and desktop. Come back to me anytime!');
      guideOptions([{ label: '⬅️ Back to tools', action: showToolMenu }]);
    }},
    { label: '⬅️ Back to tools', action: showToolMenu }
  ]);
}

// ── INPUT HANDLER ──
function guideHandleInput(val) {
  var step = guideState.step;

  if (step === 'wb-name') {
    guideState.data.name = val;
    guideState.step = 'wb-desc';
    guideMsg('<strong>' + val + '</strong> — great business name! ✅<br><br><strong>Step 2</strong> — Now describe what your business does in the second box.<br><br>Example: "We sell refurbished laptops and phones across South Africa at affordable prices"<br><br>What does your business do?');
    document.getElementById('guide-input').placeholder = 'Describe your business...';
    return;
  }

  if (step === 'wb-desc') {
    guideState.step = 'wb-contact';
    guideMsg('Perfect description! ✅<br><br><strong>Step 3</strong> — Fill in your <strong>Phone Number</strong> and <strong>Email Address</strong><br><br><strong>Step 4</strong> — Choose your <strong>Business Type</strong> from the dropdown<br><br><strong>Step 5</strong> — Choose your favourite <strong>Colour Theme</strong><br><br><strong>Step 6</strong> — Click the big <strong>Generate My Website</strong> button!');
    guideOptions([
      { label: 'I clicked Generate!', action: async function() {
        await guideMsg('Your website is generated! You will see the steps to publish it live on GitHub for free.<br><br>Your website will be live at:<br><strong>your-business-name.github.io</strong><br><br>Need help publishing it? Ask me!');
        guideOptions([
          { label: '❓ How do I publish it?', action: async function() {
            await guideMsg('To publish your website for free:<br><br>1️⃣ Go to <strong>github.com</strong> → create a free account<br>2️⃣ Click <strong>+</strong> → New repository → name it your business name<br>3️⃣ Set it to <strong>Public</strong> → Create<br>4️⃣ Click <strong>Add file → Upload files</strong> → upload your 3 files<br>5️⃣ Click <strong>Settings → Pages → main branch → Save</strong><br>6️⃣ Wait 3 minutes → your site is LIVE! ');
          }},
          { label: '⬅️ Back to tools', action: showToolMenu }
        ]);
      }}
    ]);
    return;
  }

  if (step === 'cv-firstname') {
    guideState.data.fname = val;
    guideState.step = 'cv-lastname';
    guideMsg('Nice to meet you <strong>' + val + '</strong>! <br><br><strong>Step 2</strong> — Enter your <strong>Last Name / Surname</strong>');
    document.getElementById('guide-input').placeholder = 'Type your surname...';
    return;
  }

  if (step === 'cv-lastname') {
    guideState.data.lname = val;
    guideState.step = 'cv-qual';
    guideMsg('Great! <strong>' + guideState.data.fname + ' ' + val + '</strong> ✅<br><br><strong>Step 3</strong> — Fill in your <strong>Email</strong> and <strong>Phone Number</strong><br><br><strong>Step 4</strong> — Upload a <strong>Profile Photo</strong> if you want (optional — click the Upload Photo button)<br><br><strong>Step 5</strong> — Select your <strong>Highest Qualification</strong> from the dropdown. This is VERY important — it determines which jobs you qualify for!<br><br>Options are: Matric, N4, N5, N6/Trade, Diploma, Degree, Honours, Masters, PhD');
    guideOptions([
      { label: '✅ I selected my qualification', action: async function() {
        await guideMsg('<strong>Step 6</strong> — Fill in your <strong>Work Experience</strong><br>Enter your last job title, company name, start and end dates.<br><br>If you have no experience that is fine — just select "No experience" in the Years dropdown.<br><br>Then fill in your <strong>Professional Summary</strong> — a short description of yourself and your skills.');
        guideOptions([
          { label: '✅ Done with experience', action: async function() {
            await guideMsg('<strong>Step 7</strong> — Add your <strong>Skills</strong> separated by commas.<br><br>Examples: Microsoft Office, Customer Service, Driving Licence, Python, Sales, Welding<br><br>Then click <strong>Build CV & Find Matching Jobs</strong>!');
            guideOptions([
              { label: 'I clicked Build CV!', action: async function() {
                await guideMsg('Your CV is built!<br><br>The AI has detected your qualification level and is showing you only jobs you qualify for on:<br><br><strong>LinkedIn</strong><br>🔍 <strong>Indeed SA</strong><br><strong>Pnet SA</strong><br><strong>YouthMobi</strong><br><br>Click any of those buttons to see real job listings that match your CV!<br><br>To save your CV — click <strong>Print / Save as PDF</strong> at the bottom.');
                guideOptions([
                  { label: '⬅️ Back to tools', action: showToolMenu },
                  { label: 'I am done, thank you!', action: guideDismiss }
                ]);
              }}
            ]);
          }}
        ]);
      }}
    ]);
    return;
  }

  if (step === 'freeask' || !step) {
    guideAIAnswer(val);
    return;
  }

  guideAIAnswer(val);
}

// ── AI FREE ANSWER ──
async function guideAIAnswer(question) {
  await guideMsg('Let me find the answer for you... ');
  try {
    var res = await fetch(BACKEND_URL + '/api/ai-mentor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: question }],
        mode: 'guide'
      })
    });
    var data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI service error');
    var reply = data.reply || 'I am not sure about that. Try asking the AI Business Mentor for more detailed help!';
    await guideMsg(reply.replace(/\n/g, '<br>'));
  } catch(e) {
    await guideMsg('I am having trouble connecting right now. Please check your internet and try again, or use the AI Business Mentor tool for detailed help!');
  }
  guideOptions([
    { label: '⬅️ Back to tools menu', action: showToolMenu },
    { label: '❓ Ask another question', action: function() {
      guideClear();
      guideState.step = 'freeask';
      document.getElementById('guide-input').placeholder = 'Type your question...';
    }}
  ]);
}

async function guideDismiss() {
  await guideMsg('No problem! I am always here whenever you need help. Just click the <strong>"Need help?"</strong> button at the bottom right of the screen anytime. Good luck! 🇿🇦');
  guideOptions([
    { label: 'Thanks, bye!', action: function() { toggleGuide(); } }
  ]);
}

// Auto-greet after 8 seconds on homepage (once per session)
setTimeout(function() {
  if (!safeSession.getItem('guide_greeted') && !guideOpen) {
    safeSession.setItem('guide_greeted', '1');
    toggleGuide();
  }
}, 8000);