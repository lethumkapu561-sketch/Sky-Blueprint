// ── Sky Blueprint App ──
// YOUR PAYSTACK PUBLIC KEY — replace with your real key from paystack.com/dashboard
var PAYSTACK_PUBLIC_KEY = _pk_live_b07f0d8b9ee7305c57362ec9bbb89fe1eb0f9433';
var PLAN_CODES = { pro: 'PLN_xxxxxxxxxx', business: 'PLN_xxxxxxxxxx' };
var PRICES = { website: 45000, monthly: 5500, yearly: 198000 }; // amounts in cents (R450=45000, R55=5500, R1980=198000) // in kobo (R99 = 9900)
var currentPlan = 'pro';
var currentUser = null;

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
  document.getElementById('dash-greeting').textContent = 'Welcome back, ' + user.fname + '! 👋';
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

  document.getElementById('dash-greeting').textContent = 'Welcome, ' + fname + '! 🎉';
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
  const emails = [
    {from:'SARS South Africa',subject:'Your tax return is due — action required',type:'important'},
    {from:'Shopify Orders',subject:'New order #2041 received — R1,299',type:'important'},
    {from:'Standard Bank',subject:'Your statement is ready to download',type:'important'},
    {from:'Client: Thabo M.',subject:'Urgent: Quote needed for 10 units',type:'important'},
    {from:'UIF Department',subject:'Your UIF payment has been processed',type:'important'},
    {from:'WIN-PRIZES@scam.net',subject:'🎉 YOU WON R500,000 — CLAIM NOW!!!',type:'spam'},
    {from:'noreply@cheapmeds.org',subject:'Buy Ozempic without prescription cheap!',type:'spam'},
    {from:'flash-deals@promo99.co',subject:'Last 24 hours — 95% OFF everything!',type:'spam'},
    {from:'info@nigerian-offer.com',subject:'Business proposal — $5 million awaits you',type:'spam'},
  ];

  el.innerHTML = `
  <div class="tool-screen">
    <h2>Email Cleaner</h2>
    <p>AI sorts your inbox automatically — separating important emails from spam so you never miss what matters.</p>
    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">
      <div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:12px 20px;flex:1;min-width:120px;text-align:center">
        <div style="font-size:24px;font-weight:800;color:#fff">${emails.filter(e=>e.type==='important').length}</div>
        <div style="font-size:12px;color:var(--green)">Important</div>
      </div>
      <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:12px 20px;flex:1;min-width:120px;text-align:center">
        <div style="font-size:24px;font-weight:800;color:#fff">${emails.filter(e=>e.type==='spam').length}</div>
        <div style="font-size:12px;color:#f87171">Spam</div>
      </div>
    </div>
    <div class="tab-bar">
      <div class="tab active" onclick="filterE('all',this)">All (${emails.length})</div>
      <div class="tab" onclick="filterE('important',this)">Important</div>
      <div class="tab" onclick="filterE('spam',this)">Spam</div>
    </div>
    <div class="email-list" id="elist">
      ${emails.map(e=>`
        <div class="email-item ${e.type}" data-type="${e.type}">
          <span class="ebadge ${e.type==='spam'?'bs':'bi'}">${e.type==='spam'?'SPAM':'OK'}</span>
          <div class="email-info"><strong>${e.from}</strong><small>${e.subject}</small></div>
          ${e.type==='spam'?`<button onclick="this.closest('.email-item').remove()" style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:12px;white-space:nowrap">Delete</button>`:''}
        </div>`).join('')}
    </div>
    <button class="btn-primary" style="margin-top:20px;width:100%" onclick="document.querySelectorAll('.email-item.spam').forEach(e=>e.remove())">🗑️ Delete All Spam</button>
  </div>`;
}

function filterE(type, tab) {
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  tab.classList.add('active');
  document.querySelectorAll('.email-item').forEach(i=>{
    i.style.display=(type==='all'||i.dataset.type===type)?'flex':'none';
  });
}

