import { LitElement, html, css } from "@umbraco-cms/backoffice/external/lit";
import { customElement, state } from "lit/decorators.js";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";

type RepoStats = {
    name: string;
    stargazers_count: number;
    forks_count: number;
    open_issues: number;
};

declare const __APP_BUILD_TIME__: string;
declare const __APP_MODE__: string;

@customElement("vite-dashboard")
export class ViteInsightsDashboard extends UmbElementMixin(LitElement) {
    static styles = css`
    :host { display:block; box-sizing:border-box; padding:16px; }
    header { display:grid; grid-template-columns:1fr auto; gap:12px; align-items:start; margin-bottom:16px; }
    h1 { margin:0; font-size:1.25rem; line-height:1.2; }
    .grid { display:grid; gap:12px; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); }
    .meta { font-size:.9rem; opacity:.8; }
    .pill { display:inline-block; padding:2px 8px; border-radius:999px; font-size:.8rem; border:1px solid var(--uui-color-border,#d9d9d9); }
    .kpi { display:grid; gap:8px; padding:12px; border:1px solid var(--uui-color-border,#e5e5e5); border-radius:12px; background:var(--uui-color-surface,#fff); }
    .kpi h3 { margin:0; font-weight:600; font-size:.95rem; }
    .kpi .value { font-size:1.4rem; font-weight:700; line-height:1.1; }
    .panel { border:1px solid var(--uui-color-border,#e5e5e5); border-radius:12px; background:var(--uui-color-surface,#fff); padding:12px; }
    .row { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
    .spacer { flex:1; }
    uui-button + uui-button { margin-left:6px;}
    .code { font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace; font-size:.85rem; background:var(--uui-color-surface-alt,#f6f6f6); border:1px dashed var(--uui-color-border,#e5e5e5); padding:8px; border-radius:8px; word-break:break-all; }
  `;

    @state() private counter = 0;
    @state() private loading = false;
    @state() private error: string | null = null;
    @state() private stats: RepoStats | null = null;
    @state() private display = { stars: "", forks: "", issues: "" };
    @state() private prettyLoaded = false;
    @state() private apiStatus: "idle" | "ok" | "error" | "rate-limited" | "timeout" = "idle";
    @state() private winSize = `${window.innerWidth}×${window.innerHeight}`;
    @state() private timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    @state() private userAgent = navigator.userAgent.replace(/\((.*?)\)/, "(…)");
    private _renderCount = 0; 

    connectedCallback(): void {
        super.connectedCallback();
        this.fetchStats();
        window.addEventListener("resize", this.onResize);
    }
    disconnectedCallback(): void {
        window.removeEventListener("resize", this.onResize);
        super.disconnectedCallback();
    }
    private onResize = () => {
        this.winSize = `${window.innerWidth}×${window.innerHeight}`;
    };

    private async fetchStats() {
        this.loading = true;
        this.error = null;
        this.apiStatus = "idle";

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        try {
            const res = await fetch("https://api.github.com/repos/Izabel-R/UmbracoExpertProject", {
                headers: {
                    "Accept": "application/vnd.github+json",
                    "User-Agent": "Umbraco-Vite-Dashboard"
                },
                signal: controller.signal
            });

            if (!res.ok) {
                const remaining = res.headers.get("x-ratelimit-remaining");
                const reset = res.headers.get("x-ratelimit-reset");
                if (res.status === 403 && remaining === "0") {
                    const when = reset ? new Date(Number(reset) * 1000).toLocaleTimeString() : "later";
                    this.apiStatus = "rate-limited"; 
                    throw new Error(`GitHub rate limit reached. Try again ${when}.`);
                }
                this.apiStatus = "error";
                throw new Error(`Request failed (HTTP ${res.status}).`);
            }

            const data = (await res.json()) as RepoStats;
            this.stats = {
                name: data.name,
                stargazers_count: data.stargazers_count,
                forks_count: data.forks_count,
                open_issues: data.open_issues
            };

            const { prettyNumber } = await import("./utils/pretty.js");
            this.display = {
                stars: prettyNumber(this.stats.stargazers_count),
                forks: prettyNumber(this.stats.forks_count),
                issues: prettyNumber(this.stats.open_issues)
            };
            this.prettyLoaded = true;
            this.apiStatus = "ok"; 

        } catch (e: any) {
            if (e?.name === "AbortError") {
                this.error = "Request timed out. Check network/CSP and retry.";
                this.apiStatus = "timeout"; 
            } else {
                this.error = e?.message || "Couldn’t load repo stats (offline or rate-limited).";
                if (this.apiStatus === "idle") this.apiStatus = "error"; 
            }
            this.stats = null;
            this.display = { stars: "", forks: "", issues: "" };
        } finally {
            clearTimeout(timeout);
            this.loading = false;
        }
    }

    private increment() { this.counter++; }
    private reset() { this.counter = 0; }

    private renderKpi(label: string, value: number | string) {
        return html`
      <div class="kpi">
        <h3>${label}</h3>
        <div class="value">${value}</div>
      </div>
    `;
    }

