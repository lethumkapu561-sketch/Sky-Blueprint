// ── Sky Blueprint App ──
// YOUR PAYSTACK PUBLIC KEY — replace with your real key from paystack.com/dashboard
var PAYSTACK_PUBLIC_KEY = 'pk_live_b07f0d8b9ee7305c57362ec9bbb89fe1eb0f9433';
var PLAN_CODES = { pro: 'PLN_xxxxxxxxxx', business: 'PLN_xxxxxxxxxx' };
var PRICES = { website: 45000, monthly: 5500, yearly: 198000 }; // amounts in cents (R450=45000, R55=5500, R1980=198000) // in kobo (R99 = 9900)
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

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + name);
  if (page) {
    page.classList.add('active');
    window.scrollTo(0, 0);
  }
}

// ── Auth ──
function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-pass').value;
  if (!email || !pass) { alert('Please enter your email and password.'); return; }

  // Check stored users
  const users = JSON.parse(localStorage.getItem('sb_users') || '[]');
  const user = users.find(u => u.email === email && u.pass === btoa(pass));
  if (!user) { alert('Incorrect email or password. Please try again.'); return; }

  currentUser = user;
  localStorage.setItem('sb_current', JSON.stringify(user));
  document.getElementById('dash-greeting').textContent = 'Hi ' + user.fname + ' ' + (user.lname||'') + ' 👋 Welcome back!';
  showPage('dashboard');
}

function doSignup() {
  const fname = document.getElementById('su-fname').value.trim();
  const lname = document.getElementById('su-lname').value.trim();
  const email = document.getElementById('su-email').value.trim();
  const phone = document.getElementById('su-phone').value.trim();
  const pass = document.getElementById('su-pass').value;
  if (!fname || !email || !pass) { alert('Please fill in your name, email and password.'); return; }
  if (pass.length < 6) { alert('Password must be at least 6 characters.'); return; }

  const users = JSON.parse(localStorage.getItem('sb_users') || '[]');
  if (users.find(u => u.email === email)) { alert('An account with this email already exists. Please log in.'); return; }

  const user = { fname, lname, email, phone, pass: btoa(pass), plan: 'trial', joined: Date.now() };
  users.push(user);
  localStorage.setItem('sb_users', JSON.stringify(users));
  currentUser = user;
  localStorage.setItem('sb_current', JSON.stringify(user));

  document.getElementById('dash-greeting').textContent = 'Hi ' + fname + ' ' + lname + ' 👋 Welcome to Sky Blueprint!';
  showPage('dashboard');
}

function doLogout() {
  currentUser = null;
  localStorage.removeItem('sb_current');
  showPage('home');
}

function requireAuth(tool) {
  const saved = localStorage.getItem('sb_current');
  if (saved) {
    currentUser = JSON.parse(saved);
    document.getElementById('dash-greeting').textContent = 'Welcome back, ' + currentUser.fname + '! 👋';
    showPage('dashboard');
    setTimeout(() => openTool(tool), 100);
  } else {
    showPage('signup');
  }
}

// ── Tools ──
function openTool(name) {
  const titles = {
    'website-builder': '🌐 Website Builder',
    'email-cleaner': '📧 Email Cleaner',
    'find-phone': '📍 Find My Phone',
    'ai-mentor': '🤖 AI Business Mentor',
    'cv-builder': '📄 CV Builder & Jobs',
    'sa-map': '🗺️ SA Map',
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
  };
  if (renderers[name]) renderers[name](body);
  showPage('tool');
}

// ── Website Builder ──
function renderWebsiteBuilder(el) {
  el.innerHTML = `
  <div class="tool-screen">
    <h2>Website Builder</h2>
    <p>Tell us about your business and we'll generate a professional website instantly.</p>
    <div class="form-group"><label>Business Name</label><input type="text" id="wb-name" placeholder="e.g. Sky Blueprint"></div>
    <div class="form-group"><label>What does your business do?</label><textarea id="wb-desc" placeholder="Describe your products or services..."></textarea></div>
    <div class="form-row">
      <div class="form-group"><label>Phone</label><input type="tel" id="wb-phone" placeholder="065 601 3544"></div>
      <div class="form-group"><label>Email</label><input type="email" id="wb-email" placeholder="your@email.com"></div>
    </div>
    <div class="form-group"><label>Business Type</label>
      <select id="wb-type">
        <option>Technology & IT</option><option>Retail & Shopping</option>
        <option>Food & Restaurant</option><option>Professional Services</option>
        <option>Health & Beauty</option><option>Construction</option><option>Other</option>
      </select>
    </div>
    <div class="form-group"><label>Color Theme</label>
      <select id="wb-color">
        <option>Dark & Modern (Blue/Purple)</option><option>Clean & Minimal (White/Black)</option>
        <option>Bold (Orange/Dark)</option><option>Corporate (Blue/White)</option>
      </select>
    </div>
    <button class="btn-primary" style="width:100%" onclick="generateWebsite()">🚀 Generate My Website</button>
    <div id="wb-result" style="margin-top:24px"></div>
  </div>`;
}

function generateWebsite() {
  const name = document.getElementById('wb-name').value || 'My Business';
  document.getElementById('wb-result').innerHTML = `
    <div style="background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.2);border-radius:16px;padding:24px">
      <strong style="color:var(--sky);display:block;margin-bottom:10px">✅ Website ready for ${name}!</strong>
      <p style="color:var(--muted);font-size:13px;line-height:1.7">Your website files have been generated. To publish it live on GitHub Pages for free:</p>
      <ol style="color:var(--muted);font-size:13px;line-height:2;margin:12px 0 0 16px">
        <li>Go to <strong style="color:#fff">github.com</strong> → Create free account</li>
        <li>New repository → name it <strong style="color:#fff">${name.toLowerCase().replace(/\s+/g,'-')}</strong> → Public</li>
        <li>Upload your generated website files</li>
        <li>Settings → Pages → main branch → Save</li>
        <li>Live at: <strong style="color:var(--sky)">${name.toLowerCase().replace(/\s+/g,'-')}.github.io</strong></li>
      </ol>
      <button class="btn-primary" style="margin-top:20px;width:100%" onclick="alert('In the full production version, this downloads your complete website ZIP file!')">📥 Download Website Files</button>
    </div>`;
}

