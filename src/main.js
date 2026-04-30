import "./style.css";
import "cesium/Build/Cesium/Widgets/widgets.css";
import * as Cesium from "cesium";

window.CESIUM_BASE_URL = CESIUM_BASE_URL;

// Vite hot reload can re-run this file without fully reloading the page.
// Destroying the previous viewer prevents stacked canvases and repeated camera motion.
if (window.cesiumViewer) {
  window.cesiumViewer.destroy();
}

document.querySelector("#app").innerHTML = `
  <div id="cesiumContainer"></div>
  <button id="showPanelButton" class="floating-button" type="button">
    Show panel
  </button>
  <aside id="infoPanel">
    <div id="panelHeader" class="panel-header">
      <div>
        <p class="panel-kicker">Digital Twin POC</p>
        <h1>Decision Loop Demo</h1>
      </div>
      <div class="panel-controls">
        <button id="resetPanelButton" class="panel-button" type="button">
          Reset
        </button>
        <button id="hidePanelButton" class="panel-button" type="button">
          Hide
        </button>
      </div>
    </div>
    <p class="panel-intro">
      Click a measurement point on the map to inspect its current belief state.
      Drag this panel by the header if it covers the scene.
    </p>

    <section class="panel-section">
      <h2>Selected Point</h2>
      <p><strong>ID:</strong> <span id="selectedId">None</span></p>
      <p><strong>Name:</strong> <span id="selectedName">Nothing selected yet</span></p>
      <p><strong>Belief:</strong> <span id="selectedBelief">-</span></p>
      <p><strong>Sensor Type:</strong> <span id="selectedSensorType">-</span></p>
      <p><strong>Dose Rate:</strong> <span id="selectedDoseRate">-</span></p>
      <p><strong>Contamination:</strong> <span id="selectedContamination">-</span></p>
      <p><strong>Last Reading:</strong> <span id="selectedLastReading">-</span></p>
    </section>

    <section class="panel-section">
      <h2>Recommendation</h2>
      <p id="recommendationText">
        Select a point to see the next recommended action.
      </p>
    </section>

    <section class="panel-section">
      <h2>Measurement Update</h2>
      <p class="panel-helper">
        Edit the mock readings below. The belief state will be recalculated automatically.
      </p>
      <label class="field-label" for="doseRateInput">Dose rate (uSv/h)</label>
      <input id="doseRateInput" class="panel-input" type="number" min="0" step="0.01" />

      <label class="field-label" for="contaminationInput">Contamination (cpm)</label>
      <input
        id="contaminationInput"
        class="panel-input"
        type="number"
        min="0"
        step="1"
      />

      <label class="field-label" for="lastReadingInput">Last reading date and time</label>
      <input
        id="lastReadingInput"
        class="panel-input"
        type="datetime-local"
        step="60"
      />

      <button id="applyMeasurementButton" class="panel-button panel-action" type="button">
        Apply readings
      </button>

      <div class="threshold-guide">
        <div class="threshold-row threshold-low">
          <strong>Low</strong>
          <span>dose rate &lt; 0.25 uSv/h and contamination &lt; 50 cpm</span>
        </div>
        <div class="threshold-row threshold-medium">
          <strong>Medium</strong>
          <span>dose rate 0.25 to 0.99 uSv/h or contamination 50 to 149 cpm</span>
        </div>
        <div class="threshold-row threshold-high">
          <strong>High</strong>
          <span>dose rate 1.00+ uSv/h or contamination 150+ cpm</span>
        </div>
      </div>
    </section>

    <section class="panel-section">
      <h2>Manual Belief Override</h2>
      <div id="beliefControls" class="belief-controls">
        <button class="belief-button" data-belief="Low" type="button">Low</button>
        <button class="belief-button" data-belief="Medium" type="button">Medium</button>
        <button class="belief-button" data-belief="High" type="button">High</button>
      </div>
    </section>

    <section class="panel-section">
      <h2>Audit Log</h2>
      <ul id="auditLog">
        <li>Application started. Waiting for user selection.</li>
      </ul>
    </section>
  </aside>
`;

const siteCenter = {
  longitude: -75.59777,
  latitude: 40.03883,
};

const beliefRecommendations = {
  Low: "Continue routine monitoring. No immediate intervention is recommended.",
  Medium:
    "Flag for analyst review and schedule a follow-up measurement on the next shift.",
  High: "Escalate for supervisor review and prioritize field verification of this area.",
};

