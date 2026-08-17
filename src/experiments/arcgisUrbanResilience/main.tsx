import { createRoot } from "react-dom/client";
import "@arcgis/core/assets/esri/themes/light/main.css";
import { ArcgisUrbanResilienceExperiment } from "./ArcgisUrbanResilienceExperiment";
import "./arcgisUrbanResilienceExperiment.css";

createRoot(document.querySelector("#arcgis-experiment")!).render(
  <ArcgisUrbanResilienceExperiment />,
);
