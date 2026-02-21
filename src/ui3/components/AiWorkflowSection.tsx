interface AiWorkflowSectionProps {
  raw: string;
}

function parseAiWorkflow(raw: string) {
  const lines = raw.split("\n");

  // ## 헤더로 섹션 분리
  const orchIdx = lines.findIndex((l) => l.startsWith("## 오케스트레이션"));
  const flowIdx = lines.findIndex((l) => l.startsWith("## 자동화"));
  const stackIdx = lines.findIndex((l) => l.startsWith("## 사용 스택"));

  // 첫 번째 bold 라인 추출 (headline)
  const headlineMatch = raw.match(/^\*\*(.+)\*\*$/m);
  const headline = headlineMatch ? headlineMatch[1] : "";

  // 오케스트레이션 항목들 파싱
  const orchItems: { label: string; body: string }[] = [];
  if (orchIdx >= 0) {
    for (let i = orchIdx + 1; i < lines.length; i++) {
      if (lines[i].startsWith("##")) break;
      const m = lines[i].match(/^-\s+\*\*(.+?)\*\*:\s+(.+)/);
      if (m) orchItems.push({ label: m[1], body: m[2] });
    }
  }

  // 워크플로우 스텝
  let flowLine = "";
  let flowDesc = "";
  if (flowIdx >= 0) {
    for (let i = flowIdx + 1; i < lines.length; i++) {
      if (lines[i].startsWith("##")) break;
      if (lines[i].trim() && !flowLine) flowLine = lines[i].trim();
      else if (lines[i].trim() && !flowDesc) flowDesc = lines[i].trim();
    }
  }

  // 스택 태그
  let stackLine = "";
  if (stackIdx >= 0) {
    for (let i = stackIdx + 1; i < lines.length; i++) {
      if (lines[i].startsWith("##")) break;
      if (lines[i].trim()) { stackLine = lines[i].trim(); break; }
    }
  }
  const stackTags = stackLine ? stackLine.split("·").map((s) => s.trim()).filter(Boolean) : [];

  return { headline, orchItems, flowLine, flowDesc, stackTags };
}

export function AiWorkflowSection({ raw }: AiWorkflowSectionProps) {
  const { headline, orchItems, flowLine, flowDesc, stackTags } = parseAiWorkflow(raw);

  const flowSteps = flowLine
    ? flowLine.split("→").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {/* Headline */}
      {headline && (
        <p
          style={{
            fontSize: 17,
            color: "#1a1a1a",
            fontWeight: 600,
            lineHeight: 1.6,
            margin: 0,
            borderLeft: "3px solid #2563eb",
            paddingLeft: 14,
          }}
        >
          {headline}
        </p>
      )}

      {/* 오케스트레이션 구조 */}
      {orchItems.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 11,
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: "0.45px",
              marginBottom: 16,
            }}
          >
            오케스트레이션 구조
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 12,
            }}
          >
            {orchItems.map((item) => (
              <div
                key={item.label}
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: 10,
                  padding: "16px 18px",
                  background: "#fafafa",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#2563eb",
                    marginBottom: 6,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#555",
                    lineHeight: 1.6,
                  }}
                >
                  {item.body}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 자동화 워크플로우 */}
      {flowSteps.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 11,
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: "0.45px",
              marginBottom: 16,
            }}
          >
            자동화 워크플로우
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 0,
              marginBottom: flowDesc ? 14 : 0,
            }}
          >
            {flowSteps.map((step, i) => (
              <span
                key={step}
                style={{ display: "flex", alignItems: "center" }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#1a1a1a",
                    padding: "6px 12px",
                    background: i === 0 || i === flowSteps.length - 1 ? "#f0f4ff" : "#f5f5f5",
                    borderRadius: 20,
                    border: "1px solid " + (i === 0 || i === flowSteps.length - 1 ? "#c7d7fd" : "#e5e5e5"),
                  }}
                >
                  {step}
                </span>
                {i < flowSteps.length - 1 && (
                  <span
                    style={{
                      fontSize: 12,
                      color: "#bbb",
                      margin: "0 4px",
                    }}
                  >
                    →
                  </span>
                )}
              </span>
            ))}
          </div>
          {flowDesc && (
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, margin: 0 }}>
              {flowDesc}
            </p>
          )}
        </div>
      )}

      {/* 기술 스택 태그 */}
      {stackTags.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 11,
              color: "#999",
              textTransform: "uppercase",
              letterSpacing: "0.45px",
              marginBottom: 12,
            }}
          >
            사용 스택
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {stackTags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 12,
                  color: "#444",
                  background: "#f5f5f5",
                  border: "1px solid #e5e5e5",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontWeight: 500,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
