# 🔎 ReFound

**Lost it. Someone found it. Let's connect the dots.**

ReFound is a smart campus Lost & Found platform that helps students report, discover, and recover lost belongings. It uses Gemini to identify potential matches between lost and found reports, making it easier to connect the right people while keeping the claiming process secure.

---

## 01. Problem

Losing something on campus is common, but recovering it is surprisingly difficult.

When students lose an item, they usually rely on WhatsApp groups, class groups, friends, or informal announcements. Someone who finds the same item may post about it somewhere completely different.

This creates a simple but important gap:

> **The information exists, but the right people don't necessarily find each other.**

Students experience this problem particularly with items such as ID cards, wallets, earphones, chargers, books, bottles, and other everyday belongings.

I chose this problem because it is small, relatable, and recurring, yet existing solutions often focus only on reporting an item rather than actually helping match lost and found reports.

---

## 02. Why I Built This

The initial assumption was that students simply needed a centralized place to post lost and found items.

But looking deeper, the bigger problem is **matching**.

Two students might describe the same item differently:

* "Black AirPods case lost near the library"
* "Small black charging case found beside the library stairs"

A keyword-based search may not recognize these as related.

This led me to focus ReFound on connecting potentially related reports rather than simply creating another listing platform.

---

## 03. Solution

ReFound provides one centralized platform for campus lost and found reports.

A student can:

1. Report an item as lost or found.
2. Add its description, category, location, date, time, and photo.
3. Browse and search existing reports.
4. Receive potential matches for their report.
5. Review the suggested match.
6. Initiate a claim and provide identifying information.
7. Complete the recovery process securely.

Gemini analyzes the available information and identifies potentially related lost and found reports.

The AI does **not** automatically decide that two items belong to the same person. It acts as a recommendation layer, while the users remain responsible for verifying the match.

---

## 04. Key Decisions

### AI-assisted matching instead of exact keyword matching

A simple keyword search would require users to describe an item using the same words.

Gemini allows the system to understand the meaning and context of descriptions, making it possible to identify potentially related reports even when the wording is different.

### Human verification instead of automatic claims

An AI-generated match can be wrong.

Therefore, ReFound treats AI results as **potential matches**, not confirmed matches. Users must verify the item before it can be returned.

### Private identifying information

Showing every detail of a found item publicly could allow someone to make a false claim.

ReFound therefore keeps certain identifying details private and uses them during the claim verification process.

### Focused MVP

Instead of building messaging, delivery, payment, social features, or a complex administrative system, the MVP focuses on the core problem:

> **Report → Match → Verify → Recover**

This keeps the application useful while making the scope achievable within the available development time.

---

## 05. Features

### 🔐 Authentication

* Create an account
* Sign in and sign out
* User-specific reports and information

### 📌 Lost & Found Reports

* Report lost items
* Report found items
* Upload item photos
* Add category, description, location, date, and time
* Edit or delete your own reports

### 🔎 Search & Discovery

* Browse active reports
* Search by item information
* Filter by Lost/Found, category, location, and date

### 🤖 Smart Matching

* Gemini-powered potential match detection
* Matches based on descriptions, characteristics, location, and time
* Match confidence/similarity information
* Explanation of why a match was suggested

### 🛡️ Claim Verification

* Initiate a claim
* Provide private identifying information
* Review potential claims
* Accept or reject claims
* Mark an item as returned

### 📊 Personal Dashboard

* View your reports
* Track potential matches
* View claims
* Track item status

### 🔔 Notifications

* Receive notifications about potential matches
* Track important updates related to your reports

---

## 06. Technology

| Technology                    | Purpose                                                  |
| ----------------------------- | -------------------------------------------------------- |
| **Firebase Authentication**   | Secure user authentication                               |
| **Cloud Firestore**           | Store users, reports, matches, claims, and notifications |
| **Firebase Cloud Storage**    | Store uploaded item images                               |
| **Gemini API**                | Analyze reports and identify potential matches           |
| **Google Cloud Run**          | Secure server-side backend for Gemini/API operations     |
| ** Firebase Webapp / Vercel** | Host the web application                                 |

