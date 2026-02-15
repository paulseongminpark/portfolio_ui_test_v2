import { useState, useRef } from 'react';
import { type Block } from '../../shared/parseWorkDetail';

export function renderBold(text: string) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) =>
    i % 2 === 1 ? <strong key={i}>{part}</strong> : part,
  );
}

/* ── Path normalization (single source) ──────────────────────── */

function resolveAssetSrc(raw: string, activeWork: string) {
  let s = (raw ?? '').trim();
  if (!s) return '';
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (s.startsWith('public/')) s = s.slice('public/'.length);
  if (s.startsWith('/work/')) return s;
  if (s.startsWith('work/')) return `/${s}`;
  if (s.startsWith('/')) return s;
  // gptimages, nested dirs, Windows paths, bare filenames → basename + folder
  const base = s.split(/[/\\]/).pop() ?? s;
  const folder =
    activeWork === 'empty-house' ? 'empty-house-cps'
    : activeWork === 'skin-diary' ? 'skin-diary-ai'
    : 'pmcc';
  return `/work/${folder}/${base}`;
}

function isVideoSrc(src: string) {
  return /\.(mp4|webm)$/i.test(src);
}

/* ── Pre-processing: carousel / as-is-to-be detection ────────── */

interface ImageRef { src: string; caption?: string }

type Processed =
  | { kind: 'block'; block: Block }
  | { kind: 'carousel'; images: ImageRef[] }
  | { kind: 'asistobe'; src: string; caption?: string };

const isOntology = (s: string) => /ontology_/i.test(s);
const isAsIsToBe = (s: string) => /as_is_to_be/i.test(s);

function preprocessBlocks(blocks: Block[]): Processed[] {
  const out: Processed[] = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];

    // (A) consecutive ontology_ images → carousel
    if (b.type === 'image' && isOntology(b.src)) {
      const imgs: ImageRef[] = [];
      while (
        i < blocks.length &&
        blocks[i].type === 'image' &&
        isOntology((blocks[i] as Block & { type: 'image' }).src)
      ) {
        const img = blocks[i] as Block & { type: 'image' };
        imgs.push({ src: img.src, caption: img.caption });
        i++;
      }
      out.push({ kind: 'carousel', images: imgs });
      continue;
    }

    // (B) as_is_to_be → tab switcher
    if (b.type === 'image' && isAsIsToBe(b.src)) {
      const img = b as Block & { type: 'image' };
      out.push({ kind: 'asistobe', src: img.src, caption: img.caption });
      i++;
      continue;
    }

    out.push({ kind: 'block', block: b });
    i++;
  }
  return out;
}

/* ── (A) Ontology Carousel ───────────────────────────────────── */

