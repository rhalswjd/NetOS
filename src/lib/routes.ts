export function url(path = '/') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}
export function docUrl(id: string) {
  return url(`/${id}/`);
}
