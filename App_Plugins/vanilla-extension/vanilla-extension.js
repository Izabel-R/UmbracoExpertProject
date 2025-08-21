import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host {
      padding: 20px;
      display: block;
      box-sizing: border-box;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
      color: #111827;
    }
    .grid-2 {
      display: grid;
      gap: 16px;
      grid-template-columns: 1fr; /* 1 column by default */
    }
    @media (min-width: 900px) {
      .grid-2 {
        grid-template-columns: 1fr 1fr; /* 2 columns on wider screens */
      }
    }
    h2 { margin: 0 0 8px; }
    section { border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px; margin: 16px 0; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.03); }
    section h3 { margin: 0 0 8px; font-size: 16px; }
    input, textarea { width: 100%; padding: 10px 12px; border-radius: 10px; border: 1px solid #e5e7eb; font-size: 14px; box-sizing: border-box; }
    button { appearance: none; border: 1px solid #e5e7eb; background: #fff; padding: 8px 12px; border-radius: 10px; cursor: pointer; font-weight: 600; margin: 4px 4px 4px 0; }
    button.primary { background: #2152ff; border-color: #2152ff; color: #fff; }
    button.ghost { background: transparent; }
    .pill { display:inline-flex;align-items:center;gap:6px;padding:4px 8px;border-radius:999px;border:1px solid #e5e7eb;font-size:12px; margin-right:4px; }
    .ok{border-color:#bbf7d0;background:#ecfdf5;color:#059669}
    .warn{border-color:#fde68a;background:#fffbeb;color:#d97706}
    .bad{border-color:#fecaca;background:#fef2f2;color:#dc2626}
    .serp { border:1px dashed #e5e7eb; border-radius: 10px; padding: 12px; margin-top: 8px; background:#fafafa; }
    .serp .t { color:#1a0dab; font-size:18px; margin-bottom:4px; word-break: break-word; }
    .serp .u { color:#006621; font-size:12px; margin-bottom:4px; word-break: break-all; }
    .serp .d { color:#545454; font-size:13px; }
  </style>

  <uui-box>
    <h2>Vanilla Content Utilities</h2>
    <div class="grid-2">
        <section>
          <h3>Slug Generator</h3>
          <input id="slug-src" type="text" placeholder="Type a title…" />
          <button id="btn-slug">Slugify</button>
          <button id="btn-slug-copy">Copy</button>
          <div>Slug: <span id="slug-out">—</span></div>
        </section>

        <section>
          <h3>Title Checker + Search Engine Results Page</h3>
          <input id="title-src" type="text" placeholder="Title tag (30–60 chars)" />
          <div><span id="title-len" class="pill">0 chars</span> <span id="title-status" class="pill">—</span></div>
          <div class="serp">
            <div class="t" id="serp-title">Your title preview</div>
            <div class="u" id="serp-url">site.com/example</div>
            <div class="d" id="serp-desc">Meta description preview goes here.</div>
          </div>
        </section>

        <section>
          <h3>Meta Description Helper</h3>
          <textarea id="desc-src" rows="3" placeholder="Meta description (~150–160 chars)…"></textarea>
          <div><span id="desc-len" class="pill">0 chars</span> <span id="desc-status" class="pill">—</span></div>
          <button id="btn-desc-copy">Copy</button>
        </section>

        <section>
          <h3>Text Cleanup</h3>
          <textarea id="clean-src" rows="3" placeholder="Paste text to sanitize…"></textarea>
          <button data-clean="quotes">Straighten quotes</button>
          <button data-clean="emoji">Strip emoji</button>
          <button data-clean="spaces">Collapse spaces</button>
          <button class="ghost" id="btn-clean-copy">Copy</button>
          <div>Output: <span id="clean-out">—</span></div>
        </section>

        <section>
          <h3>Urchin Tracking Module Builder</h3>
          <input id="utm-base" type="url" placeholder="Base URL" />
          <input id="utm-source" type="text" placeholder="utm_source" />
          <input id="utm-medium" type="text" placeholder="utm_medium" />
          <input id="utm-campaign" type="text" placeholder="utm_campaign" />
          <input id="utm-term" type="text" placeholder="utm_term" />
          <input id="utm-content" type="text" placeholder="utm_content" />
          <button class="primary" id="btn-utm-build">Build URL</button>
          <button class="ghost" id="btn-utm-copy">Copy</button>
          <div>Result: <span id="utm-out">—</span></div>
        </section>

    </div>
  </uui-box>
  <div class="vu-writeup" style="margin-top:24px">
    <details class="vu-details" open>
        <summary>What I learned, how I used Vanilla JS, and how to use these tools</summary>
        <div style="margin-top:12px">
            <h2>What I Learned About Vanilla JS in Umbraco</h2>
            <p>Building this without frameworks sharpened my understanding of the DOM API, event handling, and Unicode-safe string manipulation. It also taught me how to align custom UI with Umbraco’s backoffice look and keep the payload tiny.</p>
            <h3>How I Used Vanilla in This Project</h3>
            <ul>
                <li><strong>Slug Generator:</strong> normalization (NFD) + regex for clean, URL‑safe slugs.</li>
                <li><strong>Search Engine Results Page Preview:</strong> dynamic length feedback and preview of titles/descriptions.</li>
                <li><strong>Meta Helper:</strong> live character guidance for editor friendliness.</li>
                <li><strong>Text Cleanup:</strong> quote straightening, emoji stripping, whitespace normalization.</li>
                <li><strong>Urchin Tracking Module Builder:</strong> URL API for safe parameter assembly.</li>
            </ul>
            <h3>How to Use the Tools</h3>
            <ol>
                <li>Add a container <code>&lt;div id="vanilla-utilities"&gt;&lt;/div&gt;</code> in your dashboard view.</li>
                <li>Load this script and call <code>window.VanillaUtilities.init(container)</code>.</li>
                <li>Editors can generate slugs, validate titles/descriptions, build UTM links, and sanitize text directly in the backoffice.</li>
            </ol>
            <h3>Learn More</h3>
            <ul>
                <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">MDN Web Docs – JavaScript</a></li>
                <li><a href="https://our.umbraco.com/Documentation/Extending/Backoffice/" target="_blank">Umbraco – Backoffice Extensions</a></li>
                <li><a href="https://javascript.info/" target="_blank">The Modern JavaScript Tutorial</a></li>
            </ul>
        </div>
    </details>
  </div>
`;

export default class VanillaElement extends UmbElementMixin(HTMLElement) {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        const $ = (id) => this.shadowRoot.getElementById(id);
        const copyText = async (txt) => { try { await navigator.clipboard.writeText(txt); } catch (_) { } };

        // Slugify
        const slugify = (str) => str.normalize('NFD').replace(/\p{Diacritic}+/gu, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
        const slugSrc = $("slug-src"), slugOut = $("slug-out");
        $("btn-slug").addEventListener("click", () => slugOut.textContent = slugify(slugSrc.value) || "—");
        $("btn-slug-copy").addEventListener("click", () => copyText(slugOut.textContent));

        // Title Checker
        const titleSrc = $("title-src"), titleLen = $("title-len"), titleStatus = $("title-status"), serpTitle = $("serp-title"), serpUrl = $("serp-url"), serpDesc = $("serp-desc");
        const clamp = (el, s) => { el.classList.remove('ok', 'warn', 'bad'); if (s) el.classList.add(s) };
        const updateTitle = () => { const t = titleSrc.value.trim(), len = t.length; titleLen.textContent = `${len} chars`; serpTitle.textContent = t || 'Your title preview'; let st = 'warn', txt = 'Aim 30–60'; if (len === 0) { st = 'bad'; txt = 'Empty' } else if (len < 30) { st = 'warn'; txt = 'Short' } else if (len <= 60) { st = 'ok'; txt = 'Good' } else if (len <= 70) { st = 'warn'; txt = 'Long' } else { st = 'bad'; txt = 'Too long' }; titleStatus.textContent = txt; clamp(titleLen, st); clamp(titleStatus, st); serpUrl.textContent = location.origin + '/' + (slugOut.textContent === '—' ? 'example' : slugOut.textContent) };
        titleSrc.addEventListener('input', updateTitle); updateTitle();

        // Description
        const descSrc = $("desc-src"), descLen = $("desc-len"), descStatus = $("desc-status");
        const updateDesc = () => { const d = descSrc.value.trim(), len = d.length; descLen.textContent = `${len} chars`; serpDesc.textContent = d || 'Meta description preview goes here.'; let st = 'warn', txt = 'Aim ~150–160'; if (len === 0) { st = 'bad'; txt = 'Empty' } else if (len < 120) { st = 'warn'; txt = 'Short' } else if (len <= 165) { st = 'ok'; txt = 'Good' } else if (len <= 180) { st = 'warn'; txt = 'Long' } else { st = 'bad'; txt = 'Too long' }; descStatus.textContent = txt; clamp(descLen, st); clamp(descStatus, st) };
        descSrc.addEventListener('input', updateDesc); updateDesc();
        $("btn-desc-copy").addEventListener('click', () => copyText(descSrc.value.trim()));

        // UTM Builder
        const utm = { base: $("utm-base"), source: $("utm-source"), medium: $("utm-medium"), campaign: $("utm-campaign"), term: $("utm-term"), content: $("utm-content") };
        const utmOut = $("utm-out");
        $("btn-utm-build").addEventListener('click', () => { try { const base = new URL(utm.base.value); const p = base.searchParams; const add = (k, v) => { if (v) p.set(k, v.toString().trim()) }; add('utm_source', utm.source.value); add('utm_medium', utm.medium.value); add('utm_campaign', utm.campaign.value); add('utm_term', utm.term.value); add('utm_content', utm.content.value); utmOut.textContent = base.toString() } catch { utmOut.textContent = 'Invalid base URL' } });
        $("btn-utm-copy").addEventListener('click', () => copyText(utmOut.textContent));

        // Text Cleanup
        const cleanSrc = $("clean-src"), cleanOut = $("clean-out");
        const renderClean = (t) => cleanOut.textContent = t || '—';
        const cleanOps = { quotes: (t) => t.replace(/[\u2018\u2019\u201A\u201B]/g, "'").replace(/[\u201C\u201D\u201E\u201F]/g, '"'), emoji: (t) => t.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, ''), spaces: (t) => t.replace(/\s+/g, ' ').trim() };
        this.shadowRoot.querySelectorAll('[data-clean]').forEach(btn => btn.addEventListener('click', () => { const op = btn.getAttribute('data-clean'); renderClean(cleanOps[op] ? cleanOps[op](cleanSrc.value) : cleanSrc.value) }));
        $("btn-clean-copy").addEventListener('click', () => copyText(cleanOut.textContent));
    }
}

customElements.define("vanilla-extension", VanillaElement);
