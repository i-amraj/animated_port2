export const getBasePath = (path: string) => {
    const base = import.meta.env.BASE_URL || '/';
    // Avoid double slashes if path already starts with /
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${base}${cleanPath}`;
};
