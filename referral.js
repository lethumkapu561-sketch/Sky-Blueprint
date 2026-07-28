// ════════════════════════════════════════════════════════════════
// SKY BLUEPRINT REFERRAL & AFFILIATE SYSTEM
// 20% Commission on all recurring subscriptions
// ════════════════════════════════════════════════════════════════

const REFERRAL_CONFIG = {
  commissionPercent: 20,
  referralDuration: 'lifetime', // permanent commission on all their referrals
  paymentMethod: 'paystack'
};

// ─── Generate Unique Referral Code ───
function generateReferralCode(username) {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ref_${username}_${timestamp.substring(0, 4)}${random}`.toLowerCase().slice(0, 20);
}

// ─── Store Referral Code for User ───
function createUserReferralCode(userId, username) {
  const code = generateReferralCode(username);
  localStorage.setItem(`referral_code_${userId}`, code);
  localStorage.setItem(`referral_created_${userId}`, new Date().toISOString());
  return code;
}

// ─── Get User's Referral Code ───
function getUserReferralCode(userId) {
  return localStorage.getItem(`referral_code_${userId}`) || null;
}

// ─── Get Referral Code from URL ───
function getReferralCodeFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('ref') || null;
}

// ─── Save Referrer ID to Local Storage ───
function saveReferrerCode(referralCode) {
  localStorage.setItem('current_referrer_code', referralCode);
  localStorage.setItem('referrer_code_timestamp', new Date().toISOString());
  console.log('Saved referrer code:', referralCode);
}

// ─── Get Saved Referrer Code ───
function getSavedReferrerCode() {
  return localStorage.getItem('current_referrer_code') || null;
}

// ─── Track Referral Click ───
function trackReferralClick(referralCode) {
  const referralData = {
    code: referralCode,
    clickedAt: new Date().toISOString(),
    userAgent: navigator.userAgent,
    referrerUrl: document.referrer
  };
  
  // Save to localStorage
  let clicks = JSON.parse(localStorage.getItem('referral_clicks') || '[]');
  clicks.push(referralData);
  localStorage.setItem('referral_clicks', JSON.stringify(clicks));
  
  // Save as current referrer
  saveReferrerCode(referralCode);
  
  return referralData;
}

// ─── Record Subscription Conversion ───
function recordReferralConversion(subscribedUserId, subscriptionAmount, planType) {
  const referralCode = getSavedReferrerCode();
  
  if (!referralCode) {
    console.log('No referral code found - organic subscription');
    return null;
  }
  
  const commission = (subscriptionAmount * REFERRAL_CONFIG.commissionPercent) / 100;
  
  const conversionData = {
    referralCode: referralCode,
    subscribedUserId: subscribedUserId,
    subscriptionAmount: subscriptionAmount,
    commissionAmount: commission,
    planType: planType,
    convertedAt: new Date().toISOString(),
    payoutStatus: 'pending'
  };
  
  // Save to localStorage
  let conversions = JSON.parse(localStorage.getItem('referral_conversions') || '[]');
  conversions.push(conversionData);
  localStorage.setItem('referral_conversions', JSON.stringify(conversions));
  
  // Send to server/Paystack for tracking
  sendConversionToServer(conversionData);
  
  return conversionData;
}

// ─── Send Conversion Data to Server ───
async function sendConversionToServer(conversionData) {
  try {
    const response = await fetch('/api/referral/conversion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(conversionData)
    });
    
    if (!response.ok) {
      console.error('Failed to record conversion:', response.status);
    }
  } catch (error) {
    console.error('Error sending conversion data:', error);
    // Data is already saved locally
  }
}

// ─── Get Total Referral Earnings ───
function getTotalReferralEarnings(referralCode) {
  const conversions = JSON.parse(localStorage.getItem('referral_conversions') || '[]');
  
  return conversions
    .filter(c => c.referralCode === referralCode)
    .reduce((total, c) => total + c.commissionAmount, 0);
}

// ─── Get Active Referrals Count ───
function getActiveReferralCount(referralCode) {
  const conversions = JSON.parse(localStorage.getItem('referral_conversions') || '[]');
  
  return conversions
    .filter(c => c.referralCode === referralCode && c.payoutStatus !== 'cancelled')
    .length;
}

// ─── Display Referral Dashboard ───
function renderReferralDashboard(userId, username) {
  const referralCode = getUserReferralCode(userId) || createUserReferralCode(userId, username);
  const referralLink = `${window.location.origin}?ref=${referralCode}`;
  const earnings = getTotalReferralEarnings(referralCode);
  const activeReferrals = getActiveReferralCount(referralCode);
  
  const monthlyEarnings = earnings; // Simplified - real version tracks monthly
  
  const dashboard = `
    <div class="referral-dashboard">
      <div class="rd-header">
        <h3>Your Referral Program</h3>
        <p>Earn ${REFERRAL_CONFIG.commissionPercent}% commission on every friend you refer</p>
      </div>
      
      <div class="rd-stats">
        <div class="rd-stat">
          <div class="rs-value">$${monthlyEarnings.toFixed(2)}</div>
          <div class="rs-label">Total Earnings</div>
        </div>
        <div class="rd-stat">
          <div class="rs-value">${activeReferrals}</div>
          <div class="rs-label">Active Referrals</div>
        </div>
        <div class="rd-stat">
          <div class="rs-value">${REFERRAL_CONFIG.commissionPercent}%</div>
          <div class="rs-label">Commission</div>
        </div>
      </div>
      
      <div class="rd-section">
        <div class="rd-title">Your Referral Link</div>
        <div class="rd-link-box">
          <input type="text" value="${referralLink}" readonly id="ref-link-input" class="rd-link-input">
          <button onclick="copyReferralLink('${referralLink}')" class="rd-copy-btn">Copy Link</button>
        </div>
        <p class="rd-hint">Share this link with friends. When they sign up, you earn ${REFERRAL_CONFIG.commissionPercent}% commission!</p>
      </div>
      
      <div class="rd-section">
        <div class="rd-title">Share On Social</div>
        <div class="rd-social-buttons">
          <button onclick="shareReferralOnWhatsApp('${referralLink}')" class="rd-social whatsapp">WhatsApp</button>
          <button onclick="shareReferralOnX('${referralLink}')" class="rd-social twitter">X (Twitter)</button>
          <button onclick="shareReferralOnFacebook('${referralLink}')" class="rd-social facebook">Facebook</button>
          <button onclick="shareReferralOnLinkedIn('${referralLink}')" class="rd-social linkedin">LinkedIn</button>
        </div>
      </div>
      
      <div class="rd-section">
        <div class="rd-title">How It Works</div>
        <div class="rd-steps">
          <div class="rd-step">
            <div class="rs-num">1</div>
            <div class="rs-text"><strong>Share your link</strong> with friends and colleagues</div>
          </div>
          <div class="rd-step">
            <div class="rs-num">2</div>
            <div class="rs-text"><strong>They subscribe</strong> using your referral link</div>
          </div>
          <div class="rd-step">
            <div class="rs-num">3</div>
            <div class="rs-text"><strong>You earn</strong> ${REFERRAL_CONFIG.commissionPercent}% of their monthly subscription</div>
          </div>
          <div class="rd-step">
            <div class="rs-num">4</div>
            <div class="rs-text"><strong>Get paid</strong> automatically via Paystack each month</div>
          </div>
        </div>
      </div>
      
      <div class="rd-faq">
        <div class="rd-title">FAQ</div>
        <div class="faq-item">
          <div class="faq-q">How long do I get paid?</div>
          <div class="faq-a">Forever! As long as your referral stays subscribed, you earn ${REFERRAL_CONFIG.commissionPercent}%</div>
        </div>
        <div class="faq-item">
          <div class="faq-q">When do I get paid?</div>
          <div class="faq-a">Payouts happen automatically every month to your bank account</div>
        </div>
        <div class="faq-item">
          <div class="faq-q">Is there a limit to earnings?</div>
          <div class="faq-a">No! Refer as many people as you want and earn unlimited commission</div>
        </div>
      </div>
    </div>
  `;
  
  return dashboard;
}

// ─── Copy Referral Link ───
function copyReferralLink(link) {
  navigator.clipboard.writeText(link).then(() => {
    alert('Referral link copied to clipboard! 🎉');
  });
}

// ─── Share Functions ───
function shareReferralOnWhatsApp(link) {
  const text = `🚀 Check out Sky Blueprint - all the tools you need for just $2.99/month! ${link}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function shareReferralOnX(link) {
  const text = `I'm using Sky Blueprint and earning money by referring friends! 💰 Join me: ${link}`;
  window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
}

function shareReferralOnFacebook(link) {
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`, '_blank');
}

function shareReferralOnLinkedIn(link) {
  const text = `Discover Sky Blueprint - 13 powerful tools for South African entrepreneurs. I'm earning money by referring! ${link}`;
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`, '_blank');
}

// ─── Initialize Referral System on Page Load ───
function initReferralSystem() {
  const referralCode = getReferralCodeFromURL();
  
  if (referralCode) {
    trackReferralClick(referralCode);
    console.log('Referral tracked:', referralCode);
  }
}

// ─── Paystack Integration for Referral Payouts ───
function setupReferralPayouts(referralCode, payoutAmount) {
  const referrerEmail = localStorage.getItem(`referrer_email_${referralCode}`);
  
  // This would be called by your backend when processing Paystack payments
  const paystackConfig = {
    email: referrerEmail,
    amount: payoutAmount * 100, // Paystack uses cents
    metadata: {
      referralCode: referralCode,
      type: 'referral_commission',
      reference: `ref_${referralCode}_${Date.now()}`
    }
  };
  
  return paystackConfig;
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReferralSystem);
} else {
  initReferralSystem();
}
