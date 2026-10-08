import type { createApartmentDto } from '../dto/apartment.dto.ts';
import { apartmentRepository } from '../repositories/apartment.repository.ts';
import { ForbiddenError, NotFoundError } from '../utils/errors/app.error.ts';

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

export async function getHostApartmentsService(hostId: number) {
  const apartments = await apartmentRepository.findByHostId(hostId);
  return apartments;
}

export async function softDeleteApartmentService(id: number, requestingUserId: number) {
  const apartment = await apartmentRepository.findById(id);
  if (!apartment) {
    throw new NotFoundError('Apartment not found');
  }
  if (apartment.hostId !== requestingUserId) {
    throw new ForbiddenError('You do not have permission to delete this listing');
  }
  return await apartmentRepository.softDelete(id);
}