### Why these technologies?

Firebase was chosen because ReFound requires authentication, a real-time database, and image storage, all of which can be integrated without building these systems from scratch.

Gemini was chosen specifically for the matching problem because item descriptions can be vague, incomplete, or written using different words.

Cloud Run provides a server-side layer so the Gemini API key does not need to be exposed in client-side code.

---

## 07. Architecture

```text
                       ┌─────────────────────┐
                       │      ReFound        │
                       │    Web Application   │
                       └──────────┬──────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
             ┌──────▼──────┐             ┌──────▼──────┐
             │   Firebase  │             │   Firebase  │
             │    Auth     │             │   Storage   │
             └─────────────┘             └─────────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  │
                           ┌──────▼──────┐
                           │  Firestore  │
                           │   Database  │
                           └──────┬──────┘
                                  │
                           Match Request
                                  │
                           ┌──────▼──────┐
                           │  Cloud Run  │
                           │   Backend   │
                           └──────┬──────┘
                                  │
                           ┌──────▼──────┐
                           │    Gemini   │
                           │  Matching   │
                           └─────────────┘
```

### Core flow

```text
Student reports item
        ↓
Report stored in Firestore
        ↓
Gemini analyzes relevant reports
        ↓
Potential matches generated
        ↓
Student reviews match
        ↓
Claim verification
        ↓
Item returned
```

---

## 08. Getting Started

### Prerequisites

* Node.js
* npm
* Firebase project
* Gemini API access
* Google Cloud project

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd refound
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a local `.env` file and add the required Firebase configuration.

```env
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id

GEMINI_API_KEY=your-gemini-api-key
```

**Important:** Never commit `.env` files or expose `GEMINI_API_KEY` in frontend code.

### 4. Configure Firebase

Enable:

* Firebase Authentication
* Cloud Firestore
* Firebase Storage

Configure the required Firebase Security Rules.

### 5. Start the development server

```bash
npm run dev
```

The application will then be available through the local development URL shown in the terminal.

---

## 09. Deployment

The application is deployed as a production web application using Google Cloud/Firebase infrastructure.

### Deployment components

* Frontend: `<DEPLOYMENT_PLATFORM>`
* Backend: Google Cloud Run
* Database: Cloud Firestore
* Authentication: Firebase Authentication
* File storage: Firebase Cloud Storage
* AI: Gemini API

### Live Application

**[https://re-found-lost-and-found.vercel.app/]**

### GitHub Repository

**[https://github.com/kamalneetkaur666/ReFound-Lost-and-Found]**

---

## 10. Limitations & Next Steps

ReFound is currently an MVP and does not attempt to solve every part of the physical recovery process.

### Current limitations

* Matching quality depends on the information provided by users.
* AI-generated matches can sometimes be incorrect.
* The current verification process still relies on users honestly providing identifying information.
* There is no physical delivery or handover system.
* The application is initially designed around a campus-scale environment.
* There is no dedicated administrative dashboard for college authorities yet.

### With more time, I would add:

**Campus-wide administration**

Allow authorized college staff to manage reports, resolve disputes, and handle unclaimed items.

**Better matching**

Combine Gemini's semantic understanding with structured similarity signals such as location, time, category, and image characteristics.

**Location intelligence**

Use Google Maps Platform to make reporting and discovering locations easier.

**Recovery analytics**

Analyze anonymized reports to identify areas where items are frequently lost or found.

**Multi-campus support**

Allow multiple colleges or campuses to use ReFound while keeping their data isolated.

---

## What I Learned

The biggest lesson from building ReFound was that solving a problem is not always about adding more features.

The initial idea was simply to create a centralized Lost & Found platform. But after breaking down the problem, the more important challenge became **connecting two incomplete pieces of information**: someone saying "I lost this" and someone else saying "I found this."

That led to a smaller, more focused MVP where every major feature serves the same goal:

> **Make it easier for lost belongings to find their way back to their owners.**
