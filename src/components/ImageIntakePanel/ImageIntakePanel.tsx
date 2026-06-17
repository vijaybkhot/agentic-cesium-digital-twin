import { useRef, useState } from "react";
import { evaluateImageSetReadiness } from "../../domain/imageIntake/evaluateImageSetReadiness";
import { formatImageIntakeAssistantMessage } from "../../domain/imageIntake/formatImageIntakeAssistantMessage";
import { inspectImageSet } from "../../domain/imageIntake/inspectImageSet";
import type {
  ImageIntakeReview,
  ImageReadinessStatus,
} from "../../types/imageIntake";
import "./ImageIntakePanel.css";

interface ImageIntakePanelProps {
  hasProjectLocation?: boolean;
}

function formatBytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatNumber(value: number): string {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 1,
  });
}

function formatStatus(status: ImageReadinessStatus): string {
  if (status === "ready_for_initial_test") {
    return "Ready for Initial Test";
  }

  if (status === "needs_review") {
    return "Review Recommended";
  }

  return "Not Ready";
}

export function ImageIntakePanel({
  hasProjectLocation = false,
}: ImageIntakePanelProps) {
  const [review, setReview] = useState<ImageIntakeReview | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inspectionRequestIdRef = useRef(0);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    const requestId = inspectionRequestIdRef.current + 1;

    inspectionRequestIdRef.current = requestId;
    setIsInspecting(true);
    setError(null);

    try {
      const inspection = await inspectImageSet(files);
      const result = evaluateImageSetReadiness({
        images: inspection.images,
        unsupportedFileCount: inspection.unsupportedFileCount,
        failedImageCount: inspection.failedImageCount,
        hasManualLocation: hasProjectLocation,
      });
      const nextReview = {
        images: inspection.images,
        summary: result.summary,
        readiness: result.readiness,
        assistantMessage: formatImageIntakeAssistantMessage(result),
      };

      if (inspectionRequestIdRef.current === requestId) {
        setReview(nextReview);
      }
    } catch (nextError) {
      if (inspectionRequestIdRef.current === requestId) {
        setError(
          nextError instanceof Error
            ? nextError.message
            : "Image intake failed unexpectedly.",
        );
      }
    } finally {
      if (inspectionRequestIdRef.current === requestId) {
        setIsInspecting(false);
      }
    }
  }

  function clearReview() {
    inspectionRequestIdRef.current += 1;
    setReview(null);
    setError(null);
    setIsInspecting(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <aside
      className={`image-intake-panel ${isCollapsed ? "is-collapsed" : ""}`}
    >
      <div className="image-intake-header">
        <div>
          <p className="panel-kicker">POC 2A</p>
          <h2>Image Intake / Mock Assistant</h2>
        </div>
        <div className="image-intake-actions">
          <button
            className="panel-button"
            type="button"
            onClick={() => setIsCollapsed((currentValue) => !currentValue)}
          >
            {isCollapsed ? "Show" : "Hide"}
          </button>
          <button
            className="panel-button"
            type="button"
            onClick={clearReview}
            disabled={!review && !error && !isInspecting}
          >
            Clear
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <p className="image-intake-copy">
            Select local images to run browser-only metadata checks. Files stay
            on this machine.
          </p>

          <label className="image-file-input">
            <span>Select images</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              disabled={isInspecting}
              onChange={handleFileChange}
            />
          </label>

          {isInspecting && (
            <p className="image-intake-status">Inspecting image dimensions...</p>
          )}

          {error && <p className="image-intake-error">{error}</p>}

          {review && (
            <div className="image-intake-results">
              <div
                className={`readiness-badge readiness-${review.readiness.status}`}
              >
                {formatStatus(review.readiness.status)}
              </div>

              <dl className="image-summary-grid">
                <div>
                  <dt>Usable images</dt>
                  <dd>{review.summary.imageCount}</dd>
                </div>
                <div>
                  <dt>Unsupported files</dt>
                  <dd>{review.summary.unsupportedFileCount}</dd>
                </div>
                <div>
                  <dt>Unreadable images</dt>
                  <dd>{review.summary.failedImageCount}</dd>
                </div>
                <div>
                  <dt>Total size</dt>
                  <dd>{formatBytes(review.summary.totalSizeBytes)}</dd>
                </div>
                <div>
                  <dt>Average resolution</dt>
                  <dd>
                    {formatNumber(review.summary.averageWidth)} x{" "}
                    {formatNumber(review.summary.averageHeight)}
                  </dd>
                </div>
                <div>
                  <dt>Average megapixels</dt>
                  <dd>{review.summary.averageMegapixels.toFixed(2)} MP</dd>
                </div>
                <div>
                  <dt>Low resolution</dt>
                  <dd>{review.summary.lowResolutionCount}</dd>
                </div>
              </dl>

              <ResultList title="Reasons" values={review.readiness.reasons} />
              <ResultList
                title="Missing Inputs"
                values={review.readiness.missingInputs}
              />
              <ResultList
                title="Recommended Actions"
                values={review.readiness.recommendedActions}
              />

              <section className="assistant-message">
                <h3>Mock Assistant Message</h3>
                <pre>{review.assistantMessage}</pre>
              </section>
            </div>
          )}
        </>
      )}
    </aside>
  );
}

function ResultList({ title, values }: { title: string; values: string[] }) {
  return (
    <section className="image-result-list">
      <h3>{title}</h3>
      {values.length > 0 ? (
        <ul>
          {values.map((value, index) => (
            <li key={`${title}-${index}-${value}`}>{value}</li>
          ))}
        </ul>
      ) : (
        <p>None flagged.</p>
      )}
    </section>
  );
}
