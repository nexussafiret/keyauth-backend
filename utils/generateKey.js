export function generateLicenseKey(mask = '******-******-******-******', options = {}) {
  const { lowercase = true, uppercase = true, numbers = true } = options;
  
  let chars = '';
  if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (numbers) chars += '0123456789';
  
  if (chars.length === 0) {
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  }
  
  let key = '';
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === '*') {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    } else {
      key += mask[i];
    }
  }
  
  return key;
}

export function generateUserId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 10; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}
