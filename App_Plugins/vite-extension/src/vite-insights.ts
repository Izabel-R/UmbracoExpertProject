import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { repeat } from "lit/directives/repeat.js";

const assetModules = import.meta.glob<{ default: string }>("./assets/*.svg", { eager: true });
const logos: Record<string, string> = Object.fromEntries(
    Object.entries(assetModules).map(([k, mod]) => [k.split("/").pop()!, mod.default])
);

type Theme = "light" | "dark";
type Palette = "default" | "pastel-pink" | "ocean-teal";

type Tool = {
    id: string;
    title: string;
    subtitle: string;
    link: string;
    logo?: string;
    emoji?: string;
    repo?: { owner: string; name: string };
};

@customElement("my-element")
export default class MyElement extends LitElement {
    @property({ reflect: true }) theme: Theme = (localStorage.getItem("ts_theme") as Theme) || "light";
    @property({ reflect: true }) palette: Palette = (localStorage.getItem("ts_palette") as Palette) || "default";

    @state() private filter = "";
    @state() private clicks = 0;
    @state() private formattedTime: string | null = null;
    @state() private buildMode = import.meta.env.MODE;
    @state() private stars: Partial<Record<string, number>> = {};
    @state() private loadingStars = false;
    @state() private loadError: string | null = null;

    @query("#filter") private filterInput!: HTMLInputElement;

    private tools: readonly Tool[] = [
        {
            id: "vite",
            title: "Vite",
            subtitle: "Lightning-fast dev + build",
            logo: logos["vite.svg"] ?? "/App_Plugins/vite-extension/src/assets/vite.svg",
            link: "https://vitejs.dev/",
            repo: { owner: "vitejs", name: "vite" },
        },
        {
            id: "lit",
            title: "Lit",
            subtitle: "Declarative, reactive web components",
            logo: logos["lit.svg"] ?? "/App_Plugins/vite-extension/src/assets/lit.svg",
            link: "https://lit.dev/",
            repo: { owner: "lit", name: "lit" },
        },
        {
            id: "ts",
            title: "TypeScript",
            subtitle: "Types for safer JS",
            logo: logos["ts.svg"] ?? "/App_Plugins/vite-extension/src/assets/ts.svg",
            link: "https://www.typescriptlang.org/",
            repo: { owner: "microsoft", name: "TypeScript" },
        },
    ] as const;

    @state() private ccFg = "#111827";
    @state() private ccBg = "#ffffff";
    @state() private ccLarge = false;

    @state() private ogTitle = "";
    @state() private ogDesc = "";
    @state() private ogSite = "";
    @state() private ogImage = "";

    @state() private jsonldInput = "";
    @state() private jsonldError: string | null = null;
    @state() private jsonldType: string | null = null;

    @state() private robotsText = "";
    @state() private robotsPath = "/";

    @state() private sitemapXml = "";
    @state() private sitemapCount = 0;
    @state() private sitemapDupes: string[] = [];

    @state() private headersText = "";
    @state() private headerFindings: string[] = [];

    @state() private fav16: string | null = null;
    @state() private fav32: string | null = null;
    @state() private fav180: string | null = null;

    connectedCallback(): void {
        super.connectedCallback();
        localStorage.setItem("ts_theme", this.theme);
        localStorage.setItem("ts_palette", this.palette);
    }

