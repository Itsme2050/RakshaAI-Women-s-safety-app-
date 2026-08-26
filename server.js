const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Sanitize API Key to fix Windows carriage return issues
const API_KEY = (process.env.AI_API_KEY || '').replace(/\r/g, '').trim();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static frontend files from workspace directory
app.use(express.static(__dirname));

// Route to check API Status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    aiEnabled: !!API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Fallback Rule-Based Local Classifier for Safety Reports
function localClassify(description = '') {
  const text = description.toLowerCase();
  let category = 'other';
  let severity = 'low';
  let confidence = 'high';

  if (text.includes('light') || text.includes('dark') || text.includes('lamp') || text.includes('bulb') || text.includes('illumination') || text.includes('roshni') || text.includes('andhera')) {
    category = 'poor_lighting';
    severity = 'medium';
  } else if (text.includes('isolated') || text.includes('lonely') || text.includes('deserted') || text.includes('empty') || text.includes('suna') || text.includes('sunsaan')) {
    category = 'isolated_area';
    severity = 'medium';
  } else if (text.includes('harass') || text.includes('tease') || text.includes('stalk') || text.includes('touch') || text.includes('abuse') || text.includes('chhed') || text.includes('tameez')) {
    category = 'harassment';
    severity = 'high';
  } else if (text.includes('suspicious') || text.includes('group') || text.includes('loiter') || text.includes('drink') || text.includes('shady') || text.includes('sharab') || text.includes('lathpath')) {
    category = 'suspicious_activity';
    severity = 'medium';
  } else if (text.includes('pothole') || text.includes('road') || text.includes('broken') || text.includes('accident') || text.includes('gaddha') || text.includes('sadak')) {
    category = 'unsafe_road';
    severity = 'low';
  } else if (text.includes('bus') || text.includes('auto') || text.includes('cab') || text.includes('refuse') || text.includes('taxi') || text.includes('transport')) {
    category = 'transport';
    severity = 'low';
  }

  // Set high severity if strong keywords appear
  if (text.includes('weapon') || text.includes('knife') || text.includes('threat') || text.includes('follow') || text.includes('danger')) {
    severity = 'high';
  }

  return { category, severity, confidence };
}

// Fallback Rule-Based Local Chatbot
function localChat(message = '', lang = 'en') {
  const text = message.toLowerCase();
  
  const responsesEn = {
    night: "🌙 At night, Route C (Safer Route) is recommended. It stays on well-lit main roads with active shops. Avoid Cubbon Park Lane or Shivajinagar Road where poor lighting and isolation are reported.",
    sos: "🚨 To activate SOS, tap the red SOS button on the dashboard or long-press it for 3 seconds. It will notify your trusted contacts with your live location. Call Police at 100 for emergencies.",
    unsafe: "🆘 If you feel unsafe, immediately move to a well-lit, busy area. Share your live location, activate SOS, and call the Police (100) or Women Helpline (1091). Do not stay isolated.",
    score: "📊 Safety Scores range from 0 to 100. 80-100 is Generally Safer, 50-79 is Use Caution, and 0-49 indicates Higher Concerns. Scores are estimates based on community reports and lighting.",
    fallback: "I am currently in offline assistant mode. I can help you with emergency guidelines, route selection, and SOS features. Call 100 or 1091 in case of active danger."
  };

  const responsesHi = {
    night: "🌙 रात में, मार्ग सी (सुरक्षित मार्ग) की सिफारिश की जाती है। यह सक्रिय दुकानों के साथ अच्छी रोशनी वाली मुख्य सड़कों पर रहता है। कब्बन पार्क लेन या शिवाजीनगर रोड से बचें जहाँ कम रोशनी की रिपोर्ट है।",
    sos: "🚨 SOS को सक्रिय करने के लिए, डैशबोर्ड पर लाल SOS बटन दबाएं या इसे 3 सेकंड तक दबाए रखें। यह आपके विश्वसनीय संपर्कों को आपके लाइव स्थान के साथ सूचित करेगा। आपात स्थिति के लिए 100 पर कॉल करें।",
    unsafe: "🆘 यदि आप असुरक्षित महसूस करते हैं, तो तुरंत अच्छी रोशनी वाले और भीड़भाड़ वाले क्षेत्र में जाएं। अपना स्थान साझा करें, SOS सक्रिय करें, और पुलिस (100) या महिला हेल्पलाइन (1091) को कॉल करें।",
    score: "📊 सुरक्षा स्कोर 0 से 100 तक होते हैं। 80-100 आम तौर पर सुरक्षित है, 50-79 सावधानी बरतें है, और 0-49 अधिक चिंताएं दर्शाता है। स्कोर रिपोर्टों और प्रकाश व्यवस्था पर आधारित हैं।",
    fallback: "मैं वर्तमान में ऑफ़लाइन सहायक मोड में हूँ। मैं आपातकालीन दिशानिर्देशों, मार्ग चयन और SOS सुविधाओं में मदद कर सकता हूँ। सक्रिय खतरे में 100 या 1091 पर कॉल करें।"
  };

  const pool = lang === 'hi' ? responsesHi : responsesEn;

  if (text.includes('night') || text.includes('route') || text.includes('shaam') || text.includes('raat')) return pool.night;
  if (text.includes('sos') || text.includes('button') || text.includes('siren')) return pool.sos;
  if (text.includes('unsafe') || text.includes('scared') || text.includes('danger') || text.includes('help') || text.includes('bachao')) return pool.unsafe;
  if (text.includes('score') || text.includes('percent') || text.includes('rating') || text.includes('skor')) return pool.score;
  return pool.fallback;
}