const beliefColors = {
  Low: Cesium.Color.LIMEGREEN,
  Medium: Cesium.Color.GOLD,
  High: Cesium.Color.ORANGERED,
};

const measurementPoints = [
  {
    id: "MP-01",
    name: "North Gate Monitor",
    longitude: -75.5979,
    latitude: 40.03915,
    belief: "Low",
    sensorType: "Gamma",
    doseRate: 0.08,
    doseRateUnit: "uSv/h",
    contamination: 14,
    contaminationUnit: "cpm",
    lastReading: "08:15",
  },
  {
    id: "MP-02",
    name: "Vent Stack Sensor",
    longitude: -75.5972,
    latitude: 40.03895,
    belief: "Medium",
    sensorType: "Air Sample",
    doseRate: 0.46,
    doseRateUnit: "uSv/h",
    contamination: 63,
    contaminationUnit: "cpm",
    lastReading: "08:17",
  },
  {
    id: "MP-03",
    name: "Waste Pad Checkpoint",
    longitude: -75.5981,
    latitude: 40.03855,
    belief: "High",
    sensorType: "Surface Check",
    doseRate: 1.28,
    doseRateUnit: "uSv/h",
    contamination: 186,
    contaminationUnit: "cpm",
    lastReading: "08:19",
  },
];

const infoPanelElement = document.querySelector("#infoPanel");
const panelHeaderElement = document.querySelector("#panelHeader");
const hidePanelButton = document.querySelector("#hidePanelButton");
const resetPanelButton = document.querySelector("#resetPanelButton");
const showPanelButton = document.querySelector("#showPanelButton");
const beliefButtonElements = Array.from(
  document.querySelectorAll(".belief-button"),
);
const selectedIdElement = document.querySelector("#selectedId");
const selectedNameElement = document.querySelector("#selectedName");
const selectedBeliefElement = document.querySelector("#selectedBelief");
const selectedSensorTypeElement = document.querySelector("#selectedSensorType");
const selectedDoseRateElement = document.querySelector("#selectedDoseRate");
const selectedContaminationElement = document.querySelector("#selectedContamination");
const selectedLastReadingElement = document.querySelector("#selectedLastReading");
const doseRateInputElement = document.querySelector("#doseRateInput");
const contaminationInputElement = document.querySelector("#contaminationInput");
const lastReadingInputElement = document.querySelector("#lastReadingInput");
const applyMeasurementButton = document.querySelector("#applyMeasurementButton");
const recommendationTextElement = document.querySelector("#recommendationText");
const auditLogElement = document.querySelector("#auditLog");

let selectedMeasurementEntity = null;

const viewer = new Cesium.Viewer("cesiumContainer", {
  animation: false,
  timeline: false,
  baseLayerPicker: false,
  infoBox: false,
  selectionIndicator: false,
});

window.cesiumViewer = viewer;

viewer.scene.screenSpaceCameraController.inertiaSpin = 0;
viewer.scene.screenSpaceCameraController.inertiaTranslate = 0;
viewer.scene.screenSpaceCameraController.inertiaZoom = 0;

viewer.entities.add({
  name: "Mock Facility Core",
  position: Cesium.Cartesian3.fromDegrees(
    siteCenter.longitude,
    siteCenter.latitude,
    20,
  ),
  box: {
    dimensions: new Cesium.Cartesian3(80, 50, 40),
    material: Cesium.Color.SLATEGRAY.withAlpha(0.9),
    outline: true,
    outlineColor: Cesium.Color.WHITE,
  },
  description: "Simple facility building used as the main site landmark.",
});

viewer.entities.add({
  name: "Controlled Area",
  polygon: {
    hierarchy: Cesium.Cartesian3.fromDegreesArray([
      -75.5985, 40.0393, -75.5969, 40.0393, -75.5969, 40.0383, -75.5985,
      40.0383,
    ]),
    material: Cesium.Color.CORNFLOWERBLUE.withAlpha(0.2),
    outline: true,
    outlineColor: Cesium.Color.CORNFLOWERBLUE,
  },
  description: "Mock controlled boundary for the decommissioning work zone.",
});

function formatDoseRate(value, unit) {
  return `${value.toFixed(2)} ${unit}`;
}

function formatContamination(value, unit) {
  return `${value} ${unit}`;
}

function getCurrentReadingTimestamp() {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;

  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
}