    private renderStats() {
        if (this.loading) return html`<uui-loader-bar></uui-loader-bar>`;

        if (this.error) {
            return html`
        <uui-alert-banner color="danger" label="Load error">${this.error}</uui-alert-banner>
        <uui-button look="outline" @click=${this.fetchStats}>Retry</uui-button>
      `;
        }

        if (!this.stats) return html`<uui-text>No data to show yet.</uui-text>`;

        return html`
      <div class="grid">
        ${this.renderKpi("GitHub Stars", this.display.stars || this.stats.stargazers_count)}
        ${this.renderKpi("Forks", this.display.forks || this.stats.forks_count)}
        ${this.renderKpi("Open Issues", this.display.issues || this.stats.open_issues)}
      </div>
      <div class="meta" style="margin-top:8px">
        Repo: <span class="pill">${this.stats.name}</span>
        ${this.prettyLoaded ? html` · formatter: <span class="pill">lazy-loaded</span>` : null}
      </div>
    `;
    }

    private renderDiagnostics(renderCount: number) {
        const apiBadge =
            this.apiStatus === "ok" ? "✅ OK" :
                this.apiStatus === "rate-limited" ? "⏳ Rate-limited" :
                    this.apiStatus === "timeout" ? "⌛ Timeout" :
                        this.apiStatus === "error" ? "⚠️ Error" : "—";

        return html`
          <div class="grid" style="margin-top:8px">
            ${this.renderKpi("API Status", apiBadge)}
            ${this.renderKpi("Renders", renderCount)}
            ${this.renderKpi("Timezone", this.timezone)}
            ${this.renderKpi("Window", this.winSize)}
          </div>
          <div class="grid" style="margin-top:8px">
          ${this.renderKpi("User Agent", this.userAgent)}
          </div>
        `;
    }

    private formatDateTime(iso: string): string {
        const date = new Date(iso);
        return new Intl.DateTimeFormat("en-US", {
            month: "numeric",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        }).format(date);
    }


    private getBaseUrl(): string {
        const base = (import.meta as any).env?.BASE_URL ?? "/";
        return window.location.origin + base;
    }

    render() {
        this._renderCount++;
        const renderCount = this._renderCount;

        return html`
      <header>
        <div>
          <h1>Vite + Lit + TypeScript · Insights</h1>
          <p>
              <a href="https://github.com/Izabel-R/UmbracoExpertProject.git" target="_blank" rel="noopener noreferrer">
                https://github.com/Izabel-R/UmbracoExpertProject.git
              </a>
         </p>
          <div class="meta">
              Mode: <span class="pill">${__APP_MODE__}</span> ·
              Built: <span class="pill">${this.formatDateTime(__APP_BUILD_TIME__)}</span> ·
              Base: <span class="pill">${this.getBaseUrl()}</span>
          </div>
        </div>
        <div class="row">
          <uui-button label="Refresh" @click=${this.fetchStats} look="primary">Refresh</uui-button>
        </div>
      </header>

      <section class="panel" style="margin-bottom:12px">
        <div class="row">
          <strong>Reactive Counter</strong>
          <span class="spacer"></span>
          <uui-button look="secondary" @click=${this.increment}>Click Me</uui-button>
          <uui-button look="outline" @click=${this.reset}>Reset</uui-button>
        </div>
        <div style="margin-top:8px" class="code">count = ${this.counter}</div>
      </section>

      <section class="panel" style="margin-bottom:12px">
        <strong>Remote Repo KPIs</strong>
        <div style="margin-top:8px">
          ${this.renderStats()}
        </div>
      </section>

      <section class="panel">
        <strong>Diagnostics</strong>
        ${this.renderDiagnostics(renderCount)}
      </section>

      <slot></slot>

      <div class="vu-writeup" style="margin-top:24px">
          <details class="vu-details" open>
            <summary>What I learned, how I used Vite + Lit + TypeScript, and how to use these tools</summary>
            <div style="margin-top:12px">
      
              <h2>What I Learned About Vite + Lit + TypeScript in Umbraco</h2>
              <p>
                Building this dashboard taught me how to combine Vite’s fast dev/build pipeline,
                Lit’s reactive components, and TypeScript’s type safety into a clean and efficient
                extension for the Umbraco backoffice. It also showed me how to integrate external APIs
                (GitHub) while handling async data, error states, and lazy-loaded utilities.
              </p>

              <h3>How I Used Vite + Lit in This Project</h3>
              <ul>
                <li><strong>Build &amp; Env Panel:</strong> surfaced runtime info such as mode, build time, and base URL for quick diagnostics.</li>
                <li><strong>Reactive Counter:</strong> simple example of Lit’s reactivity, useful as a teaching/demo tool.</li>
                <li><strong>Remote Repo KPIs:</strong> live GitHub stats with async fetching, error handling, and lazy-loaded formatting.</li>
                <li><strong>Diagnostics:</strong> viewport size, timezone, API status, and user agent — helpful for client debugging.</li>
              </ul>

              <h3>How to Use the Tools</h3>
              <ol>
                <li>Include this dashboard in your Umbraco backoffice via a custom extension manifest.</li>
                <li>Use the “Refresh” button to fetch fresh GitHub repo KPIs.</li>
                <li>Developers and editors can quickly verify environment, diagnostics, and repo health without leaving the CMS.</li>
              </ol>

              <h3>Learn More</h3>
              <ul>
                <li><a href="https://vitejs.dev/" target="_blank">Vite Documentation</a></li>
                <li><a href="https://lit.dev/" target="_blank">Lit Documentation</a></li>
                <li><a href="https://www.typescriptlang.org/docs/" target="_blank">TypeScript Docs</a></li>
                <li><a href="https://our.umbraco.com/Documentation/Extending/Backoffice/" target="_blank">Umbraco Backoffice Extensions</a></li>
              </ul>

            </div>
          </details>
      </div>
    `;
    }
}

export { ViteInsightsDashboard as default };