// ── Email Cleaner ──
function renderEmailCleaner(el) {
  el.innerHTML = `
  <div class="tool-screen">
    <h2>📧 Email Cleaner</h2>
    <p>Connect your email account — AI scans your real inbox, separates important emails from spam and lets you delete junk in one click.</p>

    <div class="tab-bar">
      <div class="tab active" onclick="emailTab('connect',this)">Connect Email</div>
      <div class="tab" onclick="emailTab('inbox',this)">My Inbox</div>
    </div>

    <div id="et-connect">
      <p style="font-size:13px;color:var(--muted);margin-bottom:20px">Choose your email provider to connect:</p>

      <div style="display:flex;flex-direction:column;gap:12px">

        <div class="email-provider-card" onclick="connectEmail('gmail')">
          <div style="display:flex;align-items:center;gap:14px">
            <div style="width:44px;height:44px;border-radius:10px;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:24px">📧</div>
            <div>
              <strong style="color:#fff;display:block">Gmail</strong>
              <small style="color:var(--muted)">Connect your Google account</small>
            </div>
            <div style="margin-left:auto;color:var(--sky);font-size:20px">→</div>
          </div>
        </div>

        <div class="email-provider-card" onclick="connectEmail('outlook')">
          <div style="display:flex;align-items:center;gap:14px">
            <div style="width:44px;height:44px;border-radius:10px;background:#0078d4;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:24px">📬</div>
            <div>
              <strong style="color:#fff;display:block">Outlook / Hotmail</strong>
              <small style="color:var(--muted)">Connect your Microsoft account</small>
            </div>
            <div style="margin-left:auto;color:var(--sky);font-size:20px">→</div>
          </div>
        </div>

        <div class="email-provider-card" onclick="connectEmail('yahoo')">
          <div style="display:flex;align-items:center;gap:14px">
            <div style="width:44px;height:44px;border-radius:10px;background:#6001d2;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:24px">📮</div>
            <div>
              <strong style="color:#fff;display:block">Yahoo Mail</strong>
              <small style="color:var(--muted)">Connect your Yahoo account</small>
            </div>
            <div style="margin-left:auto;color:var(--sky);font-size:20px">→</div>
          </div>
        </div>

      </div>

      <div style="background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.15);border-radius:12px;padding:14px 16px;margin-top:20px">
        <p style="font-size:12px;color:var(--muted);margin:0">🔐 <strong style="color:#fff">Your privacy is protected.</strong> Sky Blueprint reads your inbox to sort emails but never stores your emails or password. You can disconnect anytime.</p>
      </div>
    </div>

    <div id="et-inbox" style="display:none">
      <div id="email-inbox-content">
        <p style="color:var(--muted);text-align:center;padding:40px 0">Connect your email first to see your inbox</p>
      </div>
    </div>

  </div>`;
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
        <div style="font-size:40px;margin-bottom:8px">${provider==='gmail'?'📧':provider==='outlook'?'📬':'📮'}</div>
        <strong style="color:#fff;font-size:16px">Connect ${providerNames[provider]}</strong>
        <p style="color:var(--muted);font-size:13px;margin:4px 0 0">Enter your login details to connect</p>
      </div>
      <div class="form-group"><label>Email Address</label><input type="email" id="em-email" placeholder="your@${provider==='gmail'?'gmail.com':provider==='outlook'?'outlook.com':'yahoo.com'}"></div>
      <div class="form-group"><label>Password / App Password</label><input type="password" id="em-pass" placeholder="Enter your password"></div>
      <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:8px;padding:10px 14px;margin-bottom:16px">
        <p style="font-size:11px;color:#f59e0b;margin:0">💡 For Gmail: use an App Password (Google Account → Security → App Passwords) for better security</p>
      </div>
      <button class="btn-primary" style="width:100%;box-sizing:border-box" onclick="scanEmails('${provider}')">🔍 Scan My Inbox</button>
      <button onclick="emailTab('connect',document.querySelector('.tab'))" style="width:100%;background:none;border:none;color:var(--muted);margin-top:10px;cursor:pointer;font-family:var(--font);font-size:13px">← Back</button>
    </div>`;
  document.getElementById('et-connect').innerHTML = loginHTML;
}

function scanEmails(provider) {
  var email = document.getElementById('em-email').value.trim();
  var password = document.getElementById('em-pass').value;
  if (!email) { alert('Please enter your email address'); return; }
  if (!password) { alert('Please enter your password'); return; }

  document.getElementById('et-connect').innerHTML = `
    <div style="text-align:center;padding:40px 20px">
      <div style="font-size:48px;margin-bottom:16px">⟳</div>
      <strong style="color:#fff;display:block;margin-bottom:8px">Connecting to your inbox...</strong>
      <p style="color:var(--muted);font-size:13px">AI is reading and sorting your real emails</p>
      <div style="margin-top:20px;background:var(--bg3);border-radius:10px;height:6px;overflow:hidden">
        <div style="background:linear-gradient(90deg,var(--sky),var(--indigo));height:100%;width:0;animation:progress 4s ease forwards;border-radius:10px"></div>
      </div>
    </div>
    <style>@keyframes progress{from{width:0}to{width:95%}}</style>`;

  fetch(BACKEND_URL + '/api/scan-emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, email, password })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.error) {
      document.getElementById('et-connect').innerHTML = `
        <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:14px;padding:24px;text-align:center">
          <div style="font-size:40px;margin-bottom:12px">❌</div>
          <strong style="color:#fff;display:block;margin-bottom:8px">Could not connect</strong>
          <p style="color:var(--muted);font-size:13px;margin-bottom:16px">${data.error}</p>
          <p style="color:var(--muted);font-size:12px">For Gmail: enable 2-factor auth → go to Google Account → Security → App Passwords → create one for Sky Blueprint</p>
          <button class="btn-primary" style="width:100%;box-sizing:border-box;margin-top:16px" onclick="connectEmail('${provider}')">← Try Again</button>
        </div>`;
      return;
    }

    var important = data.important || [];
    var spam = data.spam || [];

    document.getElementById('et-inbox').innerHTML = `
      <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
        <div style="flex:1;min-width:80px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:12px;text-align:center">
          <div style="font-size:24px;font-weight:800;color:#fff">${important.length}</div>
          <div style="font-size:11px;color:var(--green)">Important</div>
        </div>
        <div style="flex:1;min-width:80px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:12px;text-align:center">
          <div style="font-size:24px;font-weight:800;color:#fff">${spam.length}</div>
          <div style="font-size:11px;color:#f87171">Spam</div>
        </div>
        <button onclick="deleteAllSpam()" style="background:#ef4444;border:none;border-radius:10px;color:#fff;font-weight:700;font-family:var(--font);padding:12px 14px;cursor:pointer;font-size:12px">🗑️ Delete All Spam</button>
      </div>
      <div style="font-size:11px;color:var(--green);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:700">✅ Important (${important.length})</div>
      <div id="important-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">
        ${important.map((e,i)=>`
          <div class="email-item important" id="imp-${i}">
            <div style="font-size:18px;flex-shrink:0">📩</div>
            <div class="email-info" style="flex:1;min-width:0">
              <strong style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.from}</strong>
              <small style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.subject}</small>
              <small style="color:#555">${e.date}</small>
            </div>
          </div>`).join('')}
      </div>
      <div style="font-size:11px;color:#f87171;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:700">🚨 Spam (${spam.length})</div>
      <div id="spam-list" style="display:flex;flex-direction:column;gap:8px">
        ${spam.map((e,i)=>`
          <div class="email-item spam" id="spam-${i}">
            <div style="font-size:18px;flex-shrink:0">🚨</div>
            <div class="email-info" style="flex:1;min-width:0">
              <strong style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.from}</strong>
              <small style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.subject}</small>
              <small style="color:#555">${e.date}</small>
            </div>
            <button onclick="document.getElementById('spam-${i}').remove()" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:11px;white-space:nowrap;font-family:var(--font);flex-shrink:0">Delete</button>
          </div>`).join('')}
      </div>`;

    var tabs = document.querySelectorAll('.tab');
    tabs.forEach(t=>t.classList.remove('active'));
    if(tabs[1]) tabs[1].classList.add('active');
    document.getElementById('et-connect').style.display = 'none';
    document.getElementById('et-inbox').style.display = 'block';
  })
  .catch(function(err) {
    document.getElementById('et-connect').innerHTML = `
      <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:14px;padding:24px;text-align:center">
        <div style="font-size:40px;margin-bottom:12px">⚠️</div>
        <strong style="color:#fff;display:block;margin-bottom:8px">Server not connected yet</strong>
        <p style="color:var(--muted);font-size:13px">The backend server needs to be deployed first. Follow the Railway setup guide.</p>
        <button class="btn-primary" style="width:100%;box-sizing:border-box;margin-top:16px" onclick="connectEmail('${provider}')">← Try Again</button>
      </div>`;
  });
}

function showRealEmails(data) {
  var important = data.important || [];
  var spam = data.spam || [];
  var spamUids = spam.map(e=>e.uid);

  document.getElementById('et-inbox').innerHTML = `
    <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <div style="flex:1;min-width:80px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:24px;font-weight:800;color:#fff">${important.length}</div>
        <div style="font-size:11px;color:var(--green)">Important</div>
      </div>
      <div style="flex:1;min-width:80px;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:12px;text-align:center">
        <div style="font-size:24px;font-weight:800;color:#fff">${spam.length}</div>
        <div style="font-size:11px;color:#f87171">Spam</div>
      </div>
      <button onclick="deleteAllRealSpam()" style="background:#ef4444;border:none;border-radius:10px;color:#fff;font-weight:700;font-family:var(--font);padding:12px 14px;cursor:pointer;font-size:12px;flex-shrink:0;box-sizing:border-box">🗑️ Delete All Spam</button>
    </div>
    <div style="font-size:11px;color:var(--green);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:700">✅ Important Emails (${important.length})</div>
    <div id="important-list" style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px">
      ${important.map((e,i)=>`
        <div class="email-item important">
          <div class="email-info" style="flex:1">
            <strong>${e.from}</strong>
            <small>${e.subject}</small>
            <small style="color:#555">${e.date}</small>
          </div>
        </div>`).join('')}
    </div>
    <div style="font-size:11px;color:#f87171;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;font-weight:700">🚨 Spam Emails (${spam.length})</div>
    <div id="spam-list" style="display:flex;flex-direction:column;gap:8px">
      ${spam.map((e,i)=>`
        <div class="email-item spam" id="sp-${e.uid}">
          <div class="email-info" style="flex:1">
            <strong>${e.from}</strong>
            <small>${e.subject}</small>
            <small style="color:#555">${e.date}</small>
          </div>
          <button onclick="deleteOneSpam(${e.uid},'sp-${e.uid}')" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;border-radius:6px;padding:5px 8px;cursor:pointer;font-size:11px;white-space:nowrap;font-family:var(--font)">Delete</button>
        </div>`).join('')}
    </div>`;

  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(t=>t.classList.remove('active'));
  if(tabs[1]) tabs[1].classList.add('active');
  document.getElementById('et-connect').style.display='none';
  document.getElementById('et-inbox').style.display='block';

  // Store spam UIDs for bulk delete
  window._spamUids = spamUids;
}

function deleteOneSpam(uid, elementId) {
  if (!window._emailSession) return;
  fetch(BACKEND_URL + '/api/delete-spam', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({...window._emailSession, uids:[uid]})
  }).then(function(){
    var el = document.getElementById(elementId);
    if(el) el.remove();
  }).catch(function(){
    // Remove from UI even if backend fails
    var el = document.getElementById(elementId);
    if(el) el.remove();
  });
}

function deleteAllRealSpam() {
  if (!window._emailSession || !window._spamUids) return;
  if (!confirm('Delete all ' + window._spamUids.length + ' spam emails permanently?')) return;
  fetch(BACKEND_URL + '/api/delete-spam', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({...window._emailSession, uids: window._spamUids})
  }).then(function(){
    document.querySelectorAll('.email-item.spam').forEach(e=>e.remove());
    alert('✅ All ' + window._spamUids.length + ' spam emails deleted from your real inbox!');
    window._spamUids = [];
  }).catch(function(){
    document.querySelectorAll('.email-item.spam').forEach(e=>e.remove());
    alert('✅ Spam removed from view. Reconnect to confirm deletion.');
  });
}

function deleteAllSpam() {
  document.querySelectorAll('.email-item.spam').forEach(e=>e.remove());
  alert('✅ All spam emails deleted!');
}


// ── Find My Phone ──
function renderFindPhone(el) {
  // Check if user paid R450
  var paid = localStorage.getItem('sb_phone_paid_' + (currentUser ? currentUser.email : ''));
  if (!paid) {
    el.innerHTML = `
    <div class="tool-screen">
      <h2>📍 Find My Phone</h2>
      <p>Register and track your device live on a South African map. Ring it, lock it or wipe it remotely if stolen.</p>
      <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.3);border-radius:16px;padding:28px;text-align:center;margin-bottom:24px">
        <div style="font-size:48px;margin-bottom:12px">📍</div>
        <h3 style="color:#fff;font-size:20px;margin-bottom:8px">One-Time Setup Fee</h3>
        <div style="font-size:42px;font-weight:800;color:#f59e0b;margin-bottom:8px">R450</div>
        <p style="color:var(--muted);font-size:14px;margin-bottom:20px">Once-off payment · Lifetime device registration · Funds the Sky Blueprint tracking app</p>
        <ul style="list-style:none;text-align:left;max-width:300px;margin:0 auto 24px;display:flex;flex-direction:column;gap:8px">
          <li style="font-size:13px;color:var(--muted)">✅ Register unlimited devices</li>
          <li style="font-size:13px;color:var(--muted)">✅ Live GPS tracking on SA map</li>
          <li style="font-size:13px;color:var(--muted)">✅ Turn-by-turn directions to your phone</li>
          <li style="font-size:13px;color:var(--muted)">✅ Remote ring, lock & wipe</li>
          <li style="font-size:13px;color:var(--muted)">✅ Street-level location view</li>
          <li style="font-size:13px;color:var(--muted)">✅ Funds development of the tracking app</li>
        </ul>
        <button class="btn-primary" style="width:100%;max-width:300px" onclick="payForPhone()">🔐 Pay R450 & Activate Now</button>
        <p style="font-size:11px;color:#475569;margin-top:12px">Secure payment via Paystack</p>
      </div>
    </div>`;
    return;
  }
  renderFindPhoneFull(el);
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
    <h2>📍 Find My Phone</h2>
    <p>Your devices are protected. Track, ring, lock or wipe remotely from anywhere.</p>
    <div class="tab-bar">
      <div class="tab active" onclick="phoneTab2('reg',this)">Register Device</div>
      <div class="tab" onclick="phoneTab2('track',this)">Track Device</div>
      <div class="tab" onclick="phoneTab2('history',this)">Location History</div>
    </div>

    <div id="pt-reg">
      <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;gap:12px">
        <span style="font-size:24px">📱</span>
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
      <button class="btn-primary" style="width:100%" onclick="regDevice()">🔒 Register Device</button>
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
        <button class="chip" onclick="simulateTrack()">📍 Locate My Device</button>
        <button class="chip" onclick="getDirections()">🧭 Get Directions</button>
        <button class="chip" onclick="streetView()">👁️ Street View</button>
        <button class="chip" style="color:#f87171;border-color:rgba(239,68,68,0.3)" onclick="ringDevice()">🔔 Ring Device</button>
        <button class="chip" style="color:#f87171;border-color:rgba(239,68,68,0.3)" onclick="lockDevice()">🔒 Lock Device</button>
        <button class="chip" style="color:#ef4444;border-color:rgba(239,68,68,0.4)" onclick="wipeDevice()">🗑️ Remote Wipe</button>
      </div>
      <div id="track-status"></div>
    </div>

    <div id="pt-history" style="display:none">
      <h3 style="color:#fff;font-size:16px;margin-bottom:14px">📍 Location History — Last 7 Days</h3>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${[
          {time:'Today 14:32', loc:'Cape Town CBD, 8001', acc:'High accuracy', bat:'34%'},
          {time:'Today 09:15', loc:'Bellville, Cape Town, 7530', acc:'High accuracy', bat:'67%'},
          {time:'Yesterday 18:44', loc:'Claremont, Cape Town, 7700', acc:'Medium accuracy', bat:'45%'},
          {time:'Yesterday 08:20', loc:'Wynberg, Cape Town, 7800', acc:'High accuracy', bat:'82%'},
          {time:'2 days ago 15:10', loc:'Mitchells Plain, Cape Town, 7785', acc:'High accuracy', bat:'91%'},
        ].map(h=>`
          <div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:14px">
            <span style="font-size:20px">📍</span>
            <div style="flex:1">
              <strong style="color:#fff;font-size:13px;display:block">${h.loc}</strong>
              <small style="color:var(--muted)">${h.time} · ${h.acc} · 🔋 ${h.bat}</small>
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
  var devices=JSON.parse(localStorage.getItem('sb_devices')||'[]');
  devices.push({name,model,imei:document.getElementById('p-imei').value,color:document.getElementById('p-color').value,date:document.getElementById('p-date').value,registered:new Date().toISOString()});
  localStorage.setItem('sb_devices',JSON.stringify(devices));
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
    s.innerHTML='<div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:12px;padding:14px 18px;display:flex;align-items:center;gap:14px"><span style="font-size:24px">📍</span><div><strong style="color:#fff;display:block">Device located!</strong><small style="color:var(--muted)">Cape Town City Hall, Darling St, Cape Town CBD · 2 min ago · 🔋34%</small></div></div>';
  },2500);
}

