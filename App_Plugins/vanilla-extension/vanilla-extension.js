import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

const template = document.createElement("template");
template.innerHTML = `
  <style>
      :host {
        --accent: #4169e1;
        --accent-700: #2f4fbf;

        --space-1: 4px;
        --space-2: 8px;
        --space-3: 12px;
        --space-4: 16px;

        --card-radius: 12px;
        --input-radius: 8px;

        padding: var(--space-4);
        display: block;
        box-sizing: border-box;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        color: #D6BF68;
      }

      :host([density="compact"]) {
        --space-1: 2px;
        --space-2: 6px;
        --space-3: 8px;
        --space-4: 12px;
        --card-radius: 10px;
        --input-radius: 6px;
      }

      .grid-2 {
        display: grid;
        gap: var(--space-3);
        grid-template-columns: 1fr;
      }
      @media (min-width: 900px) {
        .grid-2 { grid-template-columns: 1fr 1fr; }
      }

      h2 {
        margin: 0 0 var(--space-2);
        font-weight: 700;
        font-size: 18px;
        letter-spacing: .2px;
        color: #CCB048;
        display: flex; align-items: center; gap: var(--space-2);
      }
      h2::before {
        content: "";
        width: 6px; height: 22px; border-radius: 999px;
        background: #0d1629;
      }
      .kicker {
        height: 3px; border-radius: 999px;
        background: linear-gradient(90deg, var(--accent), var(--accent-700));
        margin: 0 0 var(--space-3);
      }

      section {
        border: 1px solid #1f2a44;
        border-radius: var(--card-radius);
        padding: var(--space-3);
        margin: var(--space-3) 0;
        background: #0d1629;
        box-shadow: 0 1px 2px rgba(0,0,0,.15);
      }
      :host([density="compact"]) section { padding: var(--space-2); }

      section h3 {
        margin: 0 0 var(--space-2);
        font-size: 14px;
        color: #D6BF68;
      }

      input, textarea {
        width: 100%;
        padding: 8px 10px;
        border-radius: var(--input-radius);
        border: 1px solid #1f2a44;
        font-size: 13px;
        box-sizing: border-box;
        color: #D6BF68;
        background: #0a1322;
      }
      :host([density="compact"]) input,
      :host([density="compact"]) textarea { padding: 6px 8px; font-size: 12px; }

      input:focus, textarea:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 30%, transparent);
      }

      button {
        appearance: none;
        border: 1px solid #263252;
        background: #0e1a31;
        padding: 6px 10px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 700;
        margin: var(--space-2) var(--space-2) 0 0;
        color: #D6BF68;
      }
      :host([density="compact"]) button { padding: 5px 8px; margin: var(--space-1) var(--space-1) 0 0; }

      button.primary {
        background: var(--accent);
        border-color: var(--accent);
        color: #D6BF68;
      }
      button.ghost {
        background: rgba(65,105,225, .08);
        color: #D6BF68;
        border-color: rgba(65,105,225, .35);
      }

      .pill {
        display:inline-flex; align-items:center; gap:6px;
        padding: 2px 6px;
        border-radius: 999px;
        border: 1px solid #263252;
        font-size: 11px;
        margin-right: 4px;
        background: rgba(65,105,225, .06);
        color: #D6BF68;
      }
      .ok   { border-color:#14532d; background:#052e1a; color:#86efac; }
      .warn { border-color:#7c5c04; background:#2a1f03; color:#fde68a; }
      .bad  { border-color:#7c1d1d; background:#2a0b0b; color:#fecaca; }

      .serp {
        border: 1px dashed #263252;
        border-radius: 8px;
        padding: var(--space-2);
        margin-top: var(--space-2);
        background: #0a1322;
      }
      .serp .t { color: #D6BF68; font-size: 16px; margin-bottom: 2px; }
      .serp .u { color: #7eb6ff; font-size: 11px; margin-bottom: 2px; }
      .serp .d { color: #F8E5A2; font-size: 12px; }

      .vu-writeup { margin-top: var(--space-3);}
      .vu-details { padding: 0; }
      .vu-details[open] { padding: var(--space-2); background: #0d1629; border: 1px solid #1f2a44; border-radius: 10px; }
      .vu-details > summary { cursor: pointer; color: #D6BF68; }
      .vu-details:not([open]) > summary { color: #0d1629;}

      uui-box {
          background: rgba(45, 85, 205, .08);
      }
      .tab-title {
          color: #0d1629;
      }

      img {
          border-radius: 8px;
          margin: 10px;
      }

      .section-padding {
          padding: 10px;
      }
    </style>

  <uui-box>
    <h2 class="tab-title">Vanilla Content Utilities</h2>
    <div class="grid-2">
        <section>
          <div class="section-padding">
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
          </div>
        </section>
        <section>
            <img src="/App_Plugins/vanilla-extension/vanilla.jpg" alt="Vanilla JavaScript Logo" loading="lazy" />
        </section>
        <section>
          <div class="section-padding">
              <h3>Title Checker + Search Engine Results Page</h3>
              <input id="title-src" type="text" placeholder="Title tag (30–60 chars)" />
              <div><span id="title-len" class="pill">0 chars</span> <span id="title-status" class="pill">—</span></div>
              <div class="serp">
                <div class="t" id="serp-title">Your title preview</div>
                <div class="u" id="serp-url">site.com/example</div>
                <div class="d" id="serp-desc">Meta description preview goes here.</div>
              </div>
          </div>
        </section>

        <section>
          <div class="section-padding">
              <h3>Meta Description Helper</h3>
              <textarea id="desc-src" rows="3" placeholder="Meta description (~150–160 chars)…"></textarea>
              <div><span id="desc-len" class="pill">0 chars</span> <span id="desc-status" class="pill">—</span></div>
              <button id="btn-desc-copy">Copy</button>
          </div>
        </section>

        <section>
          <div class="section-padding">
              <h3>Slug Generator</h3>
              <input id="slug-src" type="text" placeholder="Type a title…" />
              <button id="btn-slug">Slugify</button>
              <button id="btn-slug-copy">Copy</button>
              <div>Slug: <span id="slug-out">—</span></div>
          </div>
        </section>

        <section>
          <div class="section-padding">
              <h3>Text Cleanup</h3>
              <textarea id="clean-src" rows="3" placeholder="Paste text to sanitize…"></textarea>
              <button data-clean="quotes">Straighten quotes</button>
              <button data-clean="emoji">Strip emoji</button>
              <button data-clean="spaces">Collapse spaces</button>
              <button class="ghost" id="btn-clean-copy">Copy</button>
              <div>Output: <span id="clean-out">—</span></div>
          </div>
        </section>
     </div>
    <div class="vu-writeup">
        <details class="vu-details" open>
            <summary> What I learned, how I used Vanilla JS, and how to use these tools</summary>
            <div class="section-padding">
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
                    <h3>Learn More</h3>
                    <ul>
                        <li><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">MDN Web Docs – JavaScript</a></li>
                        <li><a href="https://our.umbraco.com/Documentation/Extending/Backoffice/" target="_blank">Umbraco – Backoffice Extensions</a></li>
                        <li><a href="https://javascript.info/" target="_blank">The Modern JavaScript Tutorial</a></li>
                    </ul>
                </div>
            </div>
        </details>
    </div>
  </uui-box>
`;

