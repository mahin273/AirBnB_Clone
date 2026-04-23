import logger from '../config/logger.ts';
import Hotel from '../db/models/hotel.ts';
import type { createHotelDto } from '../dto/hotel.dto.ts';
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
  logger.info(`Hotel fetched successfully with id: ${id}`);
  return hotel;
}

export async function getAllHotels(){
const hotels = await Hotel.findAll(
  {
    where:{
      deletedAt:null,
    }
  }
);
if(!hotels){
  throw new NotFoundError();
}
logger.info(`Hotels Found:${hotels.length}`);
return hotels;
}


export async function softDeleteHotel(id:number){
  const hotel = await Hotel.findByPk(id);
  if(!hotel){
    logger.warn(`Hotel not found with id: ${id}`);
    throw new NotFoundError();
  }
hotel.deletedAt= new Date();
await hotel.save();
logger.info(`Hotel with id: ${id} has been soft deleted`);

}