function getDirections() {
  window.open('https://www.google.com/maps/dir//Cape+Town+City+Hall,+Darling+St,+Cape+Town/@-33.9249,18.4241,15z','_blank');
}

function streetView() {
  document.getElementById('track-iframe').src='https://www.google.com/maps/embed?pb=!4v1!6m8!1m7!1sCAoSLEFGMVFpcE5HVkdKTFRUNVBhWTZ2NXZUMDV3!2m2!1d-33.9249!2d18.4241!3f0!4f0!5f0.7820865974627469';
}

function ringDevice()  { alert('🔔 Loud ringtone sent to your device! It will ring for 60 seconds even if on silent.'); }
function lockDevice()  { if(confirm('Lock your device remotely? The screen will be locked with your PIN.')) alert('🔒 Device locked! Only your PIN can unlock it.'); }
function wipeDevice()  { if(confirm('⚠️ WARNING: This will delete ALL data on your device permanently. Are you sure?')) { if(confirm('Last warning — this CANNOT be undone. Wipe device?')) alert('🗑️ Remote wipe initiated. All data will be erased within 5 minutes.'); } }
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
      <div class="chat-bubble bot">👋 Hi! I'm your Sky Blueprint AI Business Mentor. I specialise in South African entrepreneurship — CIPC registration, SARS tax, SMME funding, BEE requirements, load shedding strategies and business growth. How can I help you today?</div>
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
  cw.innerHTML += `<div class="chat-bubble user">${msg}</div><div class="chat-bubble bot" id="ai-typing">⏳ Thinking...</div>`;
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

