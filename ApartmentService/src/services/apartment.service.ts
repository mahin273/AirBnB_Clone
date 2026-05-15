import type { createApartmentDto } from '../dto/apartment.dto.ts';
import { createApartment, getAllApartments, getApartmentById, softDeleteApartment } from '../repositories/apartment.repository.ts';
export async function createApartmentService(apartmentData:createApartmentDto){
  const apartment = await createApartment(apartmentData);
  return apartment;
}

export async function getApartmentByIdService(id:number){
  const apartment = await getApartmentById(id);
  return apartment;
}

export async function getAllApartmentsService(){
  const apartments = await getAllApartments();
  return apartments;
}

export async function softDeleteApartmentService(id:number){
 const apartment = await softDeleteApartment(id);
 return apartment;
}
