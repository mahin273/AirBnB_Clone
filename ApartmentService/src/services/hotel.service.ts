import type { createHotelDto } from '../dto/hotel.dto.ts';
import { createHotel, getAllHotels, getHotelById, softDeleteHotel } from '../repositories/hotel.repository.ts';
export async function createHotelService(hotelData:createHotelDto){
  const hotel = await createHotel(hotelData);
  return hotel;
}

export async function getHotelByIdService(id:number){
  const hotel = await getHotelById(id);
  return hotel;
}

export async function getAllHotelsService(){
  const hotels = await getAllHotels();
  return hotels;
}

export async function softDeleteHotelService(id:number){
 const hotel = await softDeleteHotel(id);
 return hotel;
}