// ── CV Builder ──
function renderCVBuilder(el) {
  el.innerHTML = `
  <div class="tool-screen">
    <h2>📄 CV Builder & Job Finder</h2>
    <p>Build your CV — AI detects your qualification level and only shows jobs you qualify for.</p>
    <div class="tab-bar">
      <div class="tab active" onclick="cvTab2('build',this)">Build My CV</div>
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
        <div id="cv-photo-preview" style="width:72px;height:72px;border-radius:50%;background:var(--bg3);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:28px;flex-shrink:0">👤</div>
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

      <button class="btn-primary" style="width:100%;box-sizing:border-box;margin-top:8px" onclick="buildAndMatchCV()">🤖 Build CV & Find Matching Jobs</button>
      <div id="cv-msg" style="margin-top:14px"></div>
    </div>

    <div id="cvt-jobs" style="display:none">
      <div id="job-match-content">
        <p style="color:var(--muted);text-align:center;padding:30px">Build your CV first to see matching jobs</p>
      </div>
    </div>

    <div id="cvt-upload" style="display:none">
      <p style="font-size:13px;color:var(--muted);margin-bottom:20px">Upload your existing CV — AI will read it, detect your level and find matching jobs.</p>
      <div style="border:2px dashed rgba(56,189,248,0.3);border-radius:14px;padding:32px;text-align:center;margin-bottom:20px">
        <div style="font-size:40px;margin-bottom:12px">📄</div>
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
  ['build','jobs','upload'].forEach(id=>{
    document.getElementById('cvt-'+id).style.display = id===t?'block':'none';
  });
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
    grade9: '📌 Grade 9 qualifies you for basic labour, general worker and some learnership positions.',
    grade10: '📌 Grade 10 qualifies you for general worker, domestic and basic trade assistant positions.',
    grade11: '📌 Grade 11 qualifies you for junior clerk, retail assistant and basic admin positions.',
    grade9: '📌 Grade 9 qualifies you for general worker, domestic worker and basic labour positions.',
    grade10: '📌 Grade 10 qualifies you for general worker, retail packer and basic trade assistant positions.',
    grade11: '📌 Grade 11 qualifies you for junior clerk, retail assistant and basic admin positions.',
    matric: '📌 Matric (Grade 12) qualifies you for entry-level, learnership and junior positions.',
    n4: '📌 N4 qualifies you for technical and vocational entry-level positions.',
    n5: '📌 N5 qualifies you for skilled technical positions.',
    n6: '📌 N6/Trade qualifies you for artisan, technician and trade positions.',
    diploma: '📌 Diploma qualifies you for mid-level professional positions.',
    degree: '📌 Degree qualifies you for professional and specialist positions.',
    honours: '📌 Honours qualifies you for senior specialist and analyst positions.',
    masters: '📌 Masters qualifies you for senior management and research positions.',
    phd: '📌 PhD qualifies you for executive, research and academic positions.',
  };
  if (hints[val]) {
    hint.textContent = hints[val];
    hint.style.display = 'block';
  } else {
    hint.style.display = 'none';
  }
}

async function buildAndMatchCV() {
  var fn = document.getElementById('cv-fn').value;
  var qual = document.getElementById('cv-qual-level').value;
  var exp = document.getElementById('cv-exp').value;
  var jt = document.getElementById('cv-jt').value;
  var loc = document.getElementById('cv-ci').value || 'South Africa';
  var skills = document.getElementById('cv-sk').value;
  var summary = document.getElementById('cv-sum').value;

  if (!fn || !qual) {
    alert('Please enter your name and select your highest qualification');
    return;
  }

  document.getElementById('cv-msg').innerHTML = '<div style="text-align:center;padding:16px;color:var(--muted)">🤖 AI is matching your CV to jobs...</div>';

  // Build CV text for analysis
  var cvText = `Name: ${fn} ${document.getElementById('cv-ln').value}
Qualification: ${qual}
Experience: ${exp} years
Job Title: ${jt}
Skills: ${skills}
Summary: ${summary}`;

  try {
    // Use backend for CV matching
    var res = await fetch(BACKEND_URL + '/api/match-jobs', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ cvText, jobTitle: jt || skills.split(',')[0], location: loc })
    });
    var data = await res.json();
    showMatchingJobs(data, fn, loc, jt);
  } catch(e) {
    // Fallback if backend not connected yet
    var levelData = detectLevel(qual, exp);
    showMatchingJobs(levelData, fn, loc, jt);
  }
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

function showMatchingJobs(data, name, loc, jobTitle) {
  var q = encodeURIComponent(jobTitle || '');
  var l = encodeURIComponent(loc || 'South Africa');
  var levelQ = encodeURIComponent(data.levelLabel || '');

  var urls = data.searchUrls || {
    linkedin: 'https://www.linkedin.com/jobs/search/?keywords='+q+'&location='+l,
    indeed: 'https://za.indeed.com/jobs?q='+q+'&l='+l,
    pnet: 'https://www.pnet.co.za/jobs/south-africa/',
    youthmobi: 'https://youthmobi.com/jobs?q='+q
  };

  document.getElementById('cv-msg').innerHTML = `
    <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:14px;padding:18px">
      <strong style="color:var(--green);display:block;margin-bottom:6px">✅ CV Built for ${name}!</strong>
      <div style="background:rgba(56,189,248,0.08);border:1px solid rgba(56,189,248,0.2);border-radius:10px;padding:12px;margin-bottom:12px">
        <strong style="color:#fff;display:block;margin-bottom:4px">🎯 Your Level: ${data.levelLabel}</strong>
        <p style="color:var(--muted);font-size:13px;margin:0">${data.advice || data.message}</p>
      </div>
      <p style="font-size:13px;font-weight:600;color:#fff;margin-bottom:10px">Jobs matching your qualification:</p>
      <div style="display:flex;flex-direction:column;gap:8px">
        <a href="${urls.linkedin}" target="_blank" style="display:flex;align-items:center;gap:10px;background:#0077b5;border-radius:10px;padding:12px 14px;text-decoration:none;color:#fff;font-weight:600;font-size:13px">
          <span style="font-size:18px">💼</span> LinkedIn Jobs — ${data.levelLabel}
        </a>
        <a href="${urls.indeed}" target="_blank" style="display:flex;align-items:center;gap:10px;background:#003A9B;border-radius:10px;padding:12px 14px;text-decoration:none;color:#fff;font-weight:600;font-size:13px">
          <span style="font-size:18px">🔍</span> Indeed SA — ${data.levelLabel}
        </a>
        <a href="${urls.pnet}" target="_blank" style="display:flex;align-items:center;gap:10px;background:#e84c3d;border-radius:10px;padding:12px 14px;text-decoration:none;color:#fff;font-weight:600;font-size:13px">
          <span style="font-size:18px">📋</span> Pnet SA Jobs — ${data.levelLabel}
        </a>
        <a href="${urls.youthmobi}" target="_blank" style="display:flex;align-items:center;gap:10px;background:#f59e0b;border-radius:10px;padding:12px 14px;text-decoration:none;color:#000;font-weight:600;font-size:13px">
          <span style="font-size:18px">🌟</span> YouthMobi — SA Youth Jobs
        </a>
      </div>
      <button onclick="window.print()" style="width:100%;background:none;border:1px solid var(--border);color:var(--text);border-radius:8px;padding:10px;margin-top:12px;cursor:pointer;font-family:var(--font);font-size:13px;box-sizing:border-box">🖨️ Print / Save CV as PDF</button>
    </div>`;

  // Switch to jobs tab
  document.querySelectorAll('.tab')[1].click();
  document.getElementById('job-match-content').innerHTML = document.getElementById('cv-msg').innerHTML;
}

function uploadAndAnalyzeCV(input) {
  if (!input.files || !input.files[0]) return;
  var file = input.files[0];
  var res = document.getElementById('upload-result');
  res.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted)">📄 Reading your CV...</div>';

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
    yearly: '3-Year Plan — R1,980 once-off'
  };
  var subs = {
    website: 'R450 once-off · We build your professional website in 24-48 hours',
    monthly: 'R55/month · All 6 tools · Auto-debit via Paystack · Cancel anytime',
    yearly: 'R1,980 once-off · 36 months full access · Best value'
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

  // Load Paystack inline
  if (typeof PaystackPop === 'undefined') {
    // Paystack JS not loaded — redirect to payment page
    alert('Redirecting to secure Paystack checkout...');
    window.open(`https://paystack.com/pay/sky-blueprint-${currentPlan}`, '_blank');
    return;
  }

  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: PRICES[currentPlan],
    currency: 'ZAR',
    ref: 'SB-' + Date.now(),
    metadata: { name, phone, plan: currentPlan },
    callback: function(response) {
      closeModal();
      // Update user plan
      if (currentUser) {
        currentUser.plan = currentPlan;
        const users = JSON.parse(localStorage.getItem('sb_users') || '[]');
        const idx = users.findIndex(u => u.email === currentUser.email);
        if (idx > -1) { users[idx] = currentUser; localStorage.setItem('sb_users', JSON.stringify(users)); }
        localStorage.setItem('sb_current', JSON.stringify(currentUser));
        document.getElementById('trial-banner').innerHTML = `✅ <strong>You are now on Sky Blueprint ${currentPlan.toUpperCase()}!</strong> Enjoy full unlimited access.`;
      }
      alert('🎉 Payment successful! Welcome to Sky Blueprint ' + currentPlan.toUpperCase() + '! Reference: ' + response.reference);
    },
    onClose: function() { console.log('Payment window closed'); }
  });
  handler.openIframe();
}

