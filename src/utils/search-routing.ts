export const SEARCH_PARAM = 'search';

export interface ResourceRouteOptions {
  category?: string;
  type?: string;
  page?: number;
}

export interface TilRouteOptions {
  tag?: string;
  page?: number;
  view?: 'feed' | 'kanban';
}

const toQuery = (search?: string, extra?: Record<string, string | undefined>): string => {
  const params = new URLSearchParams();
  const normalizedSearch = search?.trim();
  if (normalizedSearch) {
    params.set(SEARCH_PARAM, normalizedSearch);
  }

  if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      if (value && value.trim()) {
        params.set(key, value);
      }
    });
  }

  const query = params.toString();
  return query ? `?${query}` : '';
};

export const buildResourcesPath = ({ category, type, page = 1 }: ResourceRouteOptions = {}): string => {
  if (category && type) {
    return `/resources/category/${encodeURIComponent(category)}/type/${encodeURIComponent(type)}/${page}`;
  }

  if (category) {
    return `/resources/category/${encodeURIComponent(category)}/${page}`;
  }

  if (type) {
    return `/resources/type/${encodeURIComponent(type)}/${page}`;
  }

  return `/resources/all/${page}`;
};

export const buildResourcesUrl = (options: ResourceRouteOptions = {}, search?: string): string => {
  return `${buildResourcesPath(options)}${toQuery(search)}`;
};

export const buildTilPath = ({ tag, page = 1 }: TilRouteOptions = {}): string => {
  if (tag) {
    return `/til/${encodeURIComponent(tag)}/${page}`;
  }

  return `/til/all/${page}`;
};

export const buildTilUrl = (options: TilRouteOptions = {}, search?: string): string => {
  const extra = options.view ? { view: options.view } : undefined;
  return `${buildTilPath(options)}${toQuery(search, extra)}`;
};
