# RakshaAI 2.0 🛡️ — AI Personal Safety, Community Intelligence & Legal Awareness

RakshaAI 2.0 is a polished, production-quality, hackathon-ready personal safety companion. It combines AI-powered assistance, safety-score-based route planning, emergency SOS protocols, and a comprehensive Indian legal rights awareness explainer in a unified, mobile-first dashboard.

---

## 🚀 Key Features

*   **🤖 AI Safety Assistant**: Dynamic chatbot grounded in active safety logs and location telemetry to provide real-time recommendations.
*   **🗺️ Plan Safe Journeys**: Computes real-world distances (using the **Haversine formula**) and durations across multiple modes of transit (Driving, Walking, Transit, Biking) while mapping safety route alternatives.
*   **⚖️ AI Legal Explainer**: Explains legal rights, reporting options, and precedents grounded in the modern **Bharatiya Nyaya Sanhita (BNS)** and Information Technology (IT) Act.
*   **🚨 Consolidated SOS Trigger**: An emergency trigger that logs coordinates and transmits user medical data (Blood Group, Name) in simulated dispatches.
*   **🏠 Customized Saved Places**: Fast route shortcuts with localized OSM geocoding suggestions.

---

## 🛠️ Tech Stack

*   **Frontend**: React (via CDN), Leaflet.js Map Engine, HTML5/CSS3.
*   **Backend**: Node.js, Express.js.
*   **AI Integration**: Google Gemini AI API (`gemini-3.5-flash-lite`).

---

## 📦 How to Run Locally

Follow these steps to set up and launch the application on your local machine:

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### 2. Clone the Repository
```bash
git clone https://github.com/Itsme2050/RakshaAI-Women-s-safety-app-.git
cd RakshaAI-Women-s-safety-app-
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
1. Rename `.env.example` in the root folder to `.env`.
2. Open the `.env` file and insert your Gemini API Key:
   ```env
   PORT=3000
   GEMINI_API_KEY="your_gemini_api_key_here"
   ```

### 5. Launch the Application
```bash
npm start
```
Once started, open your web browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📄 Standalone Mode (No Installation)
Alternatively, you can open the compiled, single-file bundle **`preview.html`** directly in any web browser without running a Node server to explore the offline user interface.