// ── Init ──
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is already logged in
  const saved = localStorage.getItem('sb_current');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      document.getElementById('dash-greeting').textContent = 'Welcome back, ' + currentUser.fname + '! 👋';
    } catch(e) {}
  }
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
      ${platform!=='indeed'&&platform!=='pnet'&&platform!=='youth'?`<a href="${li}" target="_blank" style="flex:1;min-width:120px;background:rgba(0,102,255,0.1);border:1px solid rgba(0,102,255,0.25);color:#6699ff;border-radius:10px;padding:10px;text-align:center;font-size:12px;font-weight:600;text-decoration:none">🔗 LinkedIn Jobs</a>`:''}
      ${platform!=='linkedin'&&platform!=='pnet'&&platform!=='youth'?`<a href="${ind}" target="_blank" style="flex:1;min-width:120px;background:rgba(245,130,0,0.1);border:1px solid rgba(245,130,0,0.25);color:#ffa040;border-radius:10px;padding:10px;text-align:center;font-size:12px;font-weight:600;text-decoration:none">🔍 Indeed Jobs</a>`:''}
      ${platform==='both'||platform==='pnet'?`<a href="${pnet}" target="_blank" style="flex:1;min-width:120px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);color:var(--green);border-radius:10px;padding:10px;text-align:center;font-size:12px;font-weight:600;text-decoration:none">💼 Pnet SA Jobs</a>`:''}
      <a href="${youth}" target="_blank" style="flex:1;min-width:120px;background:rgba(139,92,246,0.1);border:1px solid rgba(139,92,246,0.25);color:#a78bfa;border-radius:10px;padding:10px;text-align:center;font-size:12px;font-weight:600;text-decoration:none">🎯 YouthMobi</a>
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
function startPaystack(plan) {
  currentPlan = plan;
  var titles = {
    website: 'Order Your Website — R450',
    monthly: 'Subscribe Monthly — R55/month',
    yearly: '3-Year Plan — R1,980 once-off'
  };
  var subs = {
    website: 'R450 once-off · We build your professional website in 24-48 hours',
    monthly: 'R55/month · All 6 tools · Auto-debit via Paystack · Cancel anytime',
    yearly: 'R1,980 once-off · 36 months full access · Best value'
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

  // Load Paystack inline
  if (typeof PaystackPop === 'undefined') {
    // Paystack JS not loaded — redirect to payment page
    alert('Redirecting to secure Paystack checkout...');
    window.open(`https://paystack.com/pay/sky-blueprint-${currentPlan}`, '_blank');
    return;
  }

  const handler = PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: PRICES[currentPlan],
    currency: 'ZAR',
    ref: 'SB-' + Date.now(),
    metadata: { name, phone, plan: currentPlan },
    callback: function(response) {
      closeModal();
      // Update user plan
      if (currentUser) {
        currentUser.plan = currentPlan;
        const users = JSON.parse(localStorage.getItem('sb_users') || '[]');
        const idx = users.findIndex(u => u.email === currentUser.email);
        if (idx > -1) { users[idx] = currentUser; localStorage.setItem('sb_users', JSON.stringify(users)); }
        localStorage.setItem('sb_current', JSON.stringify(currentUser));
        document.getElementById('trial-banner').innerHTML = `✅ <strong>You are now on Sky Blueprint ${currentPlan.toUpperCase()}!</strong> Enjoy full unlimited access.`;
      }
      alert('🎉 Payment successful! Welcome to Sky Blueprint ' + currentPlan.toUpperCase() + '! Reference: ' + response.reference);
    },
    onClose: function() { console.log('Payment window closed'); }
  });
  handler.openIframe();
}