export default class VanillaElement extends UmbElementMixin(HTMLElement) {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        super.connectedCallback?.();

        if (!this.hasAttribute('density')) this.setAttribute('density', 'compact');
        const $ = (id) => this.shadowRoot.getElementById(id);
        const copyText = async (txt) => { try { await navigator.clipboard.writeText(txt); } catch (_) { } };

        const slugify = (str) => str.normalize('NFD').replace(/\p{Diacritic}+/gu, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
        const slugSrc = $("slug-src"), slugOut = $("slug-out");
        $("btn-slug").addEventListener("click", () => slugOut.textContent = slugify(slugSrc.value) || "—");
        $("btn-slug-copy").addEventListener("click", () => copyText(slugOut.textContent));

        const titleSrc = $("title-src"), titleLen = $("title-len"), titleStatus = $("title-status"), serpTitle = $("serp-title"), serpUrl = $("serp-url"), serpDesc = $("serp-desc");
        const clamp = (el, s) => { el.classList.remove('ok', 'warn', 'bad'); if (s) el.classList.add(s) };
        const updateTitle = () => { const t = titleSrc.value.trim(), len = t.length; titleLen.textContent = `${len} chars`; serpTitle.textContent = t || 'Your title preview'; let st = 'warn', txt = 'Aim 30–60'; if (len === 0) { st = 'bad'; txt = 'Empty' } else if (len < 30) { st = 'warn'; txt = 'Short' } else if (len <= 60) { st = 'ok'; txt = 'Good' } else if (len <= 70) { st = 'warn'; txt = 'Long' } else { st = 'bad'; txt = 'Too long' }; titleStatus.textContent = txt; clamp(titleLen, st); clamp(titleStatus, st); serpUrl.textContent = location.origin + '/' + (slugOut.textContent === '—' ? 'example' : slugOut.textContent) };
        titleSrc.addEventListener('input', updateTitle); updateTitle();

        const descSrc = $("desc-src"), descLen = $("desc-len"), descStatus = $("desc-status");
        const updateDesc = () => { const d = descSrc.value.trim(), len = d.length; descLen.textContent = `${len} chars`; serpDesc.textContent = d || 'Meta description preview goes here.'; let st = 'warn', txt = 'Aim ~150–160'; if (len === 0) { st = 'bad'; txt = 'Empty' } else if (len < 120) { st = 'warn'; txt = 'Short' } else if (len <= 165) { st = 'ok'; txt = 'Good' } else if (len <= 180) { st = 'warn'; txt = 'Long' } else { st = 'bad'; txt = 'Too long' }; descStatus.textContent = txt; clamp(descLen, st); clamp(descStatus, st) };
        descSrc.addEventListener('input', updateDesc); updateDesc();
        $("btn-desc-copy").addEventListener('click', () => copyText(descSrc.value.trim()));

        const utm = { base: $("utm-base"), source: $("utm-source"), medium: $("utm-medium"), campaign: $("utm-campaign"), term: $("utm-term"), content: $("utm-content") };
        const utmOut = $("utm-out");
        $("btn-utm-build").addEventListener('click', () => { try { const base = new URL(utm.base.value); const p = base.searchParams; const add = (k, v) => { if (v) p.set(k, v.toString().trim()) }; add('utm_source', utm.source.value); add('utm_medium', utm.medium.value); add('utm_campaign', utm.campaign.value); add('utm_term', utm.term.value); add('utm_content', utm.content.value); utmOut.textContent = base.toString() } catch { utmOut.textContent = 'Invalid base URL' } });
        $("btn-utm-copy").addEventListener('click', () => copyText(utmOut.textContent));

        const cleanSrc = $("clean-src"), cleanOut = $("clean-out");
        const renderClean = (t) => cleanOut.textContent = t || '—';
        const cleanOps = { quotes: (t) => t.replace(/[\u2018\u2019\u201A\u201B]/g, "'").replace(/[\u201C\u201D\u201E\u201F]/g, '"'), emoji: (t) => t.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, ''), spaces: (t) => t.replace(/\s+/g, ' ').trim() };
        this.shadowRoot.querySelectorAll('[data-clean]').forEach(btn => btn.addEventListener('click', () => { const op = btn.getAttribute('data-clean'); renderClean(cleanOps[op] ? cleanOps[op](cleanSrc.value) : cleanSrc.value) }));
        $("btn-clean-copy").addEventListener('click', () => copyText(cleanOut.textContent));
    }
}

customElements.define("vanilla-extension", VanillaElement);
