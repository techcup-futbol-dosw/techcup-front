// src/core/utils/fileUtils.ts

/**
 * 
 * @param originalName - Nombre original del archivo
 * @returns Nombre sanitizado listo para guardar en Storage
 * Esta clase se encarga de cambiar el nombre de los archivos para que sean compatibles con los sistemas de archivos y URLs, eliminando caracteres especiales, espacios y convirtiendo todo a minúsculas.
 */
export function sanitizeFileName(originalName: string): string {
  const lastDot = originalName.lastIndexOf('.');
  const hasExtension = lastDot !== -1 && lastDot < originalName.length - 1;

  const name = hasExtension ? originalName.slice(0, lastDot) : originalName;
  const extension = hasExtension ? originalName.slice(lastDot) : '';

  const sanitizedName = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')          
    .replace(/[^a-z0-9\-_]/g, '')   
    .replace(/-{2,}/g, '-')         
    .replace(/^-+|-+$/g, '');       

  return `${sanitizedName}${extension.toLowerCase()}`;
}