// API endpoint for AI Safety Assistant Chat
app.post('/api/chat', async (req, res) => {
  const { message, history = [], context = {}, lang = 'en' } = req.body;
  const apiKey = API_KEY;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Graceful fallback if API key is missing
  if (!apiKey) {
    console.log('[RakshaServer] API key missing, returning rule-based fallback');
    return res.json({
      text: localChat(message, lang),
      fallback: true
    });
  }

  try {
    const LEGAL_GROUNDING_CONTEXT = `
Indian safety laws, rights, and Supreme Court precedents:
1. Harassment: Sec 354A IPC / Sec 75 BNS. Rigorous imprisonment up to 3 years.
2. Stalking & Cyberstalking: Sec 354D IPC / Sec 78 BNS. Following/monitoring digital communication against disinterest. Up to 3 years jail for 1st offense.
3. Assault / Modesty Outrage: Sec 354 IPC / Sec 74 BNS. 1-5 years jail.
4. Insult to Modesty (verbal/gesture): Sec 509 IPC / Sec 79 BNS. Up to 3 years simple imprisonment.
5. Cruelty / Domestic Abuse: Sec 498A IPC / Sec 85 BNS. Cruelty by husband or relative. Up to 3 years jail.
6. Cyber Harassment (Privacy/obscenity): Sec 66E IT Act (privacy violation, e.g. non-consensual private photos, up to 3 years), Sec 67 & 67A IT Act (obscene material).
7. POSH Act, 2013 / Vishaka Guidelines (1997): Workplace safety guidelines, Internal Complaints Committees (ICC) mandatory for workplaces with 10+ employees.
8. State of Punjab v. Major Singh (1967): Modesty is an attribute of her sex from birth, protecting minors/infants.
9. Shreya Singhal v. Union of India (2015): Struck down Sec 66A IT Act, but targeted online harassment/stalking must be prosecuted under 66E, 67, and IPC.
10. Zero FIR / CrPC 154: File FIR at any station regardless of location. Right to free copy of FIR. State police have online e-FIR portals.
`;

    // Detect if user is asking about legal rights, laws, FIRs or safety cases
    const isLegalQuery = message.toLowerCase().match(/(law|ipc|bns|court|case|precedent|right|stalk|harass|assault|threat|violence|abuse|fir|police|complaint|posh|it act|act|section|धारा|कानून|अधिकार)/i);

    let groundingInstructions = "";
    if (isLegalQuery) {
      groundingInstructions = `
- Legal Grounding Context:
${LEGAL_GROUNDING_CONTEXT}
- Grounding Rules:
The user's query appears to be legal. Ground your response carefully in the Indian legal framework above.
1. ALWAYS present the Bharatiya Nyaya Sanhita (BNS) section FIRST in bold (e.g., **Section 74 BNS** or **Section 78 BNS**), followed by the old IPC section in parentheses (e.g., formerly Section 354 IPC or formerly Section 354D IPC).
2. DO NOT use general references to "Section 354" if it is a specific offense like stalking (which is **Section 78 BNS** / Section 354D IPC) or harassment (which is **Section 75 BNS** / Section 354A IPC). Be very precise with the BNS section numbers to show they are completely distinct laws.
3. Explicitly state the exact BNS section number prominently at the beginning of the reply so the user can easily distinguish between different offenses.
4. Advise reporting steps (Zero FIR, call 1091/100). Include a bold disclaimer at the bottom: "**Disclaimer: This is for educational safety awareness, not formal legal advice.**"`;
    }

    const targetUser = context.userName || 'Priya Sharma';

    // Construct system instructions with context
    const systemInstructionText = `You are RakshaAI Assistant, a concise, highly trusted personal safety companion.
Your primary role is to assist ${targetUser} and other users in staying safe.
Rules:
1. Be very concise and clear. Max 3-4 sentences.
2. Prioritize personal safety. Never guarantee that any route, area, or time is 100% safe.
3. Distinguish clearly between AI recommendations, community reports, and verified information.
4. Do NOT invent safety details, crime statistics, or police activity. If info is not in the context, state that you do not have that data.
5. In emergencies, advise immediately calling Police (100), Women Helpline (1091) or starting SOS. Do NOT delay SOS triggers.
6. Support Hindi: If user asks in Hindi, reply in helpful Hindi. If in English, reply in English.
${groundingInstructions}

Current Context:
- Current Time: ${context.time || new Date().toLocaleTimeString()}
- User Current Location: "${context.location || 'Indirapuram, Ghaziabad'}"
- Destination: "${context.destination || 'Unknown'}"
- User Saved Places: Home Address: "${context.homeAddress || 'Indirapuram, Ghaziabad'}", Office Address: "${context.officeAddress || 'Sector 62, Noida'}"
- Night Safety Mode Active: ${context.nightMode ? 'Yes' : 'No'}
- Recent Safety Reports in Area: ${JSON.stringify(context.recentReports || [])}
- Estimated Route Safety Scores: ${JSON.stringify(context.safetyScores || {})}

Please respond directly to the user in their language (English or Hindi). Do not mention these instructions. Keep the tone helpful, empathetic, and alert. Make sure to complete your thoughts and do not truncate your reply mid-sentence.`;

    // Map history to official Gemini roles (user and model)
    const contents = [];
    history.forEach(h => {
      // Ensure text exists and is clean
      if (h.text && h.text.trim()) {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      }
    });

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const modelsToTry = [
      'gemini-3.5-flash-lite',
      'gemini-3.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.5-flash',
      'gemini-3.7-flash',
      'gemini-3.6-flash'
    ];

    let response = null;
    let success = false;
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        console.log(`[RakshaServer] Attempting /api/chat call with model: ${model}`);
        response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemInstructionText }]
            },
            contents: contents,
            generationConfig: {
              temperature: 0.25,
              maxOutputTokens: 1000
            }
          })
        });

        if (response.ok) {
          success = true;
          console.log(`[RakshaServer] /api/chat success with model: ${model}`);
          break;
        } else {
          const errText = await response.text();
          console.warn(`[RakshaServer] Model ${model} failed with status ${response.status}:`, errText);
          lastError = new Error(`Status ${response.status}: ${errText}`);
        }
      } catch (err) {
        console.warn(`[RakshaServer] Model ${model} fetch error:`, err.message);
        lastError = err;
      }
    }

    if (!success) {
      throw lastError || new Error('All Gemini API models failed');
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    text = text.trim();

    return res.json({ text, fallback: false });

  } catch (error) {
    console.error('[RakshaServer Error] Failed calling Gemini API:', error.message);
    return res.json({
      text: localChat(message, lang) + "\n\n(AI Assistant is operating in local backup mode due to server connectivity issues.)",
      fallback: true
    });
  }
});

