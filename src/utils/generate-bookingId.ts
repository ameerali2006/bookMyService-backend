export const generateBookingId = (): string => {
  const prefix = 'BK';

  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');

  const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();

  return `${prefix}-${datePart}-${randomPart}`;
};
