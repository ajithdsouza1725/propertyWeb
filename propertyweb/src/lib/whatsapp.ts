export function buildWhatsAppURL(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const withCode = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;
  return `https://wa.me/${withCode}?text=${encodeURIComponent(message)}`;
}

export function buildPropertyMessage(property: {
  title: string;
  locality: string;
  price: string;
}): string {
  return `Hi, I found your property on MangaloreHomes and I'm interested.\n\nProperty: ${property.title}\nLocation: ${property.locality}, Mangalore\nPrice: ${property.price}\n\nCould you share more details and arrange a visit? Thank you.`;
}
