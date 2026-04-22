import logger from '../config/logger.ts';
import Hotel from '../db/models/hotel.ts';
import type{ createHotelDto } from '../dto/hotel.dto.ts';
import { NotFoundError } from '../utils/errors/app.error.ts';

export async function createHotel(hotelData:createHotelDto){
  const hotel = await Hotel.create({
    name:hotelData.name,
    address:hotelData.address,
    location:hotelData.location,
    country:hotelData.country,
    rating:hotelData.rating,
    ratingCount:hotelData.ratingCount,
  });
  logger.info('Hotel created successfully');
  return hotel;
}

export async function getHotelById(id:number){
  const hotel = await Hotel.findByPk(id);
  if(!hotel){
    throw new NotFoundError();
  }
  return hotel;
}
