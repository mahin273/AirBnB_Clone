export type createRoomCategoryDto = {
  name: string;
  description?: string;
  roomType: string;
  maxGuests: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
  basePricePerNight: number;
  apartmentId: number;
}