    render() {
        const headerClasses = classMap({ header: true, dark: this.theme === "dark" });

        const visibleCore = this.tools.filter(
            (t) =>
                !this.filter.trim() ||
                t.title.toLowerCase().includes(this.filter.toLowerCase()) ||
                t.subtitle.toLowerCase().includes(this.filter.toLowerCase())
        );

        const ratio = this.#contrastRatio(this.ccFg, this.ccBg);
        const aa = this.ccLarge ? ratio >= 3 : ratio >= 4.5;
        const aaa = this.ccLarge ? ratio >= 4.5 : ratio >= 7;

        return html`
      <section class="wrap">
        <header class=${headerClasses}>
          <slot name="header">
            <h2>Tools</h2>
            <p class="muted">Vite + Lit + TypeScript • mode: <strong>${this.buildMode}</strong></p>
          </slot>
        </header>

        <div class="toolbar">
          <button @click=${this.#toggleTheme} class="pill" aria-label="Toggle theme">
            ${this.theme === "dark" ? "Dark" : "Light"}
          </button>

          <div class="search">
            <input
              id="filter"
              type="search"
              placeholder="Filter tools…"
              @input=${this.#onFilter}
              .value=${this.filter}
            />
            <button class="ghost" @click=${this.#clearFilter} ?disabled=${!this.filter}>Clear</button>
          </div>

          <label class="palette">
            <span class="muted">Palette</span>
            <select @change=${this.#onPaletteChange} .value=${this.palette} aria-label="Color palette">
              <option value="default">Default</option>
              <option value="pastel-pink">Pastel Pink</option>
              <option value="ocean-teal">Ocean Teal</option>
            </select>
          </label>

          <button class="solid" @click=${this.#increment}>Clicked ${this.clicks} ×</button>
          <button class="outline" @click=${this.#loadTime}>
            ${this.formattedTime ? `Time: ${this.formattedTime}` : "Load time"}
          </button>
          <button
            class="accent"
            @click=${this.#loadStars}
            ?disabled=${this.loadingStars}
            aria-busy=${this.loadingStars}
            title="Fetch GitHub stars for the Dev Stack tools"
          >
            ${this.loadingStars ? "Loading…" : "Load GitHub stars"}
          </button>
        </div>

        ${import.meta.env.DEV
                ? html`
              <div class="dev">
                <strong>DEV</strong>
                <code>import.meta.env.MODE = ${this.buildMode}</code>
              </div>
            `
                : nothing}

        <h3 class="section-title">Developer Stack</h3>
        <div class="grid" @keydown=${this.#onGridKeydown}>
          ${repeat(
                    visibleCore,
                    (t) => t.id,
                    (t, i) => html`
              <article class="card" tabindex="0" data-index=${i} @click=${() => this.#open(t.link)}>
                ${t.logo
                            ? html`<img src=${t.logo} alt="${t.title} logo" width="40" height="40" loading="lazy" />`
                            : html`<div class="emoji" aria-hidden="true">🧰</div>`}
                <div class="card-body">
                  <h3>${t.title}</h3>
                  <p class="muted">${t.subtitle}</p>
                </div>
                ${this.stars[t.id] !== undefined
                            ? html`<span class="badge" title="GitHub stars">⭐ ${this.stars[t.id]}</span>`
                            : nothing}
                <a class="cta" href=${t.link} target="_blank" rel="noopener noreferrer" @click=${(e: Event) => e.stopPropagation()}>
                  Learn more →
                </a>
              </article>
            `
                )}
          ${visibleCore.length === 0 ? html`<p class="muted">No results. Try another filter.</p>` : nothing}
        </div>

        <h3 class="section-title">Project Utilities</h3>

        <details class="tool" open>
          <summary> Contrast Checker</summary>
          <div class="tool-body">
            <p class="help">Enter text and background colors to see if they meet WCAG readability standards.</p>
            <div class="row">
              <label>Foreground <input type="color" .value=${this.ccFg} @input=${(e: any) => (this.ccFg = e.target.value)} /></label>
              <label>Background <input type="color" .value=${this.ccBg} @input=${(e: any) => (this.ccBg = e.target.value)} /></label>
            </div>
            <div class="contrast-preview" style=${this.#style({ color: this.ccFg, background: this.ccBg })}>
              <div class="preview-text" style=${this.#style({ fontSize: this.ccLarge ? "24px" : "16px", fontWeight: this.ccLarge ? "700" : "400" })}>
                The quick brown fox jumps over the lazy dog.
              </div>
            </div>
            <div class="pillbar">
              <span class=${classMap({ pill: true, pass: aa, fail: !aa })}>AA ${aa ? "Pass" : "Fail"}</span>
              <span class=${classMap({ pill: true, pass: aaa, fail: !aaa })}>AAA ${aaa ? "Pass" : "Fail"}</span>
              <span class="pill">Ratio: ${ratio.toFixed(2)}:1</span>
            </div>
          </div>
        </details>

        <details class="tool">
          <summary>Open Graph / Twitter Card Builder</summary>
          <div class="tool-body">
            <p class="help">Create and preview the image, title, and description that show when your page is shared.</p>
            <div class="row">
              <label>Title <input type="text" .value=${this.ogTitle} @input=${(e: any) => (this.ogTitle = e.target.value)} /></label>
              <label>Description <input type="text" .value=${this.ogDesc} @input=${(e: any) => (this.ogDesc = e.target.value)} /></label>
              <label>Site / URL <input type="url" .value=${this.ogSite} @input=${(e: any) => (this.ogSite = e.target.value)} /></label>
              <label>Image URL <input type="url" .value=${this.ogImage} @input=${(e: any) => (this.ogImage = e.target.value)} /></label>
            </div>
            <div class="og-preview">
              ${this.ogImage ? html`<img src=${this.ogImage} alt="" />` : html`<div class="img-placeholder">No image</div>`}
              <div class="og-meta">
                <div class="og-site">${this.#domain(this.ogSite) || "example.com"}</div>
                <div class="og-title">${this.ogTitle || "Preview title"}</div>
                <div class="og-desc">${this.ogDesc || "Preview description appears here."}</div>
              </div>
            </div>
            <textarea class="code" readonly>${this.#ogSnippet()}</textarea>
            <button class="solid" @click=${() => this.#copy(this.#ogSnippet())}>Copy meta tags</button>
          </div>
        </details>

        <details class="tool">
          <summary> JavaScript Object Notation for Linked Data Validator</summary>
          <div class="tool-body">
            <p class="help">Paste JSON-LD to check it’s valid and includes the right <code>@context</code> and <code>@type</code>.</p>
            <textarea class="mono" rows="6" placeholder='{"@context":"https://schema.org","@type":"Organization","name":"Acme"}'
              .value=${this.jsonldInput} @input=${(e: any) => (this.jsonldInput = e.target.value)}></textarea>
            ${this.#renderJsonldStatus()}
            <div class="row">
              <button class="outline" @click=${this.#formatJsonld}>Prettify</button>
              <button class="solid" @click=${this.#validateJsonld}>Validate</button>
            </div>
          </div>
        </details>

        <details class="tool">
          <summary> robots.txt Tester</summary>
          <div class="tool-body">
            <p class="help">Paste your <code>robots.txt</code> and test a path to see if search engines can crawl it.</p>
            <textarea class="mono" rows="6" placeholder="User-agent: *&#10;Disallow: /admin&#10;Disallow: /tmp"
              .value=${this.robotsText} @input=${(e: any) => (this.robotsText = e.target.value)}></textarea>
            <div class="row">
              <label>Test path <input type="text" placeholder="/some/path" .value=${this.robotsPath} @input=${(e: any) => (this.robotsPath = e.target.value)} /></label>
              ${this.robotsPath
                ? html`<span class="pill ${this.#robotsAllowed(this.robotsText, this.robotsPath) ? "pass" : "fail"}">
                      ${this.#robotsAllowed(this.robotsText, this.robotsPath) ? "Allowed" : "Blocked"}
                    </span>`
                : nothing}
            </div>
            <p class="muted small">Simple tester for <code>User-agent: *</code> with <code>Disallow</code> rules (prefix match).</p>
          </div>
        </details>

        <details class="tool">
          <summary> Sitemap Validator</summary>
          <div class="tool-body">
            <p class="help">Paste your XML sitemap to count URLs and catch duplicate <code>&lt;loc&gt;</code> entries.</p>
            <textarea class="mono" rows="6" placeholder="<urlset>... your XML ...</urlset>"
              .value=${this.sitemapXml} @input=${(e: any) => (this.sitemapXml = e.target.value)}></textarea>
            <div class="row">
              <button class="solid" @click=${this.#validateSitemap}>Validate</button>
              <span class="pill">URLs: ${this.sitemapCount}</span>
            </div>
            ${this.sitemapDupes.length
                ? html`<details class="dupes"><summary>Duplicate <code>&lt;loc&gt;</code> (${this.sitemapDupes.length})</summary>
                     <ul>${this.sitemapDupes.map((d) => html`<li>${d}</li>`)}</ul></details>`
                : nothing}
          </div>
        </details>

        <details class="tool">
          <summary> Security Headers & CSP Linter</summary>
          <div class="tool-body">
            <p class="help">Paste response headers to see common issues (HSTS, X-Frame-Options, CSP, etc.).</p>
            <textarea class="mono" rows="8" placeholder="Content-Security-Policy: default-src 'self'; ...&#10;Strict-Transport-Security: max-age=63072000; includeSubDomains; preload&#10;..."
              .value=${this.headersText} @input=${(e: any) => (this.headersText = e.target.value)}></textarea>
            <div class="row">
              <button class="solid" @click=${this.#lintHeaders}>Analyze</button>
            </div>
            ${this.headerFindings.length
                ? html`<ul class="findings">${this.headerFindings.map((f) => html`<li>${f}</li>`)}</ul>`
                : nothing}
          </div>
        </details>

        <details class="tool">
          <summary> Favicon Generator (PNG)</summary>
          <div class="tool-body">
            <p class="help">Upload a square logo to download standard icons and copy the HTML link tags.</p>
            <p class="muted small">Upload a square PNG/SVG. We’ll produce 16×16, 32×32, 180×180 PNGs and a copy-paste snippet.</p>
            <input type="file" accept="image/png,image/svg+xml" @change=${this.#onFaviconFile} />
            <div class="row thumbs">
              ${this.fav16 ? html`<a class="thumb" download="favicon-16.png" href=${this.fav16}><img src=${this.fav16} alt="" /><span>16×16</span></a>` : nothing}
              ${this.fav32 ? html`<a class="thumb" download="favicon-32.png" href=${this.fav32}><img src=${this.fav32} alt="" /><span>32×32</span></a>` : nothing}
              ${this.fav180 ? html`<a class="thumb" download="apple-touch-icon.png" href=${this.fav180}><img src=${this.fav180} alt="" /><span>180×180</span></a>` : nothing}
            </div>
            ${this.fav16 || this.fav32 || this.fav180
                ? html`<textarea class="code" readonly>${this.#faviconSnippet()}</textarea>
                     <button class="outline" @click=${() => this.#copy(this.#faviconSnippet())}>Copy HTML links</button>`
                : nothing}
          </div>
        </details>

        ${this.loadError ? html`<p role="alert" class="error">${this.loadError}</p>` : nothing}

        <footer class="footer">
          <slot name="footer"></slot>
        </footer>
      </section>
    `;
    }


    #onFilter = () => {
        this.filter = this.filterInput.value;
        const ev = new FilterChangedEvent(this.filter);
        this.dispatchEvent(ev);
    };

    #clearFilter = () => {
        this.filter = "";
        this.filterInput.focus();
        const ev = new FilterChangedEvent(this.filter);
        this.dispatchEvent(ev);
    };

    #increment = () => { this.clicks++; };

    async #loadTime() {
        const { formatTime } = await import("./utils/time-format.ts");
        this.formattedTime = formatTime(new Date());
    }

    async #loadStars() {
        try {
            this.loadingStars = true;
            this.loadError = null;
            const requests = this.tools
                .filter((t) => t.repo)
                .map(async (t) => {
                    const url = `https://api.github.com/repos/${t.repo!.owner}/${t.repo!.name}`;
                    const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
                    if (!res.ok) throw new Error(`${t.title}: ${res.status}`);
                    const data = (await res.json()) as { stargazers_count: number };
                    return [t.id, data.stargazers_count] as const;
                });
            const entries = await Promise.all(requests);
            this.stars = Object.fromEntries(entries);
        } catch (err: any) {
            this.loadError = err?.message ?? String(err);
        } finally {
            this.loadingStars = false;
        }
    }