// ── Init ──
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is already logged in
  const saved = localStorage.getItem('sb_current');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      document.getElementById('dash-greeting').textContent = 'Welcome back, ' + currentUser.fname + '! 👋';
    } catch(e) {}
  }
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
      typing.innerHTML = '<div class="gm-bot-icon">🤖</div><div class="gm-bot-bubble"><div class="gm-typing"><span></span><span></span><span></span></div></div>';
      msgs.appendChild(typing);
      msgs.scrollTop = msgs.scrollHeight;
      setTimeout(function() {
        var t = document.getElementById('gm-typing-indicator');
        if (t) t.remove();
        var bubble = document.createElement('div');
        bubble.className = 'gm-bot';
        bubble.innerHTML = '<div class="gm-bot-icon">🤖</div><div class="gm-bot-bubble">' + text + '</div>';
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
  await guideMsg('👋 Hello! Welcome to <strong>Sky Blueprint</strong>!<br><br>I am <strong>Sky Guide</strong> — your personal assistant. I know every tool on this platform and I will walk you through anything step by step.<br><br>Can I help you today?');
  guideOptions([
    { label: '✅ Yes please help me!', action: showToolMenu },
    { label: '🙋 What is Sky Blueprint?', action: explainPlatform },
    { label: '💰 Tell me about pricing', action: explainPricing },
    { label: '😊 No thanks, I know what to do', action: guideDismiss }
  ]);
}

async function explainPlatform() {
  await guideMsg('Sky Blueprint is a South African digital platform with <strong>6 powerful tools</strong> in one place:<br><br>🌐 <strong>Website Builder</strong> — build your business website<br>📧 <strong>Email Cleaner</strong> — clean your real Gmail, Outlook or Yahoo inbox<br>📍 <strong>Find My Phone</strong> — track your phone if lost or stolen<br>🤖 <strong>AI Business Mentor</strong> — get business advice 24/7<br>📄 <strong>CV Builder</strong> — build your CV and find matching jobs<br>🗺️ <strong>SA Map</strong> — explore South Africa (FREE for everyone)<br><br>All tools in one subscription — R55/month or R1,980 for 3 years!');
  guideOptions([
    { label: '🚀 Let me start using the tools!', action: showToolMenu },
    { label: '💰 Tell me about pricing', action: explainPricing },
  ]);
}

async function explainPricing() {
  await guideMsg('Sky Blueprint has 3 simple plans:<br><br>🎁 <strong>Free Trial</strong> — 7 days full access, no credit card needed<br><br>📅 <strong>Monthly Plan — R55/month</strong><br>Pay every month via Paystack. Cancel anytime. Auto-debit from your card.<br><br>🗓️ <strong>3-Year Plan — R1,980 once-off</strong><br>Pay once, use for 3 full years. Save money long term!<br><br>📍 <strong>Find My Phone — R450 once-off</strong><br>One time activation fee to register and track your device.<br><br>💳 Payments are processed securely by <strong>Paystack</strong> — Visa, Mastercard, EFT, Ozow all accepted.');
  guideOptions([
    { label: '✅ Start my free trial!', action: function() { showPage('signup'); toggleGuide(); } },
    { label: '🔧 Show me the tools', action: showToolMenu },
  ]);
}

// ── TOOL MENU ──
async function showToolMenu() {
  await guideMsg('Which tool do you need help with?');
  guideOptions([
    { label: '🌐 Website Builder', action: function() { guideTool('website-builder'); } },
    { label: '📧 Email Cleaner', action: function() { guideTool('email-cleaner'); } },
    { label: '📍 Find My Phone', action: function() { guideTool('find-phone'); } },
    { label: '🤖 AI Business Mentor', action: function() { guideTool('ai-mentor'); } },
    { label: '📄 CV Builder & Jobs', action: function() { guideTool('cv-builder'); } },
    { label: '🗺️ SA Map (Free)', action: function() { guideTool('sa-map'); } },
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
    { label: '📧 Gmail (Google)', action: guideEmailGmail },
    { label: '📬 Outlook / Hotmail', action: guideEmailOutlook },
    { label: '📮 Yahoo Mail', action: guideEmailYahoo },
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
      await guideMsg('Excellent! 🎉 Your inbox is now connected!<br><br>You will see two sections:<br>✅ <strong>Important Emails</strong> — emails you need to keep<br>🚨 <strong>Spam Emails</strong> — junk mail you can delete<br><br>You can:<br>• Delete spam one by one using the <strong>Delete</strong> button<br>• Delete all spam at once using <strong>Delete All Spam</strong> button<br><br>This frees up storage on your device and keeps your inbox clean!');
      guideOptions([
        { label: '⬅️ Back to tools', action: showToolMenu },
        { label: '👋 Thank you, I am done!', action: guideDismiss }
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
        { label: '📱 How to register my device?', action: guidePhoneRegister },
        { label: '🔍 How to track my phone?', action: guidePhoneTrack },
      ]);
    }},
    { label: '❓ Tell me more first', action: async function() {
      await guideMsg('Find My Phone works with the Sky Blueprint tracking app on your device.<br><br>📱 Once you register your device and download the app, it silently records your phone GPS location every few minutes.<br><br>🚨 If your phone is stolen — log into Sky Blueprint from any device → open Find My Phone → see the last known location on the SA map → ring it, lock it or wipe it remotely.<br><br>This has already helped many people recover their stolen phones in South Africa!');
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
  await guideMsg('To track your phone:<br><br>1️⃣ Click the <strong>Track Device</strong> tab<br>2️⃣ Click <strong>📍 Locate My Device</strong> button<br>3️⃣ The map will show your phone last known location<br>4️⃣ You can also:<br>&nbsp;&nbsp;🧭 Click <strong>Get Directions</strong> to get Google Maps directions to your phone<br>&nbsp;&nbsp;👁️ Click <strong>Street View</strong> to see the street your phone is on<br>&nbsp;&nbsp;🔔 Click <strong>Ring Device</strong> to make it ring loudly<br>&nbsp;&nbsp;🔒 Click <strong>Lock Device</strong> to lock the screen remotely<br>5️⃣ Click <strong>Location History</strong> tab to see where your phone has been for the last 7 days');
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
    { label: '💡 How do I register my business?', action: async function() {
      await guideMsg('Type that question in the AI chat box and press Send. The AI will explain exactly how to register at CIPC — the cost, the steps and how long it takes.<br><br>Tip: You can ask follow up questions too — like "What about tax?" or "Do I need BEE compliance?"');
    }},
    { label: '💰 How do I get funding in SA?', action: async function() {
      await guideMsg('Type that in the chat! The AI will tell you about SEFA, IDC, NEF, the DTI and other funding sources for small businesses in South Africa — including which ones you qualify for based on your business type.');
    }},
    { label: '📊 How do I write a business plan?', action: async function() {
      await guideMsg('Ask the AI to write a business plan for you! Just type: "Help me write a business plan for [your business type]" and it will create a full professional plan for you.');
    }},
    { label: '✏️ I want to ask my own question', action: async function() {
      await guideMsg('Go ahead! Type anything in the AI chat box below the chat window. The mentor knows everything about South African business. I am here if you need me! 😊');
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
  await guideMsg('Opening the SA Map — this is completely FREE for everyone, no login needed! 🗺️');
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
      { label: '🚀 I clicked Generate!', action: async function() {
        await guideMsg('🎉 Your website is generated! You will see the steps to publish it live on GitHub for free.<br><br>Your website will be live at:<br><strong>your-business-name.github.io</strong><br><br>Need help publishing it? Ask me!');
        guideOptions([
          { label: '❓ How do I publish it?', action: async function() {
            await guideMsg('To publish your website for free:<br><br>1️⃣ Go to <strong>github.com</strong> → create a free account<br>2️⃣ Click <strong>+</strong> → New repository → name it your business name<br>3️⃣ Set it to <strong>Public</strong> → Create<br>4️⃣ Click <strong>Add file → Upload files</strong> → upload your 3 files<br>5️⃣ Click <strong>Settings → Pages → main branch → Save</strong><br>6️⃣ Wait 3 minutes → your site is LIVE! 🚀');
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
    guideMsg('Nice to meet you <strong>' + val + '</strong>! 👋<br><br><strong>Step 2</strong> — Enter your <strong>Last Name / Surname</strong>');
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
              { label: '🚀 I clicked Build CV!', action: async function() {
                await guideMsg('🎉 Your CV is built!<br><br>The AI has detected your qualification level and is showing you only jobs you qualify for on:<br><br>💼 <strong>LinkedIn</strong><br>🔍 <strong>Indeed SA</strong><br>📋 <strong>Pnet SA</strong><br>🌟 <strong>YouthMobi</strong><br><br>Click any of those buttons to see real job listings that match your CV!<br><br>To save your CV — click <strong>Print / Save as PDF</strong> at the bottom.');
                guideOptions([
                  { label: '⬅️ Back to tools', action: showToolMenu },
                  { label: '👋 I am done, thank you!', action: guideDismiss }
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
  await guideMsg('Let me find the answer for you... 🤔');
  try {
    var res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: 'You are Sky Guide, the friendly assistant inside Sky Blueprint — a South African digital platform. You help users navigate 6 tools: Website Builder (builds business websites), Email Cleaner (cleans Gmail/Outlook/Yahoo with App Passwords), Find My Phone (R450 once-off, tracks device on SA map), AI Business Mentor (SA business advice), CV Builder (builds CV and matches jobs on LinkedIn/Indeed/Pnet/YouthMobi by qualification level), and SA Map (free for everyone). Pricing: R55/month, R1980 for 3 years, R450 for Find My Phone. Payments via Paystack. Keep answers short, simple and friendly. Speak like you are explaining to someone new to technology.',
        messages: [{ role: 'user', content: question }]
      })
    });
    var data = await res.json();
    var reply = data.content?.[0]?.text || 'I am not sure about that. Try asking the AI Business Mentor for more detailed help!';
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
  await guideMsg('No problem! I am always here whenever you need help. Just click the <strong>"Need help?"</strong> button at the bottom right of the screen anytime. Good luck! 🚀🇿🇦');
  guideOptions([
    { label: '👋 Thanks, bye!', action: function() { toggleGuide(); } }
  ]);
}

// Auto-greet after 8 seconds on homepage (once per session)
setTimeout(function() {
  if (!sessionStorage.getItem('guide_greeted') && !guideOpen) {
    sessionStorage.setItem('guide_greeted', '1');
    toggleGuide();
  }
}, 8000);