// ── Find My Phone ──
function renderFindPhone(el) {
  el.innerHTML = `
  <div class="tool-screen">
    <h2>Find My Phone</h2>
    <p>Register your device so you can track it on a live SA map if it's lost or stolen. Download the Sky Blueprint app on your phone to enable live GPS tracking.</p>
    <div style="background:rgba(56,189,248,0.06);border:1px solid rgba(56,189,248,0.2);border-radius:14px;padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;gap:14px">
      <span style="font-size:28px">📱</span>
      <div>
        <strong style="color:#fff;display:block;margin-bottom:3px">Sky Blueprint Phone App</strong>
        <small style="color:var(--muted)">Download on your phone to enable live GPS tracking. Available for Android.</small>
      </div>
      <button class="btn-primary" style="white-space:nowrap;flex-shrink:0" onclick="alert('App download coming soon! You will receive an email with the download link.')">Download App</button>
    </div>
    <div class="tab-bar">
      <div class="tab active" onclick="phoneTab('reg',this)">Register Device</div>
      <div class="tab" onclick="phoneTab('loc',this)">Find Device</div>
    </div>
    <div id="ptab-reg">
      <div class="form-row">
        <div class="form-group"><label>Full Name</label><input type="text" placeholder="Sipho Dlamini"></div>
        <div class="form-group"><label>Phone Number</label><input type="tel" placeholder="082 345 6789"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Device Make & Model</label><input type="text" placeholder="Samsung Galaxy A54"></div>
        <div class="form-group"><label>IMEI Number</label><input type="text" placeholder="Dial *#06# to find"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Device Color</label><input type="text" placeholder="Black"></div>
        <div class="form-group"><label>Email Address</label><input type="email" placeholder="your@email.com"></div>
      </div>
      <button class="btn-primary" style="width:100%" onclick="regPhone()">🔒 Register My Device</button>
      <div id="reg-res" style="margin-top:16px"></div>
    </div>
    <div id="ptab-loc" style="display:none">
      <div class="form-group"><label>Email Address</label><input type="email" id="loc-email" placeholder="Email you registered with"></div>
      <div class="form-group"><label>Password</label><input type="password" id="loc-pass" placeholder="Your Sky Blueprint password"></div>
      <button class="btn-primary" style="width:100%;margin-bottom:20px" onclick="locatePhone()">🔍 Locate My Device</button>
      <div id="loc-res"></div>
    </div>
  </div>`;
}