    #toggleTheme = () => {
        this.theme = this.theme === "dark" ? "light" : "dark";
        localStorage.setItem("ts_theme", this.theme);
    };

    #onPaletteChange = (e: Event) => {
        const next = (e.target as HTMLSelectElement).value as Palette;
        this.palette = next;
        localStorage.setItem("ts_palette", next);
    };

    #onGridKeydown = (e: KeyboardEvent) => {
        const grid = e.currentTarget as HTMLElement;
        const cards = Array.from(grid.querySelectorAll<HTMLElement>(".card"));
        const target = e.composedPath()[0] as HTMLElement;
        const current = target.closest(".card") as HTMLElement | null;
        if (!current) return;
        const idx = cards.indexOf(current);
        if (idx === -1) return;
        const cols = this.#computeCols(grid);
        const focusIndex = (i: number) => cards[i]?.focus();

        switch (e.key) {
            case "ArrowRight": e.preventDefault(); focusIndex(Math.min(cards.length - 1, idx + 1)); break;
            case "ArrowLeft": e.preventDefault(); focusIndex(Math.max(0, idx - 1)); break;
            case "ArrowDown": e.preventDefault(); focusIndex(Math.min(cards.length - 1, idx + cols)); break;
            case "ArrowUp": e.preventDefault(); focusIndex(Math.max(0, idx - cols)); break;
            case "Enter":
            case " ":
                e.preventDefault();
                (cards[idx].querySelector(".cta") as HTMLAnchorElement)?.click();
                break;
        }
    };

    #computeCols(grid: HTMLElement) {
        const style = getComputedStyle(grid);
        const template = style.gridTemplateColumns || "";
        const cols = template.split(" ").filter(Boolean).length;
        return Math.max(1, cols);
    }

    async #copy(text: string) {
        try { await navigator.clipboard.writeText(text); } catch { }
    }

    #contrastRatio(fg: string, bg: string) {
        const l1 = this.#relLum(this.#hexToRgb(fg));
        const l2 = this.#relLum(this.#hexToRgb(bg));
        const [L1, L2] = l1 > l2 ? [l1, l2] : [l2, l1];
        return (L1 + 0.05) / (L2 + 0.05);
    }
    #hexToRgb(hex: string) {
        const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        const to = (x: string) => parseInt(x, 16) / 255;
        return m ? [to(m[1]), to(m[2]), to(m[3])] : [0, 0, 0];
    }
    #relLum([r, g, b]: number[]) {
        const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
        const [R, G, B] = [lin(r), lin(g), lin(b)];
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    }

    #domain(u: string) {
        try { return new URL(u).host; } catch { return ""; }
    }
    #ogSnippet() {
        const t = this.ogTitle || "";
        const d = this.ogDesc || "";
        const u = this.ogSite || "";
        const img = this.ogImage || "";
        return [
            `<meta property="og:title" content="${this.#esc(t)}">`,
            `<meta property="og:description" content="${this.#esc(d)}">`,
            u ? `<meta property="og:url" content="${this.#esc(u)}">` : "",
            img ? `<meta property="og:image" content="${this.#esc(img)}">` : "",
            `<meta name="twitter:card" content="${img ? "summary_large_image" : "summary"}">`,
            `<meta name="twitter:title" content="${this.#esc(t)}">`,
            `<meta name="twitter:description" content="${this.#esc(d)}">`,
            img ? `<meta name="twitter:image" content="${this.#esc(img)}">` : "",
        ].filter(Boolean).join("\n");
    }
    #esc(s: string) { return s.replaceAll(`"`, "&quot;"); }
    #style(obj: Record<string, string>) {
        return Object.entries(obj).map(([k, v]) => `${k}:${v}`).join(";");
    }

    #validateJsonld = () => {
        this.jsonldError = null;
        this.jsonldType = null;
        try {
            const obj = JSON.parse(this.jsonldInput);
            const type = Array.isArray(obj["@type"]) ? obj["@type"].join(", ") : obj["@type"];
            if (!obj["@context"]) throw new Error("Missing @context (expected https://schema.org).");
            if (!obj["@type"]) throw new Error("Missing @type.");
            this.jsonldType = typeof type === "string" ? type : String(type);
        } catch (e: any) {
            this.jsonldError = e?.message ?? String(e);
        }
    };
    #formatJsonld = () => {
        try {
            const obj = JSON.parse(this.jsonldInput);
            this.jsonldInput = JSON.stringify(obj, null, 2);
            this.jsonldError = null;
        } catch (e: any) {
            this.jsonldError = "JSON parse error – can’t format.";
        }
    };
    #renderJsonldStatus() {
        if (this.jsonldError) return html`<p class="error">${this.jsonldError}</p>`;
        if (this.jsonldType) return html`<p class="ok">Valid JSON-LD • <strong>@type:</strong> ${this.jsonldType}</p>`;
        return html`<p class="muted small">Paste JSON-LD and click <strong>Validate</strong>.</p>`;
    }

    #robotsAllowed(text: string, path: string) {
        const lines = text.split(/\r?\n/).map((l) => l.trim());
        let inStar = false;
        const dis: string[] = [];
        for (const line of lines) {
            if (!line || line.startsWith("#")) continue;
            const [kRaw, vRaw] = line.split(":");
            const k = (kRaw || "").toLowerCase().trim();
            const v = (vRaw || "").trim();
            if (k === "user-agent") inStar = v === "*" ? true : false;
            if (inStar && k === "disallow") dis.push(v);
            if (k === "user-agent" && v !== "*") inStar = false;
        }
        if (dis.some((d) => d === "")) return true;
        return !dis.some((d) => d && path.startsWith(d));
    }

    #validateSitemap = () => {
        this.sitemapCount = 0;
        this.sitemapDupes = [];
        try {
            const doc = new DOMParser().parseFromString(this.sitemapXml, "application/xml");
            const parserErr = doc.querySelector("parsererror");
            if (parserErr) throw new Error("Invalid XML.");
            const locs = Array.from(doc.getElementsByTagName("loc")).map((n) => (n.textContent || "").trim());
            const seen = new Set<string>();
            const dupes: string[] = [];
            for (const l of locs) {
                if (seen.has(l)) dupes.push(l);
                else seen.add(l);
            }
            this.sitemapCount = locs.length;
            this.sitemapDupes = dupes;
        } catch (e: any) {
            this.sitemapCount = 0;
            this.sitemapDupes = [];
            this.loadError = e?.message ?? "Sitemap parse error.";
        }
    };

    #lintHeaders = () => {
        const findings: string[] = [];
        const map = new Map<string, string>();
        for (const raw of this.headersText.split(/\r?\n/)) {
            const idx = raw.indexOf(":");
            if (idx === -1) continue;
            const k = raw.slice(0, idx).trim().toLowerCase();
            const v = raw.slice(idx + 1).trim();
            if (k) map.set(k, v);
        }

        if (!map.has("strict-transport-security")) findings.push("Missing Strict-Transport-Security (HSTS).");
        if (!map.has("x-content-type-options")) findings.push("Missing X-Content-Type-Options: nosniff.");
        else if (map.get("x-content-type-options")!.toLowerCase() !== "nosniff") findings.push("X-Content-Type-Options should be 'nosniff'.");
        if (!map.has("x-frame-options")) findings.push("Missing X-Frame-Options (DENY/SAMEORIGIN).");
        if (!map.has("referrer-policy")) findings.push("Missing Referrer-Policy (e.g., no-referrer-when-downgrade, strict-origin-when-cross-origin).");
        if (!map.has("permissions-policy")) findings.push("Missing Permissions-Policy.");
        if (!map.has("content-security-policy")) findings.push("Missing Content-Security-Policy.");

        if (map.has("content-security-policy")) {
            const csp = map.get("content-security-policy")!;
            const warn = (msg: string) => findings.push(`CSP: ${msg}`);
            if (/['"]unsafe-inline['"]/.test(csp)) warn("Avoid 'unsafe-inline' (use nonces or hashes).");
            if (/['"]unsafe-eval['"]/.test(csp)) warn("Avoid 'unsafe-eval'.");
            if (/default-src\s+[^;]*\*/.test(csp)) warn("Avoid wildcards (*) in default-src.");
            if (!/object-src\s+[^;]*'none'/.test(csp)) warn("Add object-src 'none'.");
            if (!/base-uri\s+[^;]*'none'/.test(csp)) warn("Add base-uri 'none'.");
            if (!/frame-ancestors/.test(csp) && !map.has("x-frame-options")) warn("Specify frame-ancestors or X-Frame-Options.");
            if (!/upgrade-insecure-requests/.test(csp)) warn("Consider upgrade-insecure-requests.");
        }

        this.headerFindings = findings.length ? findings : ["Looks good — no major issues detected."];
    };

    #onFaviconFile = (e: Event) => {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;
        const sizes = [16, 32, 180] as const;
        const make = (size: number) =>
            new Promise<string>((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.onload = () => {
                    const c = document.createElement("canvas");
                    c.width = size; c.height = size;
                    const ctx = c.getContext("2d")!;
                    ctx.clearRect(0, 0, size, size);
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, size, size);
                    const ratio = Math.min(img.width, img.height);
                    const sx = (img.width - ratio) / 2;
                    const sy = (img.height - ratio) / 2;
                    ctx.drawImage(img, sx, sy, ratio, ratio, 0, 0, size, size);
                    resolve(c.toDataURL("image/png"));
                };
                img.onerror = reject;
                img.src = URL.createObjectURL(file);
            });

        Promise.all(sizes.map(make)).then(([u16, u32, u180]) => {
            this.fav16 = u16; this.fav32 = u32; this.fav180 = u180;
        }).catch(() => {
            this.fav16 = this.fav32 = this.fav180 = null;
        });
    };

    #faviconSnippet() {
        return [
            this.fav32 ? `<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">` : "",
            this.fav16 ? `<link rel="icon" type="image/png" sizes="16x16" href="favicon-16.png">` : "",
            this.fav180 ? `<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">` : "",
            `<meta name="theme-color" content="#ffffff">`
        ].filter(Boolean).join("\n");
    }

    #open(url: string) { window.open(url, "_blank", "noopener"); }
    static styles = css`
    :host {
      --bg: #ffffff;
      --fg: #111827;
      --muted: #6b7280;
      --card: #f9fafb;
      --border: #e5e7eb;
      --accent: #6366f1;

      display: block;
      color: var(--fg);
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
      color-scheme: light;
    }
    :host([theme="dark"]) {
      --bg: #0b0f19;
      --fg: #f5f7ff;
      --muted: #94a3b8;
      --card: #111827;
      --border: #1f2937;
      --accent: #a78bfa;
      color-scheme: dark;
    }
    :host([palette="pastel-pink"]) { --accent:#ec4899; --card:#ffe4e6; --border:#fecdd3; --bg:#fff1f2; --fg:#111827; }
    :host([palette="ocean-teal"]) { --accent:#14b8a6; --card:#ccfbf1; --border:#99f6e4; --bg:#f0fdfa; --fg:#042f2e; }

    .wrap { background: var(--bg); border: 1px solid var(--border); border-radius: 16px; padding: 26px; margin: 20px; }
    .header { display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin-bottom:10px; }
    .header h2 { margin:0; font-size:1.25rem; }
    .muted { color: var(--muted); }
    .small { font-size: .9rem; }

    .toolbar { display:grid; grid-template-columns: repeat(5, max-content); gap:14px; align-items:center; margin:12px 0 16px; }
    .section-title { margin:16px 0 10px; font-size:1.05rem; font-weight:700; }

    .search { display:inline-flex; gap:6px; align-items:center; }
    input[type="search"], select, input[type="text"], input[type="url"], input[type="color"] {
      padding:8px 10px; border-radius:10px; border:1px solid var(--border); background:var(--card); color:var(--fg); outline:none;
    }
    input[type="search"]:focus, select:focus, input[type="text"]:focus, input[type="url"]:focus { border-color: var(--accent); }

    button {
      border-radius: 999px; padding: 8px 12px; border: 1px solid var(--border);
      cursor: pointer; font-weight: 500; color: var(--fg); background: var(--card);
      transition: transform .06s ease, background-color .2s ease, border-color .2s ease, color .2s ease;
    }
    button:active { transform: translateY(1px); }
    button.ghost { background: transparent; }
    button.solid, button.accent { background: var(--accent); color: var(--bg); border-color: var(--accent); }
    button.outline { background: transparent; color: var(--accent); border-color: var(--accent); }
    button:disabled { opacity: .5; cursor: not-allowed; }

    .dev { margin:6px 0 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 12px; padding:6px 8px; border-radius:8px; border:1px solid var(--border); background:var(--card); color:var(--muted); }

    .grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:12px; }
    .card { position:relative; display:grid; grid-template-columns:40px 1fr; grid-template-rows:auto auto; gap:8px 10px; align-items:center;
      background:var(--card); border:1px solid var(--border); border-radius:18px; padding:12px; box-shadow:0 6px 18px rgba(0,0,0,.06); }
    .card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.1); }
    .card img { grid-row: span 2; }
    .emoji { width:40px; height:40px; display:flex; align-items:center; justify-content:center; font-size:22px; background:#fff; border-radius:10px; border:1px solid var(--border); }
    .card-body { display:flex; flex-direction:column; gap:4px; }
    .cta { grid-column:1 / -1; text-decoration: underline; font-weight:600; color: var(--accent); }
    .badge { position:absolute; top:10px; right:12px; font-size:12px; background:var(--accent); color:var(--bg); border-radius:999px; padding:2px 8px; }

    details.tool { border:1px solid var(--border); border-radius:12px; background:var(--card); margin:12px 0; }
    details.tool > summary { padding:10px 12px; cursor:pointer; font-weight:700; }
    .tool-body { padding:0 12px 12px 12px; display:grid; gap:10px; }
    .row { display:flex; flex-wrap: wrap; gap:10px; align-items:center; }
    .checkbox { display:flex; align-items:center; gap:8px; }

    .pillbar { display:flex; gap:8px; flex-wrap:wrap; }
    .pill { border:1px solid var(--border); padding:4px 8px; border-radius:999px; font-size:12px; }
    .pill.pass { background:#ecfdf5; border-color:#bbf7d0; color:#065f46; }
    .pill.fail { background:#fef2f2; border-color:#fecaca; color:#991b1b; }

    .contrast-preview { border:1px dashed var(--border); border-radius:10px; padding:12px; }
    .preview-text { line-height: 1.4; }

    .og-preview { display:grid; grid-template-columns: 1fr; gap:8px; border:1px dashed var(--border); border-radius:10px; padding:10px; background:#fff; color:#111; }
    .og-preview img { width:100%; max-height: 180px; object-fit: cover; border-radius:8px; border:1px solid #e5e7eb; }
    .img-placeholder { height: 120px; display:flex; align-items:center; justify-content:center; background:#f3f4f6; border:1px dashed #e5e7eb; border-radius:8px; color:#6b7280; }
    .og-site { font-size:.8rem; color:#6b7280; }
    .og-title { font-weight:700; }
    .og-desc { color:#374151; }

    textarea.mono, textarea.code { width:100%; min-height: 120px; border-radius:10px; border:1px solid var(--border); background:var(--bg); color:var(--fg); padding:10px; }
    textarea.code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; min-height: 90px; }

    .ok { color:#065f46; background:#ecfdf5; border:1px solid #bbf7d0; padding:6px 10px; border-radius:8px; }
    .error { color:#b91c1c; background:#fef2f2; border:1px solid #fecaca; padding:6px 10px; border-radius:12px; font-weight:600; }

    .findings { margin: 0; padding-left: 18px; }
    .dupes ul { margin: 8px 0 0 18px; }

    .thumbs { gap: 16px; }
    .thumb { display:flex; flex-direction:column; align-items:center; gap:6px; text-decoration:none; }
    .thumb img { width:48px; height:48px; border-radius:8px; border:1px solid var(--border); }
  `;
}

export class FilterChangedEvent extends CustomEvent<{ value: string }> {
    constructor(value: string) {
        super("filter-changed", { detail: { value }, bubbles: true, composed: true });
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "my-element": MyElement;
    }
}
