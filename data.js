// ============================================================
// RakshaAI — Data Models, Mock Data & Utility Functions
// ============================================================

const RakshaData = {
  // ---- Current User ----
  currentUser: {
    id: 'user_001',
    name: 'Priya Sharma',
    phone: '+91 98765 43210',
    language: 'en',
    preferences: {
      nightMode: true,
      safetyPriority: 'balanced', // fastest | balanced | safest
      notifications: true,
      shareLocationByDefault: false
    }
  },

  // ---- Trusted Contacts ----
  trustedContacts: [
    { id: 'tc_001', userId: 'user_001', name: 'Mom', phone: '+91 98765 11111', relationship: 'Mother', sosEnabled: true, avatar: '👩' },
    { id: 'tc_002', userId: 'user_001', name: 'Dad', phone: '+91 98765 22222', relationship: 'Father', sosEnabled: true, avatar: '👨' },
    { id: 'tc_003', userId: 'user_001', name: 'Rahul', phone: '+91 98765 33333', relationship: 'Friend', sosEnabled: true, avatar: '🧑' },
    { id: 'tc_004', userId: 'user_001', name: 'Sister', phone: '+91 98765 44444', relationship: 'Sister', sosEnabled: false, avatar: '👧' }
  ],

  // ---- Demo Locations (Bangalore) ----
  demoLocations: {
    origin: { lat: 12.9716, lng: 77.5946, name: 'MG Road, Bangalore' },
    destination: { lat: 13.0358, lng: 77.5970, name: 'Hebbal, Bangalore' },
    altDestination: { lat: 12.9063, lng: 77.5857, name: 'Koramangala, Bangalore' }
  },

  // ---- Safety Reports (Community) ----
  safetyReports: [
    {
      id: 'sr_001', location: { lat: 12.9820, lng: 77.6010, name: 'Shivajinagar Road' },
      category: 'poor_lighting', description: 'Street lights are broken on the main road near the junction. Very dark after 8pm.',
      timestamp: Date.now() - 18 * 60000, severity: 'high', confirmations: 12, status: 'active',
      reporter: 'user_anon_001', reporterName: 'Amit K.', verificationStatus: 'confirmed'
    },
    {
      id: 'sr_002', location: { lat: 12.9780, lng: 77.5980, name: 'Cubbon Park Lane' },
      category: 'isolated_area', description: 'The lane behind the park is very isolated at night. Few people around.',
      timestamp: Date.now() - 45 * 60000, severity: 'medium', confirmations: 8, status: 'active',
      reporter: 'user_anon_002', reporterName: 'Sneha R.', verificationStatus: 'confirmed'
    },
    {
      id: 'sr_003', location: { lat: 12.9750, lng: 77.5920, name: 'Brigade Road Junction' },
      category: 'suspicious_activity', description: 'Group of people loitering near ATM at night. Felt uncomfortable.',
      timestamp: Date.now() - 120 * 60000, severity: 'medium', confirmations: 5, status: 'active',
      reporter: 'user_anon_003', reporterName: 'Vikram P.', verificationStatus: 'community_report'
    },
    {
      id: 'sr_004', location: { lat: 12.9850, lng: 77.6050, name: 'Commercial Street Back Alley' },
      category: 'harassment', description: 'Verbal harassment reported by multiple commuters at this junction.',
      timestamp: Date.now() - 30 * 60000, severity: 'high', confirmations: 15, status: 'active',
      reporter: 'user_anon_004', reporterName: 'Deepa M.', verificationStatus: 'confirmed'
    },
    {
      id: 'sr_005', location: { lat: 12.9700, lng: 77.5880, name: 'KR Market Back Road' },
      category: 'unsafe_road', description: 'Road is poorly maintained, no footpath. Vehicles speed through.',
      timestamp: Date.now() - 60 * 60000, severity: 'medium', confirmations: 7, status: 'active',
      reporter: 'user_anon_005', reporterName: 'Arjun S.', verificationStatus: 'community_report'
    },
    {
      id: 'sr_006', location: { lat: 12.9900, lng: 77.6100, name: 'Frazer Town Lane' },
      category: 'transport', description: 'No public transport available after 10pm. Auto drivers refuse to come here.',
      timestamp: Date.now() - 90 * 60000, severity: 'low', confirmations: 4, status: 'active',
      reporter: 'user_anon_006', reporterName: 'Kavya L.', verificationStatus: 'community_report'
    },
    {
      id: 'sr_007', location: { lat: 12.9680, lng: 77.5830, name: 'JC Road Underpass' },
      category: 'poor_lighting', description: 'Underpass lighting completely off. Very unsafe feeling.',
      timestamp: Date.now() - 15 * 60000, severity: 'high', confirmations: 18, status: 'active',
      reporter: 'user_anon_007', reporterName: 'Ravi T.', verificationStatus: 'confirmed'
    },
    {
      id: 'sr_008', location: { lat: 12.9730, lng: 77.5960, name: 'Residency Road' },
      category: 'no_activity', description: 'Area becomes completely deserted after 11pm. No shops open.',
      timestamp: Date.now() - 200 * 60000, severity: 'low', confirmations: 3, status: 'active',
      reporter: 'user_anon_008', reporterName: 'Meera J.', verificationStatus: 'community_report'
    },
    {
      id: 'sr_009', location: { lat: 12.9870, lng: 77.6080, name: 'Pulakeshi Nagar 3rd Cross' },
      category: 'suspicious_activity', description: 'Unmarked van parked in same spot for several nights.',
      timestamp: Date.now() - 60 * 60000, severity: 'medium', confirmations: 6, status: 'active',
      reporter: 'user_anon_009', reporterName: 'Suresh B.', verificationStatus: 'community_report'
    },
    {
      id: 'sr_010', location: { lat: 12.9760, lng: 77.5940, name: 'MG Road Signal' },
      category: 'other', description: 'Stray dogs aggressive in this area during night hours.',
      timestamp: Date.now() - 40 * 60000, severity: 'low', confirmations: 9, status: 'active',
      reporter: 'user_anon_010', reporterName: 'Anita D.', verificationStatus: 'confirmed'
    }
  ],

  // ---- Emergency Facilities ----
  emergencyFacilities: [
    { id: 'ef_001', type: 'hospital', name: 'Victoria Hospital', lat: 12.9592, lng: 77.5741, phone: '080-26701234', distance: '2.3 km' },
    { id: 'ef_002', type: 'police', name: 'Shivajinagar Police Station', lat: 12.9820, lng: 77.6010, phone: '100', distance: '0.8 km' },
    { id: 'ef_003', type: 'hospital', name: 'St. Martha\'s Hospital', lat: 12.9720, lng: 77.5950, phone: '080-22244577', distance: '0.5 km' },
    { id: 'ef_004', type: 'police', name: 'Cubbon Park Police Station', lat: 12.9760, lng: 77.5920, phone: '100', distance: '1.2 km' },
    { id: 'ef_005', type: 'hospital', name: 'Narayana Health City', lat: 12.9100, lng: 77.6500, phone: '080-71222222', distance: '8.5 km' },
    { id: 'ef_006', type: 'fire', name: 'Fire Station - Central', lat: 12.9710, lng: 77.5870, phone: '101', distance: '1.0 km' },
    { id: 'ef_007', type: 'police', name: 'MG Road Police Station', lat: 12.9750, lng: 77.5950, phone: '100', distance: '0.3 km' }
  ],

  // ---- Route Templates for Demo ----
  routeOptions: [
    {
      id: 'route_fastest',
      type: 'fastest',
      time: 18,
      distance: 6.2,
      safetyScore: 42,
      safetyLabel: 'higher_concerns',
      color: '#ef4444',
      path: [
        [12.9716, 77.5946], [12.9740, 77.5960], [12.9770, 77.5985],
        [12.9800, 77.6000], [12.9840, 77.6010], [12.9880, 77.6020],
        [12.9920, 77.6030], [12.9960, 77.6010], [13.0000, 77.5990],
        [13.0050, 77.5980], [13.0100, 77.5975], [13.0150, 77.5970],
        [13.0200, 77.5968], [13.0250, 77.5965], [13.0300, 77.5968],
        [13.0358, 77.5970]
      ],
      reports: ['sr_001', 'sr_002', 'sr_007'],
      factors: [
        { label: 'Multiple recent safety reports', icon: '⚠️', impact: 'negative' },
        { label: 'Poor lighting detected', icon: '🌑', impact: 'negative' },
        { label: 'Isolated sections identified', icon: '🚶', impact: 'negative' },
        { label: 'Fastest travel time', icon: '⏱️', impact: 'positive' }
      ],
      nightFactor: 'Route passes through poorly lit areas after 9pm. Street activity drops significantly.',
      isRecommended: false
    },
    {
      id: 'route_balanced',
      type: 'balanced',
      time: 21,
      distance: 6.8,
      safetyScore: 67,
      safetyLabel: 'use_caution',
      color: '#f59e0b',
      path: [
        [12.9716, 77.5946], [12.9730, 77.5940], [12.9760, 77.5935],
        [12.9800, 77.5940], [12.9830, 77.5950], [12.9870, 77.5960],
        [12.9910, 77.5970], [12.9950, 77.5975], [13.0000, 77.5980],
        [13.0050, 77.5985], [13.0100, 77.5990], [13.0150, 77.5995],
        [13.0200, 77.5990], [13.0250, 77.5985], [13.0300, 77.5978],
        [13.0358, 77.5970]
      ],
      reports: ['sr_003'],
      factors: [
        { label: 'Moderate community reports', icon: '⚠️', impact: 'neutral' },
        { label: 'Some well-lit sections', icon: '💡', impact: 'positive' },
        { label: 'Active commercial area', icon: '🏪', impact: 'positive' },
        { label: 'Slightly longer route', icon: '⏱️', impact: 'neutral' }
      ],
      nightFactor: 'Moderate lighting. Some sections pass through active areas even at night.',
      isRecommended: false
    },
    {
      id: 'route_safest',
      type: 'safest',
      time: 24,
      distance: 7.1,
      safetyScore: 89,
      safetyLabel: 'generally_safer',
      color: '#22c55e',
      path: [
        [12.9716, 77.5946], [12.9710, 77.5930], [12.9700, 77.5920],
        [12.9690, 77.5910], [12.9680, 77.5900], [12.9685, 77.5890],
        [12.9690, 77.5880], [12.9700, 77.5870], [12.9720, 77.5865],
        [12.9740, 77.5860], [12.9760, 77.5855], [12.9780, 77.5850],
        [12.9810, 77.5848], [12.9850, 77.5845], [12.9890, 77.5848],
        [12.9930, 77.5855], [12.9970, 77.5865], [13.0010, 77.5880],
        [13.0060, 77.5895], [13.0110, 77.5910], [13.0160, 77.5925],
        [13.0210, 77.5940], [13.0260, 77.5950], [13.0310, 77.5958],
        [13.0358, 77.5970]
      ],
      reports: [],
      factors: [
        { label: 'No recent safety reports', icon: '✅', impact: 'positive' },
        { label: 'Well-lit main roads', icon: '💡', impact: 'positive' },
        { label: 'Active commercial areas', icon: '🏪', impact: 'positive' },
        { label: 'Nearby emergency facilities', icon: '🏥', impact: 'positive' },
        { label: 'Higher pedestrian activity', icon: '👥', impact: 'positive' }
      ],
      nightFactor: 'This route stays on well-lit main roads with active shops and restaurants throughout the journey.',
      isRecommended: true
    }
  ],

  // ---- Safer Route Details ----
  saferRouteExplanation: {
    why: [
      'Route A passes through Shivajinagar Road where 12 users confirmed poor lighting',
      'Commercial Street back alley has 15 community confirmations of harassment',
      'JC Road underpass has 18 reports — the most reported danger spot',
      'Route C avoids all high-report areas by taking Brigade Road → Residency Road → Outer Ring Road'
    ],
    betterLighting: true,
    moreActiveAreas: true,
    fewerReports: true,
    nearEmergencyFacilities: true,
    communityVerifications: 45
  },

  // ---- Journey Tracking ----
  activeJourney: null,

  // ---- Emergency Events ----
  emergencyEvents: [],

  // ---- AI Assistant Responses ----
  aiResponses: {
    'route_safe_night': '🌙 At night, Route C (Safer Route) is recommended. It stays on well-lit main roads with active shops. While it takes 6 minutes longer, it has zero recent safety reports vs 35+ reports on the fastest route.',
    'share_location': '📍 To share your live location: Open Safe Journey → Start Journey → Toggle "Share Live Location" → Select trusted contacts. They\'ll receive your real-time location until you stop sharing.',
    'feel_unsafe': '🆘 If you feel unsafe:\n1. Stay calm and move toward well-lit, populated areas\n2. Open RakshaAI and press the SOS button\n3. Call 100 (Police) or 1091 (Women Helpline)\n4. Share your live location with trusted contacts\n5. Your location will be tracked until you\'re safe',
    'nearest_emergency': '🏥 Based on your current location:\n• Police: Shivajinagar PS — 0.8 km\n• Hospital: St. Martha\'s — 0.5 km\n• Fire: Central Station — 1.0 km\n\nEmergency Numbers:\n• Police: 100\n• Ambulance: 108\n• Women Helpline: 1091',
    'activate_sos': '🚨 To activate SOS:\n1. Tap the red SOS button on the dashboard\n2. A 5-second countdown will begin\n3. Cancel anytime during countdown\n4. Once activated: trusted contacts are alerted, live location shared, and emergency options displayed\n\n⚠️ Only activate in real emergencies.',
    'safety_score': '📊 Safety Score (0-100) considers:\n• Community reports & confirmations\n• Street lighting data\n• Time of day\n• Nearby public places & emergency facilities\n• Route isolation level\n\n🟢 80-100: Generally safer\n🟠 50-79: Use caution\n🔴 0-49: Higher concerns reported',
    'report_unsafe': '📝 To report an unsafe area:\n1. Open Safety Map\n2. Tap "Report" or long-press on map\n3. Select category (lighting, isolated, etc.)\n4. Add description & optional photo\n5. Submit — it appears on the community map\n\nYour identity stays anonymous in public reports.',
    'default': 'I\'m RakshaAI Assistant — your safety companion. I can help with:\n• Route safety recommendations\n• Emergency procedures\n• Location sharing\n• Safety tips\n\nAsk me anything about staying safe!',
    'hello': 'Hello! 👋 I\'m RakshaAI Assistant. How can I help you stay safe today?\n\nTry asking about:\n• "Is this route safe at night?"\n• "How do I share my location?"\n• "What should I do if I feel unsafe?"'
  }
};

