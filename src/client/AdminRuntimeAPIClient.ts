import { EaCBaseClient } from 'jsr:@fathym/eac@0.2.130/steward/clients';
import type { ClientHelperBridge } from '@o-industrial/common/api';

const TEMP_URL_BASE = 'http://admin-runtime.local';

type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export interface AdminRuntimeClientOptions {
  /** Optional bearer token for Authorization header usage. */
  apiToken?: string;
  /** Optional base path to prepend to all generated URLs (e.g., "/admin"). */
  basePath?: string;
  /** Optional base URL (absolute or relative). Overrides `basePath` when provided. */
  baseUrl?: string | URL;
  /** Optional custom fetch implementation (useful for testing). */
  fetchImpl?: typeof fetch;
}

interface AdminRuntimeClientBridge extends ClientHelperBridge {
  fetch: FetchLike;
}

function getGlobalDocument(): Document | undefined {
  return (globalThis as { document?: Document }).document;
}

function getGlobalLocation(): Location | undefined {
  return (globalThis as { location?: Location }).location;
}

function detectDocumentBasePath(): string {
  const doc = getGlobalDocument();
  if (!doc) {
    return '/';
  }

  const baseEl = doc.querySelector('base[href]');
  const href = baseEl?.getAttribute('href') ?? '';

  if (href) {
    try {
      const origin = getGlobalLocation()?.origin ?? TEMP_URL_BASE;
      return new URL(href, origin).pathname || '/';
    } catch (_err) {
      return href.startsWith('/') ? href : `/${href}`;
    }
  }

  if (doc.baseURI) {
    try {
      return new URL(doc.baseURI).pathname || '/';
    } catch (_err) {
      // ignore invalid baseURI values
    }
  }

  return '/';
}

function resolveBaseUrl(options: AdminRuntimeClientOptions): URL {
  const { baseUrl, basePath } = options;

  if (baseUrl instanceof URL) {
    return new URL(baseUrl.href);
  }

  if (typeof baseUrl === 'string' && baseUrl.trim().length > 0) {
    try {
      return new URL(baseUrl);
    } catch (_err) {
      const origin = getGlobalLocation()?.origin ?? TEMP_URL_BASE;
      return new URL(baseUrl, origin);
    }
  }

  const origin = getGlobalLocation()?.origin ?? TEMP_URL_BASE;
  const path = basePath ?? detectDocumentBasePath();

  return new URL(path || '/', origin);
}

function resolveFetch(fetchImpl?: typeof fetch): FetchLike {
  if (fetchImpl) {
    return (input, init) => fetchImpl(input, init);
  }

  return (input, init) => fetch(input, init);
}

export class AdminRuntimeAPIClient extends EaCBaseClient {
  public readonly AccessCards: AdminRuntimeAccessCardsAPI;
  public readonly AccessRights: AdminRuntimeAccessRightsAPI;
  public readonly Licenses: AdminRuntimeLicensesAPI;

  private readonly fetchImpl: FetchLike;

  constructor(options: AdminRuntimeClientOptions = {}) {
    const baseUrl = resolveBaseUrl(options);
    super(baseUrl, options.apiToken ?? '');

    this.fetchImpl = resolveFetch(options.fetchImpl);

    const bridge = this.createClientBridge();

    this.AccessCards = new AdminRuntimeAccessCardsAPI(bridge);
    this.AccessRights = new AdminRuntimeAccessRightsAPI(bridge);
    this.Licenses = new AdminRuntimeLicensesAPI(bridge);
  }

  protected override loadHeaders(headers?: HeadersInit): HeadersInit {
    const merged = new Headers(super.loadHeaders(headers));

    if (!this.apiToken) {
      merged.delete('Authorization');
    }

    return merged;
  }

  private createClientBridge(): AdminRuntimeClientBridge {
    return {
      url: (ref) => this.loadClientUrl(ref),
      headers: (headers?: HeadersInit) => this.loadHeaders(headers),
      json: <T>(res: Response) => this.json<T>(res),
      token: () => this.apiToken,
      fetch: (input, init) => {
        const requestInit: RequestInit = {
          credentials: 'include',
          ...init,
        };

        return this.fetchImpl(input, requestInit);
      },
    };
  }
}

export function createAdminRuntimeClient(
  options: AdminRuntimeClientOptions = {},
): AdminRuntimeAPIClient {
  return new AdminRuntimeAPIClient(options);
}

class AdminRuntimeAccessRightsAPI {
  constructor(private readonly bridge: AdminRuntimeClientBridge) {}

  public async Delete(lookup: string, init?: RequestInit): Promise<Response> {
    const target = this.bridge.url(
      `./access-rights/${encodeURIComponent(lookup)}`,
    );

    const requestInit: RequestInit = {
      method: 'DELETE',
      ...init,
      headers: this.bridge.headers(init?.headers),
    };

    return await this.bridge.fetch(target, requestInit);
  }
}

class AdminRuntimeAccessCardsAPI {
  constructor(private readonly bridge: AdminRuntimeClientBridge) {}

  public async Delete(lookup: string, init?: RequestInit): Promise<Response> {
    const target = this.bridge.url(
      `./access-cards/${encodeURIComponent(lookup)}`,
    );

    const requestInit: RequestInit = {
      method: 'DELETE',
      ...init,
      headers: this.bridge.headers(init?.headers),
    };

    return await this.bridge.fetch(target, requestInit);
  }
}

class AdminRuntimeLicensesAPI {
  constructor(private readonly bridge: AdminRuntimeClientBridge) {}

  public async Delete(
    licLookup: string,
    init?: RequestInit,
  ): Promise<Response> {
    const target = this.bridge.url(
      `./licenses/${encodeURIComponent(licLookup)}`,
    );

    const requestInit: RequestInit = {
      method: 'DELETE',
      ...init,
      headers: this.bridge.headers(init?.headers),
    };

    return await this.bridge.fetch(target, requestInit);
  }

  public async DeletePlan(
    licLookup: string,
    planLookup: string,
    init?: RequestInit,
  ): Promise<Response> {
    const target = this.bridge.url(
      `./licenses/${encodeURIComponent(licLookup)}/${
        encodeURIComponent(
          planLookup,
        )
      }`,
    );

    const requestInit: RequestInit = {
      method: 'DELETE',
      ...init,
      headers: this.bridge.headers(init?.headers),
    };

    return await this.bridge.fetch(target, requestInit);
  }

  public async DeletePlanPrice(
    licLookup: string,
    planLookup: string,
    priceLookup: string,
    init?: RequestInit,
  ): Promise<Response> {
    const target = this.bridge.url(
      `./licenses/${encodeURIComponent(licLookup)}/${
        encodeURIComponent(
          planLookup,
        )
      }/${encodeURIComponent(priceLookup)}`,
    );

    const requestInit: RequestInit = {
      method: 'DELETE',
      ...init,
      headers: this.bridge.headers(init?.headers),
    };

    return await this.bridge.fetch(target, requestInit);
  }
}
