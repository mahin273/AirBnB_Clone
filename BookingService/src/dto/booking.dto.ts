export type CreateBookingDto = {
  userId: number;
  propertyId: number;
  checkInDate: Date;
  checkOutDate: Date;
  totalGuests: number;
  bookingAmount: number;
};

export type CreateBookingInputDto = Omit<CreateBookingDto, 'userId'>;