// ---- Proximity helper for dynamic route scoring ----
function getMinDistanceToPath(lat, lng, path) {
  let minDistance = Infinity;
  for (let i = 0; i < path.length; i++) {
    const p = path[i];
    const dx = lat - p[0];
    const dy = lng - p[1];
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDistance) minDistance = dist;
  }
  return minDistance;
}

// ---- Safety Score Calculator ----
function calculateSafetyScore(route, reports, timeOfDay) {
  let score = 95; // High base score for a clear route
  
  // Get reports on this route by ID match or spatial proximity (within ~250 meters)
  const routeReports = reports.filter(r => {
    // If flagged as resolved, ignore it
    if (r.status === 'resolved' || (r.downvotes && r.downvotes > r.confirmations)) {
      return false;
    }
    
    // Check by ID match
    if (route.reports && route.reports.includes(r.id)) return true;
    
    // Check by proximity
    if (route.path && r.location) {
      const dist = getMinDistanceToPath(r.location.lat, r.location.lng, route.path);
      return dist < 0.0025;
    }
    return false;
  });
  
  // Deduct points for reports
  routeReports.forEach(r => {
    let penalty = 0;
    
    // 1. Severity weight
    if (r.severity === 'high') penalty += 15;
    else if (r.severity === 'medium') penalty += 10;
    else penalty += 5;
    
    // 2. Recency weight (older reports decay and have less penalty)
    const ageMinutes = (Date.now() - r.timestamp) / 60000;
    if (ageMinutes < 30) {
      penalty += 10; // Very recent
    } else if (ageMinutes < 60) {
      penalty += 5;  // Moderate recency
    } else if (ageMinutes < 180) {
      penalty += 2;  // Older
    } else {
      penalty *= 0.5; // Natural decay: reports older than 3 hours have half penalty
    }
    
    // 3. Confirmations weight
    const activeConfirmations = Math.max(0, (r.confirmations || 0) - (r.downvotes || 0));
    penalty += Math.min(activeConfirmations * 1.5, 20);
    
    // 4. Night Mode Factor: Multiply poor lighting and isolation penalties at night
    const hour = timeOfDay !== undefined ? timeOfDay : new Date().getHours();
    const isNight = hour >= 20 || hour < 6;
    if (isNight) {
      if (r.category === 'poor_lighting' || r.category === 'isolated_area') {
        penalty *= 1.5;
      }
    }
    
    score -= penalty;
  });
  
  // 5. Time of day base penalty
  const hour = timeOfDay !== undefined ? timeOfDay : new Date().getHours();
  const isNight = hour >= 20 || hour < 6;
  if (isNight) {
    score -= 10; // General night penalty
  }
  
  // 6. Emergency Facilities proximity bonus (within ~300 meters of route)
  let facilityBonus = 0;
  if (route.path) {
    RakshaData.emergencyFacilities.forEach(ef => {
      const dist = getMinDistanceToPath(ef.lat, ef.lng, route.path);
      if (dist < 0.0035) {
        facilityBonus += 4; // Add 4 points for every nearby emergency facility
      }
    });
  }
  score += Math.min(facilityBonus, 12); // Max bonus is +12
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getSafetyLabel(score) {
  if (score >= 80) return { label: 'generally_safer', color: '#ec4899', icon: '🟢' }; // Changed to branding color if needed, but color circles keep color codes
  if (score >= 50) return { label: 'use_caution', color: '#f59e0b', icon: '🟠' };
  return { label: 'higher_concerns', color: '#ef4444', icon: '🔴' };
}

function formatTimestamp(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} minutes ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

function isNightTime() {
  const hour = new Date().getHours();
  return hour >= 20 || hour < 6;
}

function getCategoryIcon(cat) {
  const icons = {
    poor_lighting: '🌑',
    isolated_area: '🏚️',
    harassment: '⚠️',
    suspicious_activity: '👁️',
    unsafe_road: '🛣️',
    no_activity: '🏜️',
    transport: '🚌',
    other: '📌'
  };
  return icons[cat] || '📌';
}

function getCategoryLabel(cat, lang) {
  const labels = {
    en: {
      poor_lighting: 'Poor Lighting', isolated_area: 'Isolated Area', harassment: 'Harassment Concern',
      suspicious_activity: 'Suspicious Activity', unsafe_road: 'Unsafe Road', no_activity: 'No Public Activity',
      transport: 'Transport Issue', other: 'Other'
    },
    hi: {
      poor_lighting: 'कम रोशनी', isolated_area: 'अलग-थलग क्षेत्र', harassment: 'उत्पीड़न चिंता',
      suspicious_activity: 'संदिग्ध गतिविधि', unsafe_road: 'असुरक्षित सड़क', no_activity: 'कोई सार्वजनिक गतिविधि नहीं',
      transport: 'परिवहन समस्या', other: 'अन्य'
    }
  };
  return (labels[lang] || labels.en)[cat] || cat;
}

function getRelationshipLabel(rel, lang) {
  const labels = {
    en: { Mother: 'Mother', Father: 'Father', Friend: 'Friend', Sister: 'Sister', Brother: 'Brother', Partner: 'Partner', 'Emergency contact': 'Emergency contact' },
    hi: { Mother: 'माँ', Father: 'पिता', Friend: 'दोस्त', Sister: 'बहन', Brother: 'भाई', Partner: 'साथी', 'Emergency contact': 'आपातकालीन संपर्क' }
  };
  return (labels[lang] || labels.en)[rel] || rel;
}

// ---- Bilingual Legal Information Database (Inform Pillar) ----
RakshaData.legalData = {
  rights: [
    {
      id: 'harassment',
      title: { en: 'Harassment', hi: 'उत्पीड़न' },
      meaning: {
        en: 'Any unwelcome physical, verbal or non-verbal conduct of a sexual nature, or gestures that insult modesty in public or workplace environments.',
        hi: 'यौन प्रकृति का कोई भी अवांछित शारीरिक, मौखिक या गैर-मौखिक आचरण, या सार्वजनिक या कार्यस्थल के वातावरण में गरिमा का अपमान करने वाले इशारे।'
      },
      whatToDo: {
        en: '1. Object immediately and loudly to alert bystanders.\n2. Note details (time, location, descriptions, vehicle numbers).\n3. Collect any photo/video evidence if safe.\n4. Call Police (100) or Women Helpline (1091).',
        hi: '1. आस-पास के लोगों को सचेत करने के लिए तुरंत और जोर से विरोध करें।\n2. विवरण (समय, स्थान, विवरण, वाहन संख्या) नोट करें।\n3. सुरक्षित होने पर फोटो/वीडियो साक्ष्य एकत्र करें।\n4. पुलिस (100) या महिला हेल्पलाइन (1091) को कॉल करें।'
      },
      whereToReport: {
        en: 'Nearest Police Station, NCW Helpline (1091), or workplace Internal Complaints Committee (ICC) for workplace incidents.',
        hi: 'निकटतम पुलिस स्टेशन, राष्ट्रीय महिला आयोग हेल्पलाइन (1091), या कार्यस्थल की घटनाओं के लिए आंतरिक शिकायत समिति (ICC)।'
      },
      laws: ['ipc_509', 'ipc_354a', 'bns_75'],
      cases: ['vishaka']
    },
    {
      id: 'stalking',
      title: { en: 'Stalking', hi: 'पीछा करना' },
      meaning: {
        en: 'Following a woman, contacting or attempting to contact her to foster personal interaction repeatedly despite a clear indication of disinterest, or monitoring her internet/email/electronic communication.',
        hi: 'किसी महिला का पीछा करना, अरुचि के स्पष्ट संकेत के बावजूद व्यक्तिगत बातचीत को बढ़ावा देने के लिए बार-बार उससे संपर्क करना या संपर्क करने का प्रयास करना, या उसके इंटरनेट/ईमेल/इलेक्ट्रॉनिक संचार की निगरानी करना।'
      },
      whatToDo: {
        en: '1. Clear statement of disinterest to establish lack of consent.\n2. Keep screenshots, log calls, and save messages.\n3. Inform trusted contacts immediately.\n4. File a complaint under Section 354D IPC.',
        hi: '1. सहमति की कमी स्थापित करने के लिए अरुचि का स्पष्ट कथन दें।\n2. स्क्रीनशॉट रखें, कॉल लॉग करें और संदेश सहेजें।\n3. विश्वसनीय संपर्कों को तुरंत सूचित करें।\n4. धारा 354D आईपीसी के तहत शिकायत दर्ज करें।'
      },
      whereToReport: {
        en: 'Local Police Station (request Zero FIR if outside area), Cyber Cell for online stalking, or National Commission for Women.',
        hi: 'स्थानीय पुलिस स्टेशन (यदि क्षेत्र से बाहर हैं तो जीरो एफआईआर का अनुरोध करें), ऑनलाइन पीछा करने के लिए साइबर सेल, या राष्ट्रीय महिला आयोग।'
      },
      laws: ['ipc_354d'],
      cases: ['vishaka']
    },
    {
      id: 'assault',
      title: { en: 'Assault & Modesty Outrage', hi: 'हमला और शीलभंग' },
      meaning: {
        en: 'Using physical force or assault against any woman, intending to outrage or knowing it to be likely that modesty will be outraged.',
        hi: 'किसी भी महिला के खिलाफ शारीरिक बल या हमले का उपयोग करना, जिसका उद्देश्य मर्यादा को ठेस पहुँचाना हो या यह जानते हुए कि इससे मर्यादा को ठेस पहुँचने की संभावना है।'
      },
      whatToDo: {
        en: '1. Shout for help, use self-defense if trained.\n2. Use emergency SOS immediately to alert family and share live GPS.\n3. Seek medical attention immediately to record injuries.\n4. File an FIR at the nearest police station.',
        hi: '1. मदद के लिए चिल्लाएं, प्रशिक्षित होने पर आत्मरक्षा का उपयोग करें।\n2. परिवार को सचेत करने और लाइव जीपीएस साझा करने के लिए तुरंत आपातकालीन SOS का उपयोग करें।\n3. चोटों को रिकॉर्ड करने के लिए तुरंत चिकित्सा सहायता लें।\n4. निकटतम पुलिस स्टेशन में प्राथमिकी (FIR) दर्ज करें।'
      },
      whereToReport: {
        en: 'Call 100/112 (Police) or 1091 (Women Helpline) immediately. Report to nearest police station for medical and legal assistance.',
        hi: 'तुरंत 100/112 (पुलिस) या 1091 (महिला हेल्पलाइन) पर कॉल करें। चिकित्सा और कानूनी सहायता के लिए निकटतम पुलिस स्टेशन को रिपोर्ट करें।'
      },
      laws: ['ipc_354'],
      cases: ['major_singh']
    },
    {
      id: 'threats',
      title: { en: 'Threats & Intimidation', hi: 'धमकियाँ और डराना' },
      meaning: {
        en: 'Threatening a person with injury to their person, reputation or property, with intent to cause alarm or force them to do any act they are not legally bound to do.',
        hi: 'किसी व्यक्ति को उसके शरीर, प्रतिष्ठा या संपत्ति को नुकसान पहुँचाने की धमकी देना, जिसका उद्देश्य भय पैदा करना हो या उन्हें कोई ऐसा कार्य करने के लिए मजबूर करना हो जिसे करने के लिए वे कानूनी रूप से बाध्य नहीं हैं।'
      },
      whatToDo: {
        en: '1. Record threats (call recordings, text messages, voicemail).\n2. Do not delete threat proof.\n3. Report to Police immediately to get a protection record.\n4. Avoid isolated meetings with the threatener.',
        hi: '1. धमकियों को रिकॉर्ड करें (कॉल रिकॉर्डिंग, टेक्स्ट संदेश, वॉइसमेल)।\n2. धमकी के सबूत न मिटाएं।\n3. सुरक्षा रिकॉर्ड प्राप्त करने के लिए तुरंत पुलिस को रिपोर्ट करें।\n4. धमकी देने वाले के साथ अकेले मिलने से बचें।'
      },
      whereToReport: {
        en: 'Local Police Station (Section 506 IPC complaint), Cyber Crime Cell if threats are sent online.',
        hi: 'स्थानीय पुलिस स्टेशन (धारा 506 आईपीसी के तहत शिकायत), यदि धमकियां ऑनलाइन भेजी जाती हैं तो साइबर क्राइम सेल।'
      },
      laws: ['ipc_509'],
      cases: ['shreya_singhal']
    },
    {
      id: 'domestic_violence',
      title: { en: 'Domestic Violence', hi: 'घरेलू हिंसा' },
      meaning: {
        en: 'Physical, sexual, verbal, emotional, or economic abuse committed by a spousal partner or relative within a domestic relationship.',
        hi: 'घरेलू संबंध के भीतर पति या रिश्तेदार द्वारा की गई शारीरिक, यौन, मौखिक, भावनात्मक या आर्थिक प्रताड़ना।'
      },
      whatToDo: {
        en: '1. Call National Helpline 181 or NCW cell.\n2. Connect with Protection Officers under the DV Act.\n3. Preserve medical records and logs.\n4. File a complaint under Section 498A IPC for cruelty.',
        hi: '1. राष्ट्रीय हेल्पलाइन 181 या NCW सेल को कॉल करें।\n2. घरेलू हिंसा अधिनियम के तहत संरक्षण अधिकारियों से संपर्क करें।\n3. मेडिकल रिकॉर्ड और लॉग सुरक्षित रखें।\n4. क्रूरता के लिए धारा 498A आईपीसी के तहत शिकायत दर्ज करें।'
      },
      whereToReport: {
        en: 'National Helpline (181), Protection Officers, Local Magistrate, or nearest Police Station.',
        hi: 'राष्ट्रीय हेल्पलाइन (181), संरक्षण अधिकारी, स्थानीय मजिस्ट्रेट, या निकटतम पुलिस स्टेशन।'
      },
      laws: ['ipc_498a'],
      cases: ['independent_thought']
    },
    {
      id: 'cyber_harassment',
      title: { en: 'Cyber Harassment', hi: 'साइबर उत्पीड़न' },
      meaning: {
        en: 'Harassment using electronic communications, including cyberstalking, publishing private photos without consent, sending unsolicited obscene messages, or identity theft.',
        hi: 'इलेक्ट्रॉनिक संचार का उपयोग करके उत्पीड़न, जिसमें साइबर स्टॉकिंग, सहमति के बिना निजी तस्वीरें प्रकाशित करना, अवांछित अश्लील संदेश भेजना या पहचान की चोरी शामिल है।'
      },
      whatToDo: {
        en: '1. Take screenshots and preserve digital links immediately.\n2. Do not engage or reply to the harasser.\n3. Report & block on the social platform.\n4. File an official complaint on the National Cyber Crime Portal.',
        hi: '1. स्क्रीनशॉट लें और डिजिटल लिंक तुरंत सुरक्षित करें।\n2. उत्पीड़न करने वाले के साथ बातचीत या जवाब न दें।\n3. सोशल प्लेटफॉर्म पर रिपोर्ट और ब्लॉक करें।\n4. राष्ट्रीय साइबर अपराध पोर्टल पर एक आधिकारिक शिकायत दर्ज करें।'
      },
      whereToReport: {
        en: 'National Cyber Crime Reporting Portal (cybercrime.gov.in) or local police Cyber Cell.',
        hi: 'राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल (cybercrime.gov.in) या स्थानीय पुलिस साइबर सेल।'
      },
      laws: ['it_66e', 'it_67', 'it_67a', 'ipc_354d'],
      cases: ['shreya_singhal']
    },
    {
      id: 'sexual_harassment',
      title: { en: 'Sexual Harassment', hi: 'यौन उत्पीड़न' },
      meaning: {
        en: 'Unwelcome sexual advances, requests for sexual favors, or sexually colored remarks in professional, public, or educational spaces.',
        hi: 'पेशेवर, सार्वजनिक या शैक्षणिक स्थानों पर अवांछित यौन व्यवहार, यौन अनुग्रह के अनुरोध, या यौन टिप्पणियां।'
      },
      whatToDo: {
        en: '1. Document all incidents, dates, and witnesses.\n2. Lodge a written complaint with the Internal Complaints Committee (ICC) at your workplace.\n3. Report to Local Complaints Committee (LCC) if ICC is not present.\n4. File an FIR under Section 354A IPC if criminal act occurs.',
        hi: '1. सभी घटनाओं, तारीखों और गवाहों का लिखित दस्तावेजीकरण करें।\n2. अपने कार्यस्थल पर आंतरिक शिकायत समिति (ICC) के पास लिखित शिकायत दर्ज करें।\n3. यदि ICC मौजूद नहीं है तो स्थानीय शिकायत समिति (LCC) को रिपोर्ट करें।\n4. आपराधिक कृत्य होने पर धारा 354A आईपीसी के तहत प्राथमिकी दर्ज करें।'
      },
      whereToReport: {
        en: 'Workplace ICC, Ministry of WCD She-Box portal, or nearest Police Station.',
        hi: 'कार्यस्थल ICC, महिला एवं बाल विकास मंत्रालय का She-Box पोर्टल, या निकटतम पुलिस स्टेशन।'
      },
      laws: ['ipc_354a', 'posh_2013', 'bns_75'],
      cases: ['vishaka']
    },
    {
      id: 'reporting_incident',
      title: { en: 'Reporting Procedures', hi: 'रिपोर्टिंग प्रक्रियाएं' },
      meaning: {
        en: 'Formal procedures to report safety incidents or crimes to the police, including filing FIRs and using emergency channels.',
        hi: 'पुलिस को सुरक्षा घटनाओं या अपराधों की रिपोर्ट करने की औपचारिक प्रक्रियाएं, जिसमें प्राथमिकी (FIR) दर्ज करना और आपातकालीन चैनलों का उपयोग करना शामिल है।'
      },
      whatToDo: {
        en: '1. Know about Zero FIR: You can file an FIR at any police station regardless of where the crime occurred.\n2. Request a copy of the FIR immediately for free (Section 154 CrPC).\n3. Use e-FIR portals for quick online tracking.\n4. You can file anonymous community safety reports on RakshaAI map to inform others.',
        hi: '1. जीरो एफआईआर के बारे में जानें: अपराध कहाँ हुआ, इसकी परवाह किए बिना आप किसी भी पुलिस स्टेशन में प्राथमिकी दर्ज करा सकते हैं।\n2. तुरंत प्राथमिकी (FIR) की एक प्रति निःशुल्क प्राप्त करें (धारा 154 CrPC)।\n3. त्वरित ऑनलाइन ट्रैकिंग के लिए ई-एफआईआर पोर्टलों का उपयोग करें।\n4. दूसरों को सूचित करने के लिए आप रक्षाऐआई मानचित्र पर गुमनाम रूप से रिपोर्ट दर्ज कर सकते हैं।'
      },
      whereToReport: {
        en: 'Any Police Station, State Police online portals, NCW helpline.',
        hi: 'कोई भी पुलिस स्टेशन, राज्य पुलिस के ऑनलाइन पोर्टल, राष्ट्रीय महिला आयोग की हेल्पलाइन।'
      },
      laws: ['crpc_154'],
      cases: ['major_singh']
    }
  ],
  laws: [
    {
      id: 'ipc_354a',
      name: { en: 'Section 354A IPC', hi: 'धारा 354A आईपीसी' },
      section: { en: 'Sexual Harassment', hi: 'यौन उत्पीड़न' },
      explanation: {
        en: 'Defines sexual harassment as physical contact and advances involving unwelcome and explicit sexual overtures; demanding or requesting sexual favors; showing pornography against a woman\'s will; or making sexually colored remarks.',
        hi: 'यौन उत्पीड़न को अवांछित और स्पष्ट यौन प्रस्तावों वाले शारीरिक संपर्क; यौन अनुग्रह की मांग या अनुरोध; महिला की इच्छा के विरुद्ध अश्लील चित्र दिखाना; या यौन टिप्पणियां करने के रूप में परिभाषित करता है।'
      },
      apply: {
        en: 'Punishable by rigorous imprisonment up to 3 years and/or fine.',
        hi: '3 वर्ष तक के कठोर कारावास और/या जुर्माने से दंडनीय।'
      },
      source: { en: 'Indian Penal Code, 1860', hi: 'भारतीय दंड संहिता, 1860' },
      updated: '2026'
    },
    {
      id: 'ipc_354d',
      name: { en: 'Section 354D IPC', hi: 'धारा 354D आईपीसी' },
      section: { en: 'Stalking & Cyberstalking', hi: 'पीछा करना और साइबरस्टॉकिंग' },
      explanation: {
        en: 'Covers physical stalking as well as monitoring a woman\'s use of the internet, email, or other electronic communication without her consent.',
        hi: 'सहमति के बिना महिला के इंटरनेट, ईमेल या अन्य इलेक्ट्रॉनिक संचार के उपयोग की निगरानी करने के साथ-साथ शारीरिक रूप से पीछा करने को शामिल करता है।'
      },
      apply: {
        en: 'Punishable by up to 3 years imprisonment on first conviction, and up to 5 years for repeat offenses.',
        hi: 'पहली सजा पर 3 साल तक की जेल, और बार-बार अपराध करने पर 5 साल तक की सजा।'
      },
      source: { en: 'Indian Penal Code, 1860', hi: 'भारतीय दंड संहिता, 1860' },
      updated: '2026'
    },
    {
      id: 'ipc_354',
      name: { en: 'Section 354 IPC', hi: 'धारा 354 आईपीसी' },
      section: { en: 'Assault to Outrage Modesty', hi: 'मर्यादा भंग करने के लिए हमला' },
      explanation: {
        en: 'Penalizes assault or use of criminal force against any woman, intending to outrage or knowing it to be likely that her modesty will be outraged.',
        hi: 'किसी भी महिला के खिलाफ हमले या आपराधिक बल के प्रयोग को दंडित करता है, जिसका उद्देश्य उसकी लज्जा भंग करना हो या यह जानते हुए कि इससे मर्यादा भंग होने की संभावना है।'
      },
      apply: {
        en: 'Punishable by imprisonment between 1 and 5 years, and a fine.',
        hi: '1 से 5 वर्ष के कारावास और जुर्माने से दंडनीय।'
      },
      source: { en: 'Indian Penal Code, 1860', hi: 'भारतीय दंड संहिता, 1860' },
      updated: '2026'
    },
    {
      id: 'ipc_509',
      name: { en: 'Section 509 IPC', hi: 'धारा 509 आईपीसी' },
      section: { en: 'Insult to Modesty of a Woman', hi: 'महिला की लज्जा का अनादर' },
      explanation: {
        en: 'Penalizes any word, gesture, or sound intended to insult the modesty of a woman, including intruding upon her privacy.',
        hi: 'महिला की लज्जा का अनादर करने के उद्देश्य से कहे गए किसी भी शब्द, इशारे या आवाज को दंडित करता है, जिसमें उसकी गोपनीयता में खलल डालना भी शामिल है।'
      },
      apply: {
        en: 'Punishable by simple imprisonment up to 3 years and a fine.',
        hi: '3 वर्ष तक के साधारण कारावास और जुर्माने से दंडनीय।'
      },
      source: { en: 'Indian Penal Code, 1860', hi: 'भारतीय दंड संहिता, 1860' },
      updated: '2026'
    },
    {
      id: 'ipc_498a',
      name: { en: 'Section 498A IPC', hi: 'धारा 498A आईपीसी' },
      section: { en: 'Cruelty by Husband or Relatives', hi: 'पति या रिश्तेदारों द्वारा क्रूरता' },
      explanation: {
        en: 'Protects married women from cruelty, harassment, and domestic abuse by the husband or his family members.',
        hi: 'विवाहित महिलाओं को पति या उसके परिवार के सदस्यों द्वारा की जाने वाली क्रूरता, उत्पीड़न और घरेलू शोषण से बचाता है।'
      },
      apply: {
        en: 'Punishable by imprisonment up to 3 years and a fine.',
        hi: '3 वर्ष तक के कारावास और जुर्माने से दंडनीय।'
      },
      source: { en: 'Indian Penal Code, 1860', hi: 'भारतीय दंड संहिता, 1860' },
      updated: '2026'
    },
    {
      id: 'it_66e',
      name: { en: 'Section 66E IT Act', hi: 'धारा 66E आईटी अधिनियम' },
      section: { en: 'Violation of Privacy', hi: 'गोपनीयता का उल्लंघन' },
      explanation: {
        en: 'Punishes intentionally capturing, publishing, or transmitting images of a private area of any person without consent.',
        hi: 'सहमति के बिना किसी भी व्यक्ति के निजी अंगों की तस्वीरें खींचने, प्रकाशित करने या प्रसारित करने को दंडित करता है।'
      },
      apply: {
        en: 'Punishable by imprisonment up to 3 years and/or a fine up to Rs 2 Lakh.',
        hi: '3 वर्ष तक की जेल और/या 2 लाख रुपये तक के जुर्माने से दंडनीय।'
      },
      source: { en: 'Information Technology Act, 2000', hi: 'सूचना प्रौद्योगिकी अधिनियम, 2000' },
      updated: '2026'
    },
    {
      id: 'it_67',
      name: { en: 'Section 67 IT Act', hi: 'धारा 67 आईटी अधिनियम' },
      section: { en: 'Publishing Obscene Material', hi: 'अश्लील सामग्री प्रकाशित करना' },
      explanation: {
        en: 'Penalizes publishing or transmitting material that is lascivious or appeals to the prurient interest in electronic form.',
        hi: 'इलेक्ट्रॉनिक रूप में कामुक या अश्लील सामग्री प्रकाशित या प्रसारित करने को दंडित करता है।'
      },
      apply: {
        en: 'Up to 3 years imprisonment on first conviction; up to 5 years for repeat offenses.',
        hi: 'पहली सजा पर 3 साल तक की जेल; बार-बार अपराध करने पर 5 साल तक की सजा।'
      },
      source: { en: 'Information Technology Act, 2000', hi: 'सूचना प्रौद्योगिकी अधिनियम, 2000' },
      updated: '2026'
    },
    {
      id: 'posh_2013',
      name: { en: 'POSH Act, 2013', hi: 'पॉश अधिनियम, 2013' },
      section: { en: 'Prevention of Workplace Harassment', hi: 'कार्यस्थल उत्पीड़न की रोकथाम' },
      explanation: {
        en: 'Mandates every workplace with 10+ employees to constitute an Internal Complaints Committee (ICC) to address and resolve complaints of sexual harassment.',
        hi: 'यौन उत्पीड़न की शिकायतों को हल करने के लिए 10+ कर्मचारियों वाले प्रत्येक कार्यस्थल को एक आंतरिक शिकायत समिति (ICC) का गठन करने का आदेश देता है।'
      },
      apply: {
        en: 'Sets civil remedies, safety audits, and fine guidelines for employers.',
        hi: 'नियोक्ताओं के लिए नागरिक उपचार, सुरक्षा ऑडिट और जुर्माना दिशानिर्देश निर्धारित करता है।'
      },
      source: { en: 'Workplace Sexual Harassment Act, 2013', hi: 'कार्यस्थल यौन उत्पीड़न अधिनियम, 2013' },
      updated: '2026'
    },
    {
      id: 'bns_75',
      name: { en: 'Section 75 BNS', hi: 'धारा 75 बीएनएस' },
      section: { en: 'Sexual Harassment (BNS)', hi: 'यौन उत्पीड़न (BNS)' },
      explanation: {
        en: 'Equivalent to Section 354A of the old IPC under the new Bharatiya Nyaya Sanhita (BNS) criminal code of India.',
        hi: 'भारत के नए भारतीय न्याय संहिता (BNS) आपराधिक कानून के तहत पुराने IPC की धारा 354A के समकक्ष।'
      },
      apply: {
        en: 'BNS 2023 guidelines apply for all offenses committed after July 1, 2024.',
        hi: '1 जुलाई, 2024 के बाद किए गए सभी अपराधों के लिए बीएनएस 2023 दिशानिर्देश लागू होते हैं।'
      },
      source: { en: 'Bharatiya Nyaya Sanhita, 2023', hi: 'भारतीय न्याय संहिता, 2023' },
      updated: '2026'
    }
  ],
  cases: [
    {
      id: 'vishaka',
      name: { en: 'Vishaka & Others v. State of Rajasthan (1997)', hi: 'विशाखा और अन्य बनाम राजस्थान राज्य (1997)' },
      whatHappened: {
        en: 'Bhanwari Devi, a social worker, was gang-raped for protesting against child marriage. The trial court acquitted the accused. Vishaka, a women\'s rights group, filed a class-action petition in the Supreme Court pointing out the complete lack of workplace safety laws.',
        hi: 'बाल विवाह का विरोध करने पर एक सामाजिक कार्यकर्ता भंवरी देवी के साथ सामूहिक बलात्कार किया गया था। निचली अदालत ने आरोपियों को बरी कर दिया। महिला अधिकार समूह विशाखा ने सुप्रीम कोर्ट में एक जनहित याचिका दायर की जिसमें कार्यस्थल सुरक्षा कानूनों की कमी को दर्शाया गया था।'
      },
      decision: {
        en: 'The Supreme Court acknowledged the vacuum and laid down the historic \'Vishaka Guidelines\' defining sexual harassment, making it the legal duty of employers to prevent harassment, and mandating redressal panels.',
        hi: 'सुप्रीम कोर्ट ने इस कमी को स्वीकार किया और ऐतिहासिक \'विशाखा दिशानिर्देश\' जारी किए, जिसमें कार्यस्थल पर उत्पीड़न को परिभाषित किया गया और नियोक्ताओं का यह कानूनी कर्तव्य बनाया गया कि वे इसे रोकें।'
      },
      whyMatters: {
        en: 'This landmark judgment stood as the law of the land for 16 years until Parliament officially codified these guidelines into the POSH Act in 2013.',
        hi: 'यह ऐतिहासिक निर्णय 16 वर्षों तक देश के कानून के रूप में लागू रहा जब तक कि संसद ने 2013 में इन दिशानिर्देशों को औपचारिक रूप से पॉश (POSH) अधिनियम में शामिल नहीं कर लिया।'
      },
      source: { en: 'Supreme Court of India (AIR 1997 SC 3011)', hi: 'भारत का सर्वोच्च न्यायालय (AIR 1997 SC 3011)' }
    },
    {
      id: 'major_singh',
      name: { en: 'State of Punjab v. Major Singh (1967)', hi: 'पंजाब राज्य बनाम मेजर सिंह (1967)' },
      whatHappened: {
        en: 'The accused committed an indecent assault on a seven-and-a-half-month-old female infant. The defense argued that an infant of such tender age has no modesty that could be outraged under Section 354 IPC.',
        hi: 'आरोपी ने साढ़े सात महीने की बच्ची पर अभद्र हमला किया था। बचाव पक्ष ने तर्क दिया कि इतनी कम उम्र की बच्ची की कोई मर्यादा (modesty) नहीं होती जिसे धारा 354 आईपीसी के तहत भंग किया जा सके।'
      },
      decision: {
        en: 'The Supreme Court rejected the defense. It ruled that the modesty of a woman is an attribute of her sex from birth, and can be outraged regardless of her age, consciousness, or understanding.',
        hi: 'सुप्रीम कोर्ट ने बचाव पक्ष के तर्क को खारिज कर दिया। यह निर्णय दिया गया कि महिला की मर्यादा जन्म से ही उसके लिंग का एक गुण है, और उसकी उम्र या समझ की परवाह किए बिना उसकी मर्यादा को भंग किया जा सकता है।'
      },
      whyMatters: {
        en: 'This case set a vital precedent protecting minor children and infants, defining female modesty objectively from birth under Indian criminal law.',
        hi: 'इस मामले ने भारतीय आपराधिक कानून के तहत जन्म से ही महिला मर्यादा को निष्पक्ष रूप से परिभाषित करके नाबालिग बच्चों और शिशुओं की सुरक्षा करने वाला एक महत्वपूर्ण मिसाल कायम किया।'
      },
      source: { en: 'Supreme Court of India (AIR 1967 SC 63)', hi: 'भारत का सर्वोच्च न्यायालय (AIR 1967 SC 63)' }
    },
    {
      id: 'shreya_singhal',
      name: { en: 'Shreya Singhal v. Union of India (2015)', hi: 'श्रेया सिंघल बनाम भारत संघ (2015)' },
      whatHappened: {
        en: 'Two girls were arrested under Section 66A of the IT Act for posting comments on Facebook criticizing the shutdown of Mumbai following a politician\'s death. Shreya Singhal filed a writ petition challenging the constitutional validity of Section 66A.',
        hi: 'फेसबुक पर एक राजनेता की मौत के बाद मुंबई बंद की आलोचना करने वाले कमेंट पोस्ट करने के लिए दो लड़कियों को आईटी अधिनियम की धारा 66A के तहत गिरफ्तार किया गया था। श्रेया सिंघल ने धारा 66A की संवैधानिक वैधता को चुनौती देते हुए एक याचिका दायर की।'
      },
      decision: {
        en: 'The Supreme Court struck down Section 66A IT Act entirely, calling it vague and overbroad, violating the fundamental right to freedom of speech. However, it upheld online harassment boundaries under other sections.',
        hi: 'सुप्रीम कोर्ट ने आईटी अधिनियम की धारा 66A को पूरी तरह से रद्द कर दिया, इसे अस्पष्ट और अत्यधिक व्यापक बताते हुए भाषण की स्वतंत्रता के अधिकार का उल्लंघन माना। हालांकि, इसने अन्य धाराओं के तहत ऑनलाइन उत्पीड़न की सीमाओं को बरकरार रखा।'
      },
      whyMatters: {
        en: 'This safeguarded digital freedom of speech while directing that targeted online harassment, cyberstalking, and non-consensual image sharing must be prosecuted under Section 66E, 67, and IPC provisions.',
        hi: 'इसने भाषण की डिजिटल स्वतंत्रता की रक्षा की, साथ ही यह निर्देश दिया कि लक्षित ऑनलाइन उत्पीड़न, साइबरस्टॉकिंग और सहमति के बिना इमेज शेयर करने पर धारा 66E, 67 और आईपीसी के प्रावधानों के तहत मुकदमा चलाया जाना चाहिए।'
      },
      source: { en: 'Supreme Court of India (AIR 2015 SC 1523)', hi: 'भारत का सर्वोच्च न्यायालय (AIR 2015 SC 1523)' }
    }
  ]
};
