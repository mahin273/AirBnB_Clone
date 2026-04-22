import type { createHotelDto } from '../dto/hotel.dto.ts';
import { createHotel, getHotelById } from '../repositories/hotel.repository.ts';
export async function createHotelService(hotelData:createHotelDto){
  const hotel = await createHotel(hotelData);
  return hotel;
}

export async function getHotelByIdService(id:number){
  const hotel = await getHotelById(id);
  return hotel;
}
