import { type Block } from '../../shared/parseWorkDetail';

export function renderBold(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}

/**
 * raw(src)가 아래 형태들일 수 있어 정규화합니다.
 * - "as_is_to_be.jpg" (파일명만)
 * - "/work/empty-house-cps/as_is_to_be.jpg" (절대경로)
 * - "public/work/empty-house-cps/as_is_to_be.jpg" (public prefix 포함)
 * - "C:\dev\...\as_is_to_be.jpg" (윈도우 로컬 경로)
 */
function resolveAssetSrc(raw: string, activeWork: string) {
  let s = (raw ?? '').trim();
  if (!s) return '';

  // URL
  if (s.startsWith('http://') || s.startsWith('https://')) return s;

  // Strip "public/" prefix
  if (s.startsWith('public/')) s = s.slice('public/'.length);

  // Already correct absolute web path
  if (s.startsWith('/work/')) return s;

  // Relative "work/..." → prepend /
  if (s.startsWith('work/')) return `/${s}`;

  // Other absolute web path
  if (s.startsWith('/')) return s;

  // Any remaining path (nested dirs, windows paths, bare filenames) → basename + folder mapping
  const base = s.split(/[/\\]/).pop() ?? s;

  const folder =
    activeWork === 'empty-house' ? 'empty-house-cps'
    : activeWork === 'skin-diary' ? 'skin-diary-ai'
    : 'pmcc';

  return `/work/${folder}/${base}`;
}

function isVideoSrc(src: string) {
  const s = (src ?? '').toLowerCase();
  return s.endsWith('.mp4') || s.endsWith('.webm');
}

function renderBlock(block: Block, idx: number, activeWork: string) {
  switch (block.type) {
    case 'section-title':
      return (
        <div key={idx} className="work-detail-section-title">
          {block.eyebrow && <div className="section-eyebrow">{block.eyebrow}</div>}
          <h3 className="work-detail-subtitle">{block.title}</h3>
          {block.desc && <p className="section-description">{renderBold(block.desc)}</p>}
        </div>
      );

    case 'paragraph':
      return (
        <p key={idx} className="section-description">
          {renderBold(block.text)}
        </p>
      );

    case 'heading':
      return (
        <h3 key={idx} className="work-detail-subtitle">
          {block.text}
        </h3>
      );

    case 'cards':
      return (
        <div key={idx} className={`work-detail-cards ${block.items.length >= 3 ? 'cols-3' : 'cols-2'}`}>
          {block.items.map((card, ci) => (
            <div key={ci} className="work-detail-card">
              <div className="work-detail-card-title">{card.title}</div>
              <p className="work-detail-card-body">{renderBold(card.body)}</p>
            </div>
          ))}
        </div>
      );

    case 'image': {
      const src = resolveAssetSrc(block.src, activeWork);

      return (
        <div key={idx} className="work-detail-image-wrap">
          {isVideoSrc(src) ? (
            <video
              src={src}
              controls
              playsInline
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: '12px',
                border: '1px solid #e5e5e5',
                background: '#f5f5f5',
              }}
            />
          ) : (
            <img
              src={src}
              alt={src}
              loading="lazy"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: '12px',
                border: '1px solid #e5e5e5',
                background: '#f5f5f5',
              }}
            />
          )}

          {block.caption && <p className="work-detail-caption">{block.caption}</p>}
        </div>
      );
    }

    case 'table':
      return (
        <div key={idx} className="work-detail-table-wrap">
          <table className="work-detail-table">
            <thead>
              <tr>
                {block.headers.map((h, hi) => (
                  <th key={hi}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{renderBold(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}

export function WorkDetailBlocks({ blocks, activeWork }: { blocks: Block[]; activeWork: string }) {
  return <>{blocks.map((block, i) => renderBlock(block, i, activeWork))}</>;
}
