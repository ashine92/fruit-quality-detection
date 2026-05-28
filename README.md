# Fruit Quality Detection using Computer Vision and Edge AI

## Overview

This project aims to develop a **real-time fruit quality classification system** for factory environments. Leveraging Computer Vision and Edge AI technologies, the system enables accurate, automated, and efficient fruit inspection processes to replace traditional manual quality control methods.

## Key Features

- Real-time classification of fruits on a conveyor belt.
- Integration with industrial hardware, including cameras and actuators.
- AI-powered anomaly/defect detection using deep learning.
- Visual dashboard for live monitoring and reporting.
- Edge AI implementation (using Qualcomm AI BOX or similar controllers) to minimize latency and reliance on cloud services.
- Modular and organized project structure for easy extension and deployment.

## Technologies Used

- **JavaScript** (Frontend: ReactJS / Backend: Node.js/Express)
- **Python** (AI/Computer Vision, data processing)
- **HTML/CSS**
- **Dockerfile**
- **SQLite** (for web app data storage)

## Directory Structure

- `firmware/` — Embedded code, hardware drivers, and firmware for Qualcomm or MCU-based devices.
- `ai/` — AI and Computer Vision resources (data collection, preprocessing, model training and export to ONNX/TFLite, inference scripts, etc.).
- `hardware/` — Mechanical design (CAD files), circuit schematics, hardware assembly guides, and wiring diagrams.
- `web-app/` — Full-stack web application:
  - `frontend/`: User interface (React) for video streaming and dashboard display.
  - `backend/`: API server (Node.js/Express) for result storage, coordination, etc.
  - `cloud/`: Optional cloud integration (database, endpoints, storage, etc.).

> **Note:** Each main directory should provide its own README with quickstart instructions, required dependencies, and deployment tips.

## System Design

### Block Diagram Workflow

1. Fruits move along a conveyor belt.
2. Sensors detect the presence of fruit.
3. Camera captures images for inspection.
4. Edge device (e.g., Qualcomm AI BOX) performs image analysis and AI inference.
5. Device sends control signals to actuators (servos) for sorting defective items.
6. Operations and statistics are displayed on the live dashboard.

### Hardware Components

- **Central Processing Unit:** Qualcomm AI BOX or equivalent (supports AI inference and I/O control)
- **Camera Module:** Sufficient FPS and resolution for real-time detection
- **Servo Motor:** For physical product sorting
- **Drivers:** For motor/servo control, attached to actuators
- **Power Supply:** Separate, interference-isolated supply for controller and motors
- **Circuit Design:** Schematic and assembly guides provided in `/hardware`

### Software Architecture

- **On Edge AI Device:**
  - AI Module: Captures images, pre-processes, executes trained model, classifies results.
  - Control Module: Manages logic, reads sensors, outputs control signals for actuators.
  - Synchronization Module: Ensures actions match conveyor belt velocity to accurately sort products.

- **Web Dashboard:**
  - Backend: Node.js/Express (API for receiving and coordinating inference results)
  - Frontend: ReactJS UI for live video, statistics, system status (displays types and counts of detected/defective fruits).

## Experimentation and Evaluation

- **Prototype Construction:** Conveyor system assembly, camera/actuator installation, end-to-end integration.
- **AI Model Training:** Data collection & labeling, augmentation, model selection (e.g., Azure Custom Vision), model export for edge deployment, metrics: accuracy, recall, F1 score, confusion matrix.
- **System Performance:** Real-time inference speed, resource usage (CPU/RAM/GPU), actuation timing and precision, stability across lighting conditions, dashboard latency.

## How to Start the Application

1. **Start the Web App**
   ```bash
   cd web-app
   npm install       # Only run once for dependencies
   npm run dev
   ```
2. **Open the Dashboard UI**
   - Go to: [http://localhost:3000](http://localhost:3000)  
   - This shows the live dashboard and camera stream.

3. **Start the Edge Device (Hardware)**
   - Connect the camera to your edge device.
   - Run the Python script:
     ```bash
     cd firmware
     python realtime.py
     ```
   - The device will begin capturing frames, processing AI inferences, and streaming data to the backend.

## Database Management

- Uses SQLite database under `database/fruit_quality.db`.
- Data is updated automatically in real-time as the edge device runs.
## Advantages Over Manual Inspection

- Reduces labor and increases throughput.
- Improves sorting accuracy and repeatability.
- Supports inline, real-time visualization for operators.

## Future Development

- Expand datasets to cover additional fruit types.
- Support for multiple camera modules.
- Cloud-based reporting and predictive analytics.
- AI model optimization for speed and accuracy.
- Industrial deployment-ready enhancements.

## Project License

This project is for academic, research, and educational use.

---

**For more technical details, please refer to sub-folder READMEs and source code comments.**