function normalizeReadingTimestamp(value) {
  if (!value) {
    return getCurrentReadingTimestamp();
  }

  if (/^\d{2}:\d{2}$/.test(value)) {
    return `${getCurrentReadingTimestamp().slice(0, 10)}T${value}`;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    return value;
  }

  return getCurrentReadingTimestamp();
}

function formatReadingTimestamp(value) {
  const normalizedValue = normalizeReadingTimestamp(value);
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return normalizedValue;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function deriveBeliefFromMeasurements(doseRate, contamination) {
  if (doseRate >= 1 || contamination >= 150) {
    return "High";
  }

  if (doseRate >= 0.25 || contamination >= 50) {
    return "Medium";
  }

  return "Low";
}

function buildPointLabel(point) {
  return `${point.id} (${point.belief})\n${formatDoseRate(
    point.doseRate,
    point.doseRateUnit,
  )}`;
}

function buildRecommendation(belief, pointData) {
  const baseRecommendation = beliefRecommendations[belief];
  const measurementContext = `Current readings: ${formatDoseRate(
    pointData.doseRate,
    pointData.doseRateUnit,
  )} dose rate, ${formatContamination(
    pointData.contamination,
    pointData.contaminationUnit,
  )} contamination.`;

  return `${baseRecommendation} ${measurementContext}`;
}

function buildPointDescription(pointData) {
  return `
    <strong>${pointData.name}</strong><br />
    Belief state: ${pointData.belief}<br />
    Dose rate: ${formatDoseRate(pointData.doseRate, pointData.doseRateUnit)}<br />
    Contamination: ${formatContamination(
      pointData.contamination,
      pointData.contaminationUnit,
    )}<br />
    Last reading: ${formatReadingTimestamp(pointData.lastReading)}
  `;
}

measurementPoints.forEach((point) => {
  point.lastReading = normalizeReadingTimestamp(point.lastReading);
  point.belief = deriveBeliefFromMeasurements(
    point.doseRate,
    point.contamination,
  );

  viewer.entities.add({
    id: point.id,
    name: point.name,
    position: Cesium.Cartesian3.fromDegrees(point.longitude, point.latitude, 8),
    point: {
      pixelSize: 14,
      color: beliefColors[point.belief],
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
    },
    label: {
      text: buildPointLabel(point),
      font: "14px sans-serif",
      pixelOffset: new Cesium.Cartesian2(0, -24),
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      fillColor: Cesium.Color.WHITE,
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
    },
    description: `
      ${buildPointDescription(point)}
    `,
    properties: {
      belief: point.belief,
      sensorType: point.sensorType,
      doseRate: point.doseRate,
      doseRateUnit: point.doseRateUnit,
      contamination: point.contamination,
      contaminationUnit: point.contaminationUnit,
      lastReading: point.lastReading,
      recommendation: buildRecommendation(point.belief, point),
      entityType: "measurementPoint",
    },
  });
});

function addAuditLogEntry(message) {
  const listItem = document.createElement("li");
  const timestamp = new Date().toLocaleTimeString();

  listItem.textContent = `${timestamp}: ${message}`;
  auditLogElement.prepend(listItem);
}

function setBeliefButtonsState(activeBelief) {
  beliefButtonElements.forEach((button) => {
    const matchesBelief = button.dataset.belief === activeBelief;

    button.disabled = !selectedMeasurementEntity;
    button.classList.toggle("is-active", matchesBelief);
  });
}

function setMeasurementFormState(isEnabled) {
  doseRateInputElement.disabled = !isEnabled;
  contaminationInputElement.disabled = !isEnabled;
  lastReadingInputElement.disabled = !isEnabled;
  applyMeasurementButton.disabled = !isEnabled;
}

function updatePanel(entity) {
  const belief = entity.properties.belief.getValue();
  const sensorType = entity.properties.sensorType.getValue();
  const doseRate = entity.properties.doseRate.getValue();
  const doseRateUnit = entity.properties.doseRateUnit.getValue();
  const contamination = entity.properties.contamination.getValue();
  const contaminationUnit = entity.properties.contaminationUnit.getValue();
  const lastReading = entity.properties.lastReading.getValue();
  const recommendation = entity.properties.recommendation.getValue();

  selectedIdElement.textContent = entity.id;
  selectedNameElement.textContent = entity.name;
  selectedBeliefElement.textContent = belief;
  selectedSensorTypeElement.textContent = sensorType;
  selectedDoseRateElement.textContent = formatDoseRate(doseRate, doseRateUnit);
  selectedContaminationElement.textContent = formatContamination(
    contamination,
    contaminationUnit,
  );
  selectedLastReadingElement.textContent = formatReadingTimestamp(lastReading);
  recommendationTextElement.textContent = recommendation;
  doseRateInputElement.value = doseRate.toFixed(2);
  contaminationInputElement.value = String(contamination);
  lastReadingInputElement.value = normalizeReadingTimestamp(lastReading);
  setMeasurementFormState(true);
  setBeliefButtonsState(belief);
}

function applyBeliefUpdate(entity, nextBelief) {
  const pointData = {
    id: entity.id,
    name: entity.name,
    belief: nextBelief,
    doseRate: entity.properties.doseRate.getValue(),
    doseRateUnit: entity.properties.doseRateUnit.getValue(),
    contamination: entity.properties.contamination.getValue(),
    contaminationUnit: entity.properties.contaminationUnit.getValue(),
    lastReading: entity.properties.lastReading.getValue(),
  };

  entity.properties.belief.setValue(nextBelief);
  entity.properties.recommendation.setValue(
    buildRecommendation(nextBelief, pointData),
  );
  entity.point.color.setValue(beliefColors[nextBelief]);
  entity.label.text.setValue(
    `${entity.id} (${nextBelief})\n${formatDoseRate(
      pointData.doseRate,
      pointData.doseRateUnit,
    )}`,
  );
  entity.description.setValue(buildPointDescription(pointData));
}

function applyMeasurementUpdate(entity, nextDoseRate, nextContamination, nextLastReading) {
  const normalizedLastReading = normalizeReadingTimestamp(nextLastReading);
  const nextBelief = deriveBeliefFromMeasurements(
    nextDoseRate,
    nextContamination,
  );
  const pointData = {
    id: entity.id,
    name: entity.name,
    belief: nextBelief,
    doseRate: nextDoseRate,
    doseRateUnit: entity.properties.doseRateUnit.getValue(),
    contamination: nextContamination,
    contaminationUnit: entity.properties.contaminationUnit.getValue(),
    lastReading: normalizedLastReading,
  };

  entity.properties.doseRate.setValue(nextDoseRate);
  entity.properties.contamination.setValue(nextContamination);
  entity.properties.lastReading.setValue(normalizedLastReading);
  entity.properties.belief.setValue(nextBelief);
  entity.properties.recommendation.setValue(
    buildRecommendation(nextBelief, pointData),
  );

  entity.point.color.setValue(beliefColors[nextBelief]);
  entity.label.text.setValue(buildPointLabel(pointData));
  entity.description.setValue(buildPointDescription(pointData));
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function placePanel(left, top) {
  const padding = 16;
  const maxLeft = Math.max(
    padding,
    window.innerWidth - infoPanelElement.offsetWidth - padding,
  );
  const maxTop = Math.max(
    padding,
    window.innerHeight - infoPanelElement.offsetHeight - padding,
  );

  infoPanelElement.style.left = `${clamp(left, padding, maxLeft)}px`;
  infoPanelElement.style.top = `${clamp(top, padding, maxTop)}px`;
}

function resetPanelPosition() {
  const left = window.innerWidth - infoPanelElement.offsetWidth - 16;
  placePanel(left, 16);
}

function setPanelVisible(isVisible) {
  infoPanelElement.classList.toggle("is-hidden", !isVisible);
  showPanelButton.classList.toggle("is-visible", !isVisible);
}

const dragState = {
  active: false,
  offsetX: 0,
  offsetY: 0,
};

panelHeaderElement.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) {
    return;
  }

  const panelBounds = infoPanelElement.getBoundingClientRect();

  dragState.active = true;
  dragState.offsetX = event.clientX - panelBounds.left;
  dragState.offsetY = event.clientY - panelBounds.top;

  panelHeaderElement.setPointerCapture(event.pointerId);
  infoPanelElement.classList.add("is-dragging");
  event.preventDefault();
});

