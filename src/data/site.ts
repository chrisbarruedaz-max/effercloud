const configuredBase = import.meta.env.BASE_URL;
const siteBase = configuredBase.endsWith('/') ? configuredBase : `${configuredBase}/`;

export function sitePath(path = ''): string {
	return `${siteBase}${path.replace(/^\/+/, '')}`;
}