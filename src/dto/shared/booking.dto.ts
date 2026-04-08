export interface IRequiredItemDTO {
  name: string;
  price: number;
  description?: string;
}

export interface IBookingDetailsDTO {
  bookingId: string;
  workerId?: string;
  endingTime: string;
  itemsRequired: IRequiredItemDTO[];
  additionalNotes?: string;
}