panelHeaderElement.addEventListener("pointermove", (event) => {
  if (!dragState.active) {
    return;
  }

  placePanel(
    event.clientX - dragState.offsetX,
    event.clientY - dragState.offsetY,
  );
});

function stopDragging(event) {
  if (!dragState.active) {
    return;
  }

  dragState.active = false;
  infoPanelElement.classList.remove("is-dragging");

  if (panelHeaderElement.hasPointerCapture(event.pointerId)) {
    panelHeaderElement.releasePointerCapture(event.pointerId);
  }
}

panelHeaderElement.addEventListener("pointerup", stopDragging);
panelHeaderElement.addEventListener("pointercancel", stopDragging);

hidePanelButton.addEventListener("click", () => {
  setPanelVisible(false);
});

showPanelButton.addEventListener("click", () => {
  setPanelVisible(true);
});

resetPanelButton.addEventListener("click", () => {
  setPanelVisible(true);
  resetPanelPosition();
});

function handleWindowResize() {
  if (infoPanelElement.classList.contains("is-hidden")) {
    return;
  }

  const panelBounds = infoPanelElement.getBoundingClientRect();
  placePanel(panelBounds.left, panelBounds.top);
}

window.addEventListener("resize", handleWindowResize);

const clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

clickHandler.setInputAction((event) => {
  const pickedObject = viewer.scene.pick(event.position);

  if (!Cesium.defined(pickedObject) || !Cesium.defined(pickedObject.id)) {
    return;
  }

  const entity = pickedObject.id;
  const entityType = entity.properties?.entityType?.getValue();

  if (entityType !== "measurementPoint") {
    return;
  }

  selectedMeasurementEntity = entity;
  updatePanel(entity);
  addAuditLogEntry(
    `Selected ${entity.id} (${entity.name}) with belief ${entity.properties.belief.getValue()}.`,
  );
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

beliefButtonElements.forEach((button) => {
  button.addEventListener("click", () => {
    if (!selectedMeasurementEntity) {
      return;
    }

    const nextBelief = button.dataset.belief;
    const currentBelief =
      selectedMeasurementEntity.properties.belief.getValue();

    if (currentBelief === nextBelief) {
      addAuditLogEntry(
        `${selectedMeasurementEntity.id} already has belief ${nextBelief}. No update was needed.`,
      );
      return;
    }

    applyBeliefUpdate(selectedMeasurementEntity, nextBelief);
    updatePanel(selectedMeasurementEntity);
    addAuditLogEntry(
      `Updated ${selectedMeasurementEntity.id} belief from ${currentBelief} to ${nextBelief}.`,
    );
  });
});

applyMeasurementButton.addEventListener("click", () => {
  if (!selectedMeasurementEntity) {
    return;
  }

  const nextDoseRate = Number(doseRateInputElement.value);
  const nextContamination = Number(contaminationInputElement.value);
  const nextLastReading = lastReadingInputElement.value || getCurrentReadingTimestamp();

  if (
    Number.isNaN(nextDoseRate) ||
    Number.isNaN(nextContamination)
  ) {
    addAuditLogEntry(
      "Measurement update was skipped because one or more input values were missing.",
    );
    return;
  }

  const previousDoseRate = selectedMeasurementEntity.properties.doseRate.getValue();
  const previousContamination =
    selectedMeasurementEntity.properties.contamination.getValue();
  const previousBelief = selectedMeasurementEntity.properties.belief.getValue();

  applyMeasurementUpdate(
    selectedMeasurementEntity,
    nextDoseRate,
    nextContamination,
    nextLastReading,
  );
  updatePanel(selectedMeasurementEntity);

  const nextBelief = selectedMeasurementEntity.properties.belief.getValue();

  addAuditLogEntry(
    `Updated ${selectedMeasurementEntity.id} readings: dose rate ${previousDoseRate.toFixed(
      2,
    )} to ${nextDoseRate.toFixed(2)} uSv/h, contamination ${previousContamination} to ${nextContamination} cpm, belief ${previousBelief} to ${nextBelief}.`,
  );
});

viewer.camera.setView({
  destination: Cesium.Cartesian3.fromDegrees(
    siteCenter.longitude,
    siteCenter.latitude,
    1500,
  ),
  orientation: {
    heading: 0,
    pitch: -Cesium.Math.PI_OVER_TWO,
    roll: 0,
  },
});

resetPanelPosition();
setPanelVisible(true);
setMeasurementFormState(false);
lastReadingInputElement.value = getCurrentReadingTimestamp();
setBeliefButtonsState(null);

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    window.removeEventListener("resize", handleWindowResize);
    clickHandler.destroy();
    viewer.destroy();
    window.cesiumViewer = null;
  });
}