function OntologyCarousel({ images, activeWork }: { images: ImageRef[]; activeWork: string }) {
  const [idx, setIdx] = useState(0);
  const touchX = useRef(0);
  const cur = images[idx];
  const src = resolveAssetSrc(cur.src, activeWork);
  const prev = () => setIdx((v) => (v - 1 + images.length) % images.length);
  const next = () => setIdx((v) => (v + 1) % images.length);

  return (
    <div className="wd-carousel">
      <div
        className="wd-carousel-stage"
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const d = touchX.current - e.changedTouches[0].clientX;
          if (Math.abs(d) > 50) { d > 0 ? next() : prev(); }
        }}
      >
        <button type="button" className="wd-carousel-arrow prev" onClick={prev} aria-label="Previous">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <img src={src} alt={cur.caption ?? ''} loading="lazy" className="wd-carousel-img" />
        <button type="button" className="wd-carousel-arrow next" onClick={next} aria-label="Next">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      {cur.caption && <p className="wd-carousel-caption">{cur.caption}</p>}
      <div className="wd-carousel-dots">
        {images.map((_, di) => (
          <button
            key={di}
            type="button"
            className={`wd-dot${di === idx ? ' active' : ''}`}
            onClick={() => setIdx(di)}
            aria-label={`Slide ${di + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ── (B) As-Is / To-Be Tabs ─────────────────────────────────── */

function AsIsToBeTab({ src, caption, activeWork }: { src: string; caption?: string; activeWork: string }) {
  const [tab, setTab] = useState<'as-is' | 'to-be'>('as-is');
  const resolved = resolveAssetSrc(src, activeWork);

  return (
    <div className="wd-asistobe">
      <div className="wd-asistobe-bar">
        <button
          type="button"
          className={`wd-asistobe-btn${tab === 'as-is' ? ' active' : ''}`}
          onClick={() => setTab('as-is')}
        >AS-IS</button>
        <button
          type="button"
          className={`wd-asistobe-btn${tab === 'to-be' ? ' active' : ''}`}
          onClick={() => setTab('to-be')}
        >TO-BE</button>
      </div>
      <div className="wd-asistobe-frame">
        <img
          src={resolved}
          alt={caption ?? ''}
          loading="lazy"
          className={`wd-asistobe-img ${tab}`}
        />
      </div>
      {caption && <p className="wd-caption">{caption}</p>}
    </div>
  );
}

/* ── Block renderers ─────────────────────────────────────────── */

function renderSingleBlock(block: Block, idx: number, activeWork: string) {
  switch (block.type) {
    case 'section-title':
      return (
        <div key={idx} className="wd-section-header">
          {block.eyebrow && <div className="wd-eyebrow">{block.eyebrow}</div>}
          <h3 className="wd-title">{block.title}</h3>
          {block.desc && <p className="wd-lede">{renderBold(block.desc)}</p>}
        </div>
      );

    case 'paragraph':
      return <p key={idx} className="wd-paragraph">{renderBold(block.text)}</p>;

    case 'heading':
      return <h3 key={idx} className="wd-heading">{block.text}</h3>;

    case 'cards':
      return (
        <div key={idx} className="wd-callouts">
          {block.items.map((card, ci) => (
            <div key={ci} className="wd-callout">
              <div className="wd-callout-left">
                <span className="wd-callout-num">{String(ci + 1).padStart(2, '0')}</span>
                <span className="wd-callout-label">{card.title}</span>
              </div>
              <p className="wd-callout-body">{renderBold(card.body)}</p>
            </div>
          ))}
        </div>
      );

    case 'image': {
      const s = resolveAssetSrc(block.src, activeWork);
      return (
        <figure key={idx} className="wd-figure">
          {isVideoSrc(s)
            ? <video src={s} controls playsInline className="wd-media" />
            : <img src={s} alt={block.caption ?? ''} loading="lazy" className="wd-media" />}
          {block.caption && <figcaption className="wd-caption">{block.caption}</figcaption>}
        </figure>
      );
    }

    case 'table':
      return (
        <div key={idx} className="wd-table-wrap">
          <table className="wd-table">
            <thead><tr>{block.headers.map((h, hi) => <th key={hi}>{h}</th>)}</tr></thead>
            <tbody>{block.rows.map((row, ri) => (
              <tr key={ri}>{row.map((cell, ci) => <td key={ci}>{renderBold(cell)}</td>)}</tr>
            ))}</tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}

/* ── Main export ─────────────────────────────────────────────── */

export function WorkDetailBlocks({ blocks, activeWork }: { blocks: Block[]; activeWork: string }) {
  const processed = preprocessBlocks(blocks);
  return (
    <>
      {processed.map((item, i) => {
        switch (item.kind) {
          case 'carousel':
            return <OntologyCarousel key={`car-${i}`} images={item.images} activeWork={activeWork} />;
          case 'asistobe':
            return <AsIsToBeTab key={`tab-${i}`} src={item.src} caption={item.caption} activeWork={activeWork} />;
          default:
            return renderSingleBlock(item.block, i, activeWork);
        }
      })}
    </>
  );
}
