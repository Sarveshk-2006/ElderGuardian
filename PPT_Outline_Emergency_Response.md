# PPT Outline: A1–C3 Emergency Response Matrix
## (Same structure as Aissms / KRISHIMITRA presentation)

Use this outline to build your slides. Each section matches the flow of the Aissms PDF.

---

## **Slide 1: Title**
- **Project name:** A1–C3 Emergency Response Matrix  
  *(or: Smart Emergency Response System)*
- **Tagline:** *Intelligent emergency response that works with or without network*
- **Team name:** [Your team name]
- **Team members:** [Names]

---

## **Slide 2: Problem**
- **Context:** Road accidents and breakdowns need fast, reliable help—but response often fails when it’s needed most.
- **Pain points:**
  - **Network-dependent help:** Many systems assume good connectivity; in poor or no-network areas, alerts never reach help.
  - **Wrong priority:** Critical injuries and minor incidents get the same treatment, wasting resources and delaying life-saving response.
  - **No fallback in dead zones:** In remote or cut-off areas, victims have no way to signal passing vehicles or emergency services.
  - **Fragmented response:** Hospital (108), police (100), and towing are not coordinated by situation type and network condition.

*Optional: Add a short stat (e.g. road accident / response-time statistic from India) and source, similar to the 54.6% / 19.9% in Aissms.*

---

## **Slide 3: What is our Solution?**
- **A1–C3 matrix:** One clear framework that picks the right response by **priority (Tier)** and **network (Class)**.
- **Tier-based priority:**
  - **Tier 1 – Critical:** Severe injury → instant hospital (108) & police (100), with SMS + live GPS (or fallbacks when network is bad).
  - **Tier 2 – Urgent:** Breakdown → towing + optional hospital; still works via SMS and audio beacon in poor network.
  - **Tier 3 – Routine:** Minor accident → optional police, or system log; no panic, efficient use of resources.
- **Class-based behavior:**
  - **Class A (Active / within city):** Full connectivity → auto-dial, app, instant SMS, live GPS.
  - **Class B (Bad network):** SMS + medical details + location, audio beacon for nearby help.
  - **Class C (Cut-off / dead zone):** V2V (Vehicle-to-Vehicle) relay and system log so the event is still recorded and can be relayed when connectivity returns.
- **Result:** Right help, at the right time, whether the user has full signal, poor network, or no network.

---

## **Slide 4: Architecture and Technologies**
- **Visual:** Use the full **A1–C3 matrix grid** from Techathon (1).pdf as the main diagram.
  - Rows: Tier 1 (Critical), Tier 2 (Urgent), Tier 3 (Routine).
  - Columns: Class A (Active), Class B (Bad), Class C (Cut-off).
  - In each cell: short text for that combination (e.g. A1: Hospital & Police, auto-dial 108 & 100, SMS + GPS; C1: V2V relay; etc.).
- **Technologies / components to mention:**
  - **Connectivity detection:** Class A / B / C (e.g. signal strength, fallback logic).
  - **Priority detection:** Tier 1 / 2 / 3 (sensors, user input, or both).
  - **Communication:** Auto-dial (108/100), SMS with medical details & location, in-app notifications.
  - **Offline / poor network:** Audio beacon, V2V wireless relay, local logging with sync when back online.
- **Legend (as in PDF):**  
  [X#] = Priority code | Hospital (108) | Police (100) | Towing | System log | V2V relay.

---

## **Slide 5: Solving the right problem – Impact**
- **Lives saved:** Critical cases get hospital and police immediately where network allows; in bad/no network, SMS and V2V still get the message out.
- **No one left behind:** Same logic works in cities (Class A), poor network (Class B), and dead zones (Class C).
- **Efficient use of resources:** Routine cases don’t overload 108/100; urgent breakdowns get towing + optional medical; system log keeps a record for insurance and analysis.
- **Scalable and clear:** One matrix for drivers, OEMs, and emergency services; easy to train and deploy.
- **Future-ready:** V2V and logged data support better traffic safety analytics and policy.

*Optional closing line (like Aissms):*  
*“Right response, right priority, even when the network fails.”*

---

## **Slide 6: Thank You**
- **Thank you**
- Optional: Project name + tagline again, contact or QR if needed.

---

## Quick reference: A1–C3 matrix (from Techathon PDF)

|        | **Class A (Active)**     | **Class B (Bad network)**      | **Class C (Cut-off)**        |
|--------|--------------------------|---------------------------------|------------------------------|
| **Tier 1 (Critical)** | A1: Hospital & Police, auto-dial 108 & 100, SMS + live GPS | B1: SMS + medical details + location, audio beacon | C1: V2V relay for critical emergency |
| **Tier 2 (Urgent)**   | A2: Towing + Hospital, app + optional 108 | B2: SMS (car no, name, location), audio beacon | C2: V2V relay for breakdown to passing cars |
| **Tier 3 (Routine)**  | A3: Optional police, app prompt, SMS if no response | B3: Queued SMS when connectivity returns | C3: System log via sensors; manual relay if needed |

Use this table as the core of your **Architecture** slide.
