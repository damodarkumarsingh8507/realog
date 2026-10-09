# SmartEnergy AI — Intelligent Campus Energy Monitoring, Prediction & Wastage Detection

> **BPUT Hackathon 2026 | Problem Statement PS04: Smart Resource Management — Electricity**
> Team: **Code Craft**
> Tagline: *"Detect Waste. Predict Demand. Build a Greener Campus."*

---

## 1. Executive Summary

**SmartEnergy AI** is a full-stack campus energy analytics and intelligence platform designed for colleges and universities. Without requiring physical smart meters initially, the system uses a high-fidelity synthetic energy simulation engine, machine learning pipelines (**RandomForestRegressor** for demand forecasting and **IsolationForest** for multidimensional anomaly detection), and an actionable recommendation center.

### Core Problems Solved:
1. **Which building consumes the most power?** Building energy intensity (kWh/m²) ranking and real-time load distribution.
2. **When does abnormal consumption occur?** Automated flagging of night-time baseline surges and off-hours HVAC runtimes.
3. **Why is energy being wasted?** Contextual explainability comparing power load with occupancy count and building schedules.
4. **How much excess power is consumed?** Dynamic baseline deviation: `Excess kWh = Actual kWh - Expected Baseline`.
5. **How much money can be saved?** Direct financial mapping at configurable tariff (default `₹8.0/kWh`).
6. **What is tomorrow's expected demand?** 24-hour demand forecast using chronological RandomForest with rolling lag features.
7. **How do corrective actions impact emissions and cost?** Simulated post-action mitigation modeling.

---

## 2. Technology Stack

* **Frontend**: HTML5, CSS3, Modern JavaScript / React 19, Tailwind CSS, Lucide Icons, Chart.js.
* **Backend**: Python 3 (Flask RESTful API) & Node.js/Express (Dual runtime container support).
* **Database**: SQLite with relational schema (`buildings`, `energy_readings`, `predictions`, `anomaly_alerts`, `recommendations`, `system_settings`, `action_logs`).
* **Machine Learning**: 
  * Demand Forecasting: `RandomForestRegressor` (features: building code, hour, day of week, temperature, occupancy, AC %, lighting %, 1h lag, 24h lag, 7d rolling average).
  * Anomaly Detection: `IsolationForest` (contamination=0.08, multidimensional feature space).
* **Sustainability Engine**: Indian Grid Emission Factor (`0.82 kg CO2 / kWh`, CEA Baseline) with configurable tariff.

---

## 3. Installation & Local Execution (Python / Flask)

### Prerequisites:
* Python 3.9+ installed
* pip package manager
* SQLite3

### Step-by-Step Setup:

```bash
# 1. Clone repository and navigate to python directory
cd smartenergy-ai

# 2. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Initialize SQLite database & seed 180 days of campus readings
python database/init_db.py

# 5. Run tests
pytest tests/

# 6. Start Flask server
python app.py
```
Open your browser at `http://localhost:5000`.

---

## 4. REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard/summary` | Live campus KPIs, 14-day baseline trend, building rankings |
| `GET` | `/api/buildings` | List of 5 campus buildings with active alerts count |
| `GET` | `/api/buildings/:id/analytics` | 24-hour hourly profile, expected vs actual load, occupancy |
| `GET` | `/api/energy/readings` | Filterable and paginated historical energy records |
| `POST` | `/api/data/generate` | Synthesize 180 days of realistic campus readings |
| `POST` | `/api/data/import` | Validate and import external CSV readings |
| `GET` | `/api/data/export` | Export filtered energy readings as CSV |
| `POST` | `/api/model/train` | Train RandomForestRegressor with chronological split |
| `POST` | `/api/predictions/generate` | Forecast tomorrow's 24h demand for all buildings |
| `GET` | `/api/predictions` | Retrieve latest demand forecast with MAE/RMSE |
| `POST` | `/api/anomalies/analyze` | Execute IsolationForest anomaly scoring pipeline |
| `GET` | `/api/alerts` | Query active & historical alerts by status/severity |
| `PATCH` | `/api/alerts/:id` | Acknowledge/resolve alert with notes |
| `GET` | `/api/recommendations` | Prioritized energy-saving actions with estimated ROI |
| `PATCH` | `/api/recommendations/:id` | Update status (Open -> Planned -> In Progress -> Completed) |
| `GET` | `/api/settings` | Retrieve configurable tariffs, emission factors & hours |
| `PATCH` | `/api/settings` | Update electricity tariff and anomaly thresholds |
| `GET` | `/api/health` | System health, database row counts, active ML metadata |
| `POST` | `/api/actions/run-workflow` | Run full 12-step automated hackathon pipeline |

---

## 5. End-to-End Hackathon Demonstration Workflow

1. **Step 1**: Load/generate 180 days of simulated campus electricity records.
2. **Step 2**: Store and verify relational records in SQLite.
3. **Step 3**: Train `RandomForestRegressor` with 80/20 chronological split to avoid data leakage.
4. **Step 4**: Compute tomorrow's hourly demand forecasts and identify peak demand window.
5. **Step 5**: Run `IsolationForest` to assign anomaly scores.
6. **Step 6**: Compare abnormal readings with expected baselines and building occupancy.
7. **Step 7**: Calculate excess kWh and financial impact at ₹8/kWh.
8. **Step 8**: Synthesize actionable recommendations with CO2 reduction projections.
9. **Step 9**: Display color-coded alerts: **GREEN** (normal), **YELLOW** (wastage warning), **RED** (critical spike).
10. **Step 10**: Facility manager triages, acknowledges, and resolves alerts with resolution notes.
11. **Step 11**: Maintain auditable activity timeline in `action_logs`.
12. **Step 12**: Run simulated post-action scenario visualizer showing verified ROI.

---

## 6. Future Hardware / IoT Integration

To connect real hardware:
* Flash ESP32 or Raspberry Pi edge devices with CT (Current Transformer) clamp sensors (e.g., SCT-013).
* Transmit readings over MQTT or HTTPS payload matching the `/api/data/import` schema.
* Set `data_source = 'IoT'` and enable automated ingestion webhooks.