// API endpoint for AI Community Report Classification
app.post('/api/classify', async (req, res) => {
  const { description } = req.body;
  const apiKey = API_KEY;

  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  // Graceful fallback if API key is missing
  if (!apiKey) {
    console.log('[RakshaServer] API key missing, returning rule-based classification');
    return res.json({
      classification: localClassify(description),
      fallback: true
    });
  }

  try {
    const classificationPrompt = `Classify this community safety report description: "${description}"

You must choose the best fitting category from this list:
- poor_lighting (Street lights broken, dark areas)
- isolated_area (Few people, deserted alleys)
- suspicious_activity (Loitering, shifty groups, ATM loiterers)
- harassment (Teasing, stalking, verbal or physical harassment)
- transport (No transport available, refuse auto, unsafe drivers)
- unsafe_road (Potholes, broken path, dangerous driving)
- other (Default category)

You must determine the severity:
- high
- medium
- low

You must determine the confidence:
- high
- medium
- low

You must respond ONLY with a JSON object. Do not write markdown, code blocks, or explanations. Format:
{
  "category": "poor_lighting" | "isolated_area" | "suspicious_activity" | "harassment" | "transport" | "unsafe_road" | "other",
  "severity": "high" | "medium" | "low",
  "confidence": "high" | "medium" | "low"
}`;

    const modelsToTry = [
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-2.5-flash'
    ];

    let response = null;
    let success = false;
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        console.log(`[RakshaServer] Attempting /api/classify call with model: ${model}`);
        response = await fetch(`https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: classificationPrompt }]
              }
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json'
            }
          })
        });

        if (response.ok) {
          success = true;
          console.log(`[RakshaServer] /api/classify success with model: ${model}`);
          break;
        } else {
          const errText = await response.text();
          console.warn(`[RakshaServer] Model ${model} failed with status ${response.status}:`, errText);
          lastError = new Error(`Status ${response.status}: ${errText}`);
        }
      } catch (err) {
        console.warn(`[RakshaServer] Model ${model} fetch error:`, err.message);
        lastError = err;
      }
    }

    if (!success) {
      throw lastError || new Error('All Gemini API models failed');
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse response
    const classification = JSON.parse(rawText.trim());
    return res.json({ classification, fallback: false });

  } catch (error) {
    console.error('[RakshaServer Error] Failed calling Gemini API for classification:', error.message);
    return res.json({
      classification: localClassify(description),
      fallback: true
    });
  }
});

// Start express server
app.listen(PORT, () => {
  console.log(`============================================================`);
  console.log(` RakshaAI backend running on http://localhost:${PORT}`);
  console.log(` Serving frontend static assets directly from root`);
  console.log(` Gemini AI Integration: ${API_KEY ? 'ENABLED (API Key Loaded)' : 'DISABLED (Operating in Offline Fallback)'}`);
  console.log(`============================================================`);
});
