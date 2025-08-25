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

@customElement("my-element")
export default class MyElement extends LitElement {
    @property({ reflect: true })
    theme: Theme = (localStorage.getItem("ts_theme") as Theme) || "light";

    @property({ reflect: true })
    palette: Palette = (localStorage.getItem("ts_palette") as Palette) || "default";

    @state() private filter = "";
    @state() private clicks = 0;
    @state() private formattedTime: string | null = null;
    @state() private buildMode = import.meta.env.MODE;
    @state() private stars: Partial<Record<string, number>> = {};
    @state() private loadingStars = false;
    @state() private loadError: string | null = null;

    @query("#filter") private filterInput!: HTMLInputElement;

    private tools = [
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

    connectedCallback(): void {
        super.connectedCallback();
        localStorage.setItem("ts_theme", this.theme);
        localStorage.setItem("ts_palette", this.palette);
    }

    render() {
        const headerClasses = classMap({ header: true, dark: this.theme === "dark" });

        const visible = this.tools.filter(
            (t) =>
                !this.filter.trim() ||
                t.title.toLowerCase().includes(this.filter.toLowerCase()) ||
                t.subtitle.toLowerCase().includes(this.filter.toLowerCase())
        );

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
            ${this.theme === "dark" ? "🌙 Dark" : "☀️ Light"}
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

        <!-- Cards -->
        <div class="grid" @keydown=${this.#onGridKeydown}>
          ${repeat(
                    visible,
                    (t) => t.id,
                    (t, i) => html`
              <article class="card" tabindex="0" data-index=${i} @click=${() => this.#open(t.link)}>
                <img src=${t.logo} alt="${t.title} logo" width="40" height="40" loading="lazy" />
                <div class="card-body">
                  <h3>${t.title}</h3>
                  <p class="muted">${t.subtitle}</p>
                </div>
                ${this.stars[t.id] !== undefined
                            ? html`<span class="badge" title="GitHub stars">⭐ ${this.stars[t.id]}</span>`
                            : nothing}
                <a
                  class="cta"
                  href=${t.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  @click=${(e: Event) => e.stopPropagation()}
                  >Learn more →</a
                >
              </article>
            `
                )}
          ${visible.length === 0 ? html`<p class="muted">No results. Try another filter.</p>` : nothing}
        </div>

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

    #increment = () => {
        this.clicks++;
    };

    async #loadTime() {
        const { formatTime } = await import("./utils/time-format.ts");
        this.formattedTime = formatTime(new Date());
    }

    async #loadStars() {
        try {
            this.loadingStars = true;
            this.loadError = null;
            const requests = this.tools.map(async (t) => {
                const url = `https://api.github.com/repos/${t.repo.owner}/${t.repo.name}`;
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
        const cards = Array.from(this.renderRoot.querySelectorAll<HTMLElement>(".card"));
        const current = e.composedPath()[0] as HTMLElement;
        const idx = cards.indexOf(current.closest(".card") as HTMLElement);
        if (idx === -1) return;
        const cols = this.#computeCols();

        const focusIndex = (i: number) => {
            cards[i]?.focus();
        };
        switch (e.key) {
            case "ArrowRight":
                e.preventDefault();
                focusIndex(Math.min(cards.length - 1, idx + 1));
                break;
            case "ArrowLeft":
                e.preventDefault();
                focusIndex(Math.max(0, idx - 1));
                break;
            case "ArrowDown":
                e.preventDefault();
                focusIndex(Math.min(cards.length - 1, idx + cols));
                break;
            case "ArrowUp":
                e.preventDefault();
                focusIndex(Math.max(0, idx - cols));
                break;
            case "Enter":
            case " ": {
                e.preventDefault();
                (cards[idx].querySelector(".cta") as HTMLAnchorElement)?.click();
                break;
            }
        }
    };

    #computeCols() {
        const grid = this.renderRoot.querySelector(".grid") as HTMLElement | null;
        if (!grid) return 1;
        const style = getComputedStyle(grid);
        const template = style.gridTemplateColumns || "";
        const cols = template.split(" ").filter(Boolean).length;
        return Math.max(1, cols);
    }

    #open(url: string) {
        window.open(url, "_blank", "noopener");
    }

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

    :host([palette="pastel-pink"]) {
      --accent: #ec4899;
      --card: #ffe4e6;
      --border: #fecdd3;
      --bg: #fff1f2;
      --fg: #111827;
    }
    :host([palette="ocean-teal"]) {
      --accent: #14b8a6;
      --card: #ccfbf1;
      --border: #99f6e4;
      --bg: #f0fdfa;
      --fg: #042f2e;
    }

    :host([theme="dark"][palette="pastel-pink"]) {
      /* deep pink-tinted dark surface */
      --bg:     #1a0f14;
      --card:   #24161c; 
      --border: #3a2430;  
      --fg:     #ffe4e6; 
      --muted:  #f9a8d4; 
      --accent: #f472b6;  
    }

    :host([theme="dark"][palette="ocean-teal"]) {
      --bg:     #042f2e; 
      --card:   #134e4a; 
      --border: #115e59;
      --fg:     #ccfbf1; 
      --muted:  #5eead4; 
      --accent: #2dd4bf; 
    }


    :host([theme="dark"][palette="pastel-pink"]) {
      --accent: #f472b6;
    }
    :host([theme="dark"][palette="ocean-teal"]) {
      --accent: #2dd4bf;
    }

    .wrap {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 26px;
      margin: 20px;
    }

    .header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
    }
    .header h2 {
      margin: 0;
      font-size: 1.25rem;
    }
    .muted {
      color: var(--muted);
    }

