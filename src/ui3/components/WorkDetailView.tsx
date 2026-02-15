import { type WorkSection } from '../../shared/parseWorkDetail';
import { WorkDetailBlocks, renderBold } from './WorkDetailBlocks';
import { type WorkKey } from '../../content/work';

interface Props {
  activeWork: WorkKey;
  title: string;
  heroSubtitle: string;
  parsedWork: WorkSection[] | null;
  onBack: () => void;
}

/** section name → slug for CSS data attribute */
function sectionSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function isFootnote(name: string) {
  return /footnote/i.test(name);
}

export function WorkDetailView({ activeWork, title, heroSubtitle, parsedWork, onBack }: Props) {
  const filteredSections = parsedWork?.filter((s) => s.name !== 'Hero') ?? [];

  return (
    <section id="work-detail" className="section wd-root">
      {/* ── Nav ── */}
      <nav className="wd-nav">
        <button type="button" onClick={onBack} className="work-detail-back">
          ← Back
        </button>
      </nav>

      {/* ── Hero ── */}
      <header className="wd-hero">
        <span className="wd-hero-eyebrow">Case Study</span>
        <h1 className="wd-hero-title">{title}</h1>
        {heroSubtitle && (
          <p className="wd-hero-subtitle">{renderBold(heroSubtitle)}</p>
        )}
      </header>

      {/* ── Sections ── */}
      <div className="wd-body">
        {filteredSections.map((section, idx) => (
          <div
            key={section.name}
            className={`wd-section${isFootnote(section.name) ? ' wd-footnote' : ''}`}
            data-section={sectionSlug(section.name)}
            data-idx={idx}
          >
            <WorkDetailBlocks blocks={section.blocks} activeWork={activeWork} />
          </div>
        ))}
      </div>
    </section>
  );
}
