import type { createApartmentDto } from '../dto/apartment.dto.ts';
import { apartmentRepository } from '../repositories/apartment.repository.ts';

export async function createApartmentService(apartmentData: createApartmentDto) {
  const apartment = await apartmentRepository.create(apartmentData);
  return apartment;
}

export async function getApartmentByIdService(id: number) {
  const apartment = await apartmentRepository.findById(id);
  return apartment;
}

export async function getAllApartmentsService() {
  const apartments = await apartmentRepository.findAll();
  return apartments;
}

export async function softDeleteApartmentService(id: number) {
  const apartment = await apartmentRepository.softDelete(id);
  return apartment;
}