    .toolbar {
      display: grid;
      grid-template-columns: repeat(5, max-content);
      gap: 14px;
      align-items: center;
      flex-wrap: wrap;
      margin: 12px 0 16px;
    }

    .search {
      display: inline-flex;
      gap: 6px;
      align-items: center;
    }
    input[type="search"],
    select {
      padding: 8px 10px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--card);
      color: var(--fg);
      outline: none;
    }
    input[type="search"]:focus,
    select:focus {
      border-color: var(--accent);
    }
    @supports (box-shadow: 0 0 0 3px color-mix(in oklab, black, white)) {
      input[type="search"]:focus,
      select:focus {
        box-shadow: 0 0 0 3px color-mix(in oklab, var(--accent) 20%, transparent);
      }
    }

    .palette {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    button {
      border-radius: 999px;
      padding: 8px 12px;
      border: 1px solid var(--border);
      cursor: pointer;
      font-weight: 500;
      transition: transform 0.06s ease, background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
      color: var(--fg);
      background: var(--card);
    }
    button:active {
      transform: translateY(1px);
    }
    button.pill {
      background: var(--card);
    }
    button.ghost {
      background: transparent;
    }
    button.solid {
      background: var(--accent);
      color: var(--bg);
      border-color: var(--accent);
    }
    button.outline {
      background: transparent;
      color: var(--accent);
      border-color: var(--accent);
    }
    button.accent {
      background: var(--accent);
      color: var(--bg);
      border-color: var(--accent);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    button:focus-visible {
      outline: 3px solid var(--accent);
      outline-offset: 2px;
    }

    .dev {
      margin: 6px 0 12px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 12px;
      padding: 6px 8px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--card);
      color: var(--muted);
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }
    .card {
      position: relative;
      display: grid;
      grid-template-columns: 40px 1fr;
      grid-template-rows: auto auto;
      gap: 8px 10px;
      align-items: center;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 12px;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      color: var(--fg);
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }
    .card:focus-visible {
      outline: 3px solid var(--accent);
      outline-offset: 2px;
    }
    .card img {
      grid-row: span 2;
    }
    .card-body {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .card h3 {
      margin: 0;
      font-size: 1rem;
    }
    .cta {
      grid-column: 1 / -1;
      text-decoration: underline;
      font-weight: 600;
      color: var(--accent);
    }

    .badge {
      position: absolute;
      top: 10px;
      right: 12px;
      font-size: 12px;
      background: var(--accent);
      color: var(--bg);
      border-radius: 999px;
      padding: 2px 8px;
      font-variant-numeric: tabular-nums;
    }

    .error {
      color: #b91c1c;
      background: #fef2f2;
      border: 1px solid #fecaca;
      padding: 6px 10px;
      border-radius: 12px;
      font-weight: 600;
    }

    .footer {
      margin-top: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
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
