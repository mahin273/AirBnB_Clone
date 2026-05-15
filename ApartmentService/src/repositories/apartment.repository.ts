import logger from '../config/logger.ts';
import Apartment from '../db/models/apartment.ts';
import type { createApartmentDto } from '../dto/apartment.dto.ts';
import { NotFoundError } from '../utils/errors/app.error.ts';

export async function createApartment(apartmentData:createApartmentDto){
  const apartment = await Apartment.create({
    name:apartmentData.name,
    address:apartmentData.address,
    location:apartmentData.location,
    country:apartmentData.country,
    rating:apartmentData.rating,
    ratingCount:apartmentData.ratingCount,
  });
  logger.info('Apartment created successfully');
  return apartment;
}

export async function getApartmentById(id:number){
  const apartment = await Apartment.findByPk(id);
  if(!apartment){
    throw new NotFoundError();
  }
  logger.info(`Apartment fetched successfully with id: ${id}`);
  return apartment;
}

export async function getAllApartments(){
  const apartments = await Apartment.findAll();
  if(!apartments){
    throw new NotFoundError();
  }
  logger.info(`Apartments Found:${apartments.length}`);
  return apartments;
}


export async function softDeleteApartment(id:number){
  const apartment = await Apartment.findByPk(id);
  if(!apartment){
    logger.warn(`Apartment not found with id: ${id}`);
    throw new NotFoundError();
  }
  await apartment.destroy();
  logger.info(`Apartment with id: ${id} has been soft deleted`);
  return apartment;
}
