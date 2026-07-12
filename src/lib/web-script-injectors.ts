// Inlined replacement for the former `@oriz/web-script-injectors` github dependency.
// That package (github:chirag127/web-script-injectors) is unresolvable (repo 404) and is an
// in-house `@oriz/*` package — community-packages-only + no-in-house-pkgs rules require inlining.
// Behaviour: read analytics IDs from env and emit the corresponding <script> tags plus a CSP.
// Every provider is opt-in: absent env var => nothing injected (safe, no-op).

type Env = Record<string, string | undefined>;

interface InjectedScripts {
	head: string;
	bodyEnd: string;
}

const esc = (v: string): string =>
	v.replace(/</g, "\\u003c").replace(/"/g, "&quot;");

/** Build head + bodyEnd HTML for whichever analytics providers are configured via env. */
export function getInjectedScripts(env: Env): InjectedScripts {
	const head: string[] = [];
	const bodyEnd: string[] = [];

	const ga = env.ORIZ_FLEET_GOOGLE_ANALYTICS_MEASUREMENT_ID;
	if (ga) {
		const id = esc(ga);
		head.push(
			`<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>`,
			`<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');</script>`,
		);
	}

	const clarity = env.ORIZ_FLEET_MICROSOFT_CLARITY_PROJECT_ID;
	if (clarity) {
		const id = esc(clarity);
		head.push(
			`<script>(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${id}");</script>`,
		);
	}

	const phKey = env.ORIZ_FLEET_POSTHOG_PROJECT_API_KEY;
	const phHost = env.ORIZ_FLEET_POSTHOG_API_HOST || "https://us.i.posthog.com";
	if (phKey) {
		const key = esc(phKey);
		const host = esc(phHost);
		head.push(
			`<script>!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init('${key}',{api_host:'${host}'})</script>`,
		);
	}

	const sentry = env.ORIZ_FLEET_SENTRY_DSN_BROWSER_SDK;
	if (sentry) {
		const dsn = esc(sentry);
		head.push(
			`<script src="https://browser.sentry-cdn.com/8.0.0/bundle.tracing.min.js" crossorigin="anonymous"></script>`,
			`<script>window.Sentry&&Sentry.init({dsn:'${dsn}'});</script>`,
		);
	}

	const cfToken = env.ORIZ_FLEET_CLOUDFLARE_WEB_ANALYTICS_TOKEN;
	if (cfToken) {
		const token = esc(cfToken);
		bodyEnd.push(
			`<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"${token}"}'></script>`,
		);
	}

	return { head: head.join("\n"), bodyEnd: bodyEnd.join("\n") };
}

/**
 * Content-Security-Policy value covering the providers above. Returns null when no analytics
 * provider is configured (nothing to whitelist beyond self, so keep the header off in dev).
 */
export function getContentSecurityPolicy(env: Env): string | null {
	const anyEnabled =
		env.ORIZ_FLEET_GOOGLE_ANALYTICS_MEASUREMENT_ID ||
		env.ORIZ_FLEET_MICROSOFT_CLARITY_PROJECT_ID ||
		env.ORIZ_FLEET_POSTHOG_PROJECT_API_KEY ||
		env.ORIZ_FLEET_SENTRY_DSN_BROWSER_SDK ||
		env.ORIZ_FLEET_CLOUDFLARE_WEB_ANALYTICS_TOKEN;
	if (!anyEnabled) return null;

	const scriptSrc = [
		"'self'",
		"'unsafe-inline'",
		"https://www.googletagmanager.com",
		"https://*.clarity.ms",
		"https://*.posthog.com",
		"https://us.i.posthog.com",
		"https://browser.sentry-cdn.com",
		"https://static.cloudflareinsights.com",
	];
	const connectSrc = [
		"'self'",
		"https://www.google-analytics.com",
		"https://*.clarity.ms",
		"https://*.posthog.com",
		"https://us.i.posthog.com",
		"https://*.sentry.io",
		"https://cloudflareinsights.com",
	];
	return [
		"default-src 'self'",
		`script-src ${scriptSrc.join(" ")}`,
		`connect-src ${connectSrc.join(" ")}`,
		"img-src 'self' data: https:",
		"style-src 'self' 'unsafe-inline'",
		"font-src 'self' data:",
		"base-uri 'self'",
	].join("; ");
}
