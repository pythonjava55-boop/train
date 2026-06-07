const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-count]");

const updateHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 20);
};

window.addEventListener("scroll", updateHeader);
updateHeader();

navToggle.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.innerHTML = isOpen
    ? '<i class="fa-solid fa-xmark"></i>'
    : '<i class="fa-solid fa-bars"></i>';
});

document.querySelectorAll(".nav-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${Math.min(index % 5, 4) * 70}ms`;
  revealObserver.observe(item);
});

const animateCounter = (counter) => {
  const target = Number(counter.dataset.count);
  const duration = 1200;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = Math.round(target * eased);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

counters.forEach((counter) => counterObserver.observe(counter));

const maintenanceForm = document.querySelector("#maintenanceForm");

if (maintenanceForm) {
  const loading = document.querySelector("#analysisLoading");
  const report = document.querySelector("#aiReport");
  const reportTrainId = document.querySelector("#reportTrainId");
  const healthScore = document.querySelector("#healthScore");
  const scoreBar = document.querySelector("#scoreBar");
  const riskLevel = document.querySelector("#riskLevel");
  const statusBadge = document.querySelector("#statusBadge");
  const operationStatus = document.querySelector("#operationStatus");
  const safetyRuleViolations = document.querySelector("#safetyRuleViolations");
  const measurementClassifications = document.querySelector("#measurementClassifications");
  const detectedIssues = document.querySelector("#detectedIssues");
  const recommendationsList = document.querySelector("#maintenanceRecommendations");
  const analyzeButton = maintenanceForm.querySelector(".analyze-btn");

  const addListItems = (list, items) => {
    list.innerHTML = "";
    items.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
  };

  const analyzeTrainHealth = (data) => {
    const issues = [];
    const classifications = [];
    const safetyViolations = [];
    const recommendations = new Set();
    const componentRisk = {
      engine: { weight: 25, severities: [] },
      brake: { weight: 30, severities: [] },
      wheel: { weight: 25, severities: [] },
      electrical: { weight: 10, severities: [] },
      safety: { weight: 10, severities: [] }
    };

    const isBetween = (value, min, max) => value >= min && value <= max;

    const classifyMetric = ({ component, label, value, unit, normal, warning, recommendation }) => {
      const status = normal(value) ? "Normal" : warning(value) ? "Warning" : "Critical";
      const severity = status === "Normal" ? 0 : status === "Warning" ? 0.5 : 1;

      componentRisk[component].severities.push(severity);
      classifications.push(`${label}: ${value}${unit} - ${status}`);

      if (status !== "Normal") {
        issues.push(`${label}: ${value}${unit} classified as ${status}.`);
        recommendations.add(recommendation);
      }
    };

    const addSafetyViolation = (condition, message, recommendation) => {
      if (condition) {
        safetyViolations.push(message);
        recommendations.add(recommendation);
      }
    };

    classifyMetric({
      component: "engine",
      label: "Engine temperature",
      value: data.engineTemperature,
      unit: " C",
      normal: (value) => value < 85,
      warning: (value) => isBetween(value, 85, 95),
      recommendation: "Perform engine cooling maintenance."
    });

    classifyMetric({
      component: "engine",
      label: "Oil level",
      value: data.oilLevelPercent,
      unit: "%",
      normal: (value) => value >= 60,
      warning: (value) => value >= 30,
      recommendation: "Refill oil and inspect the lubrication system for leakage."
    });

    classifyMetric({
      component: "engine",
      label: "Fuel rail pressure",
      value: data.fuelPressure,
      unit: " PSI",
      normal: (value) => isBetween(value, 45, 75),
      warning: (value) => isBetween(value, 35, 85),
      recommendation: "Inspect fuel filters, fuel lines, and pump pressure regulation."
    });

    classifyMetric({
      component: "engine",
      label: "Engine vibration",
      value: data.engineVibration,
      unit: " mm/s",
      normal: (value) => value <= 4.5,
      warning: (value) => value <= 7.1,
      recommendation: "Inspect engine mounts, bearings, and rotating components."
    });

    classifyMetric({
      component: "brake",
      label: "Brake pressure",
      value: data.brakePressure,
      unit: " PSI",
      normal: (value) => isBetween(value, 90, 125),
      warning: (value) => isBetween(value, 70, 140),
      recommendation: "Inspect braking system and restore operating pressure."
    });

    classifyMetric({
      component: "brake",
      label: "Brake pad thickness",
      value: data.brakePadThickness,
      unit: " mm",
      normal: (value) => value >= 12,
      warning: (value) => value >= 8,
      recommendation: "Inspect braking system and replace worn brake pads."
    });

    classifyMetric({
      component: "wheel",
      label: "Wheel wear",
      value: data.wheelWear,
      unit: "%",
      normal: (value) => value <= 15,
      warning: (value) => value <= 30,
      recommendation: "Schedule wheel profiling or replace worn wheel assembly."
    });

    classifyMetric({
      component: "wheel",
      label: "Wheel crack length",
      value: data.wheelCrackLength,
      unit: " mm",
      normal: (value) => value === 0,
      warning: (value) => value > 0 && value <= 2,
      recommendation: "Replace worn wheel assembly and perform axle inspection."
    });

    classifyMetric({
      component: "electrical",
      label: "Battery voltage",
      value: data.batteryVoltage,
      unit: " V",
      normal: (value) => isBetween(value, 68, 78),
      warning: (value) => isBetween(value, 62, 84),
      recommendation: "Check electrical subsystem and battery charging circuit."
    });

    classifyMetric({
      component: "electrical",
      label: "Signal packet loss",
      value: data.signalPacketLoss,
      unit: "%",
      normal: (value) => value <= 2,
      warning: (value) => value <= 5,
      recommendation: "Check signal communication modules and antenna connections."
    });

    classifyMetric({
      component: "safety",
      label: "Fire extinguisher pressure",
      value: data.fireExtinguisherPressure,
      unit: " PSI",
      normal: (value) => isBetween(value, 140, 180),
      warning: (value) => isBetween(value, 120, 200),
      recommendation: "Replace or certify fire safety equipment."
    });

    classifyMetric({
      component: "safety",
      label: "Emergency exit opening time",
      value: data.emergencyExitOpenTime,
      unit: " s",
      normal: (value) => value <= 5,
      warning: (value) => value <= 8,
      recommendation: "Repair emergency exit release hardware before passenger service."
    });

    classifyMetric({
      component: "safety",
      label: "Door response time",
      value: data.doorResponseTime,
      unit: " s",
      normal: (value) => value <= 2,
      warning: (value) => value <= 4,
      recommendation: "Inspect door control system, sensors, and interlocks."
    });

    addSafetyViolation(
      data.wheelCrackLength > 2,
      `Wheel crack length ${data.wheelCrackLength} mm exceeds the critical threshold of 2 mm.`,
      "Reject dispatch and replace worn wheel assembly before operation."
    );
    addSafetyViolation(
      data.brakePressure < 60,
      `Brake pressure ${data.brakePressure} PSI is below the emergency threshold of 60 PSI.`,
      "Reject dispatch and restore brake pressure before operation."
    );
    addSafetyViolation(
      data.engineTemperature > 105,
      `Engine temperature ${data.engineTemperature} C exceeds the emergency threshold of 105 C.`,
      "Reject dispatch and perform engine cooling maintenance."
    );
    addSafetyViolation(
      data.fireExtinguisherPressure < 120 || data.fireExtinguisherPressure > 200,
      `Fire safety inspection failed: extinguisher pressure ${data.fireExtinguisherPressure} PSI is outside the certified 120-200 PSI range.`,
      "Reject dispatch and replace or certify fire safety equipment."
    );
    addSafetyViolation(
      data.emergencyExitOpenTime > 8,
      `Emergency exit inspection failed: opening time ${data.emergencyExitOpenTime} s exceeds the critical threshold of 8 s.`,
      "Reject dispatch and repair emergency exit release hardware."
    );

    const riskScore = Math.round(
      Object.values(componentRisk).reduce((total, component) => {
        const averageSeverity = component.severities.reduce((sum, severity) => sum + severity, 0) / component.severities.length;
        return total + averageSeverity * component.weight;
      }, 0)
    );

    if (!issues.length) {
      recommendations.add("Cleared for operation. Continue routine measurement logging.");
    }

    const risk = safetyViolations.length || riskScore >= 61
      ? {
          className: "risk-high",
          label: "HIGH RISK",
          badge: "DO NOT OPERATE",
          status: safetyViolations.length
            ? "Train rejected by critical safety rule override."
            : "Train rejected because the weighted risk score is in the 61-100 range."
        }
      : riskScore >= 31
        ? {
            className: "risk-medium",
            label: "MEDIUM RISK",
            badge: "INSPECTION REQUIRED",
            status: "Inspection is required because the weighted risk score is in the 31-60 range."
          }
        : {
            className: "risk-low",
            label: "LOW RISK",
            badge: "SAFE TO RUN",
            status: "Weighted engineering risk score is in the 0-30 range. Train is safe to operate."
          };

    return {
      trainId: data.trainId,
      score: riskScore,
      risk,
      safetyViolations: safetyViolations.length ? safetyViolations : ["No critical safety rule violations detected."],
      classifications,
      issues: issues.length ? issues : ["No operational issues detected in mandatory inspection."],
      recommendations: Array.from(recommendations)
    };
  };

  const renderReport = (result) => {
    report.classList.remove("risk-low", "risk-medium", "risk-high");
    report.classList.add(result.risk.className, "visible");

    reportTrainId.textContent = result.trainId;
    healthScore.textContent = `${result.score}%`;
    scoreBar.style.width = `${result.score}%`;
    riskLevel.textContent = result.risk.label;
    statusBadge.textContent = result.risk.badge;
    operationStatus.textContent = result.risk.status;

    addListItems(safetyRuleViolations, result.safetyViolations);
    addListItems(measurementClassifications, result.classifications);
    addListItems(detectedIssues, result.issues);
    addListItems(recommendationsList, result.recommendations);

    report.hidden = false;
    report.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  maintenanceForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(maintenanceForm);
    const data = Object.fromEntries(formData.entries());
    [
      "engineTemperature",
      "oilLevelPercent",
      "fuelPressure",
      "engineVibration",
      "brakePressure",
      "brakePadThickness",
      "wheelWear",
      "wheelCrackLength",
      "batteryVoltage",
      "signalPacketLoss",
      "fireExtinguisherPressure",
      "emergencyExitOpenTime",
      "doorResponseTime"
    ].forEach((field) => {
      data[field] = Number(data[field]);
    });

    report.hidden = true;
    loading.hidden = false;
    analyzeButton.disabled = true;
    analyzeButton.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';
    loading.scrollIntoView({ behavior: "smooth", block: "center" });

    window.setTimeout(() => {
      const result = analyzeTrainHealth(data);
      loading.hidden = true;
      analyzeButton.disabled = false;
      analyzeButton.innerHTML = '<i class="fa-solid fa-brain"></i> Analyze Train Health';
      renderReport(result);
    }, 900);
  });
}
