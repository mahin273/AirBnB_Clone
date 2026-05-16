import Apartment from '../db/models/apartment.ts';
import BaseRepository from './base.repository.ts';

export class ApartmentRepository extends BaseRepository<Apartment> {
    constructor() {
        super(Apartment);
    }
}

export const apartmentRepository = new ApartmentRepository();