function phoneTab(t, el) {
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('ptab-reg').style.display = t==='reg'?'block':'none';
  document.getElementById('ptab-loc').style.display = t==='loc'?'block':'none';
}
function regPhone() {
  document.getElementById('reg-res').innerHTML = `<div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;padding:18px"><strong style="color:var(--green)">✅ Device Registered!</strong><p style="color:var(--muted);font-size:13px;margin-top:8px">Your device is registered in Sky Blueprint. If it's lost or stolen, use the "Find Device" tab to locate it. Also download the Sky Blueprint phone app for live GPS tracking.</p></div>`;
}
function locatePhone() {
  const r = document.getElementById('loc-res');
  r.innerHTML = `<div style="text-align:center;padding:20px;color:var(--muted)">🔍 Scanning GPS signal...</div>`;
  setTimeout(() => {
    r.innerHTML = `
      <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:16px;overflow:hidden">
        <div style="padding:16px 20px;border-bottom:1px solid var(--border)">
          <strong style="color:var(--green)">📍 Device Found!</strong>
          <p style="color:var(--muted);font-size:13px;margin-top:4px">Cape Town CBD · Last active 2 minutes ago · Battery 34%</p>
        </div>
        <div class="map-frame"><iframe src="https://www.google.com/maps?q=Cape+Town+CBD+South+Africa&output=embed" allowfullscreen loading="lazy"></iframe></div>
        <div style="padding:16px 20px;display:flex;gap:10px">
          <button class="btn-primary" style="flex:1" onclick="alert('Sending loud ringtone to your device...')">🔔 Ring Device</button>
          <button style="flex:1;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);color:#f87171;border-radius:10px;padding:12px;font-family:var(--font);cursor:pointer;font-weight:600" onclick="alert('Device locked remotely!')">🔒 Lock Device</button>
        </div>
      </div>`;
  }, 2500);
}

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
    <h2>CV Builder & Job Finder</h2>
    <p>Build a professional CV and find matching jobs on LinkedIn and Indeed.</p>
    <div class="tab-bar">
      <div class="tab active" onclick="cvTab('build',this)">Build CV</div>
      <div class="tab" onclick="cvTab('jobs',this)">Find Jobs</div>
    </div>
    <div id="cv-build">
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
      <div class="cv-sec-title">Professional Summary</div>
      <div class="form-group"><textarea id="cv-su" placeholder="Brief overview of your experience and skills..."></textarea></div>
      <div class="cv-sec-title">Work Experience</div>
      <div class="form-row">
        <div class="form-group"><label>Job Title</label><input type="text" id="cv-jt" placeholder="Sales Manager"></div>
        <div class="form-group"><label>Company</label><input type="text" id="cv-co" placeholder="Vodacom"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Start Date</label><input type="text" id="cv-sd" placeholder="Jan 2022"></div>
        <div class="form-group"><label>End Date</label><input type="text" id="cv-ed" placeholder="Present"></div>
      </div>
      <div class="cv-sec-title">Education</div>
      <div class="form-row">
        <div class="form-group"><label>Qualification</label><input type="text" id="cv-qu" placeholder="BCom Business Management"></div>
        <div class="form-group"><label>Institution</label><input type="text" id="cv-in" placeholder="University of Cape Town"></div>
      </div>
      <div class="form-group"><label>Year Completed</label><input type="text" id="cv-yr" placeholder="2021"></div>
      <div class="cv-sec-title">Skills</div>
      <div class="form-group"><input type="text" id="cv-sk" placeholder="Microsoft Office, Sales, Python, Customer Service..."></div>
      <button class="btn-primary" style="width:100%;margin-top:8px" onclick="genCV()">📥 Generate CV</button>
      <div id="cv-res" style="margin-top:16px"></div>
    </div>
    <div id="cv-jobs" style="display:none">
      <div class="form-group"><label>Job Title / Keywords</label><input type="text" id="js-q" placeholder="Software Developer, Sales Manager..."></div>
      <div class="form-group"><label>Location</label><input type="text" id="js-l" placeholder="Cape Town" value="Cape Town, South Africa"></div>
      <div class="tab-bar">
        <div class="tab active" id="js-tab" onclick="searchJ('both',this)">LinkedIn + Indeed</div>
        <div class="tab" onclick="searchJ('linkedin',this)">LinkedIn</div>
        <div class="tab" onclick="searchJ('indeed',this)">Indeed</div>
      </div>
      <button class="btn-primary" style="width:100%;margin-bottom:24px" onclick="searchJ('both',document.getElementById('js-tab'))">🔍 Search Jobs</button>
      <div id="job-res"></div>
    </div>
  </div>`;
}
function cvTab(t,el){document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));el.classList.add('active');document.getElementById('cv-build').style.display=t==='build'?'block':'none';document.getElementById('cv-jobs').style.display=t==='jobs'?'block':'none';}
function genCV(){
  const fn=document.getElementById('cv-fn').value||'Your Name';
  document.getElementById('cv-res').innerHTML=`<div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:14px;padding:20px"><strong style="color:var(--green)">✅ CV Generated for ${fn}!</strong><p style="color:var(--muted);font-size:13px;margin:10px 0">Your professional CV is ready. Press <strong style="color:#fff">Ctrl+P</strong> (or Share → Print on mobile) to save as PDF.</p><button class="btn-primary" style="width:100%" onclick="window.print()">🖨️ Print / Save as PDF</button></div>`;
}
function searchJ(platform,el){
  if(el){document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));el.classList.add('active');}
  const q=document.getElementById('js-q').value||'jobs in South Africa';
  const l=document.getElementById('js-l').value||'South Africa';
  const li=`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(q)}&location=${encodeURIComponent(l)}`;
  const ind=`https://za.indeed.com/jobs?q=${encodeURIComponent(q)}&l=${encodeURIComponent(l)}`;
  const jobs=[
    {t:q||'Sales Representative',c:'Vodacom',l:l,s:'linkedin',i:'📱'},
    {t:q||'IT Support Technician',c:'MTN Group',l:l,s:'indeed',i:'💻'},
    {t:q||'Business Analyst',c:'Standard Bank',l:l,s:'linkedin',i:'🏦'},
    {t:q||'Marketing Manager',c:'Shoprite Holdings',l:l,s:'indeed',i:'🛒'},
    {t:q||'Software Developer',c:'Naspers/Prosus',l:l,s:'linkedin',i:'💡'},
    {t:q||'Customer Service Agent',c:'Telkom SA',l:l,s:'indeed',i:'☎️'},
  ];
  const filtered=platform==='both'?jobs:jobs.filter(j=>j.s===platform);
  document.getElementById('job-res').innerHTML=`
    <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap">
      ${platform!=='indeed'?`<a href="${li}" target="_blank" style="flex:1;background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.2);color:var(--sky);border-radius:10px;padding:12px;text-align:center;font-size:13px;font-weight:600;text-decoration:none;min-width:140px">🔗 Open LinkedIn Jobs</a>`:''}
      ${platform!=='linkedin'?`<a href="${ind}" target="_blank" style="flex:1;background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);color:#fbbf24;border-radius:10px;padding:12px;text-align:center;font-size:13px;font-weight:600;text-decoration:none;min-width:140px">🔍 Open Indeed Jobs</a>`:''}
    </div>
    ${filtered.map(j=>`
      <div class="job-card">
        <div class="job-logo">${j.i}</div>
        <div class="job-info"><strong>${j.t}</strong><small>${j.c} · ${j.l} · <span style="color:${j.s==='linkedin'?'var(--sky)':'#fbbf24'}">${j.s==='linkedin'?'LinkedIn':'Indeed'}</span></small></div>
        <a href="${j.s==='linkedin'?li:ind}" target="_blank" class="job-apply">Apply →</a>
      </div>`).join('')}`;
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
