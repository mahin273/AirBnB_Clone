import Apartment from '../db/models/apartment.ts';
import BaseRepository from './base.repository.ts';

export class ApartmentRepository extends BaseRepository<Apartment> {
    constructor() {
        super(Apartment);
    }

    async findByHostId(hostId: number): Promise<Apartment[]> {
        return await this.model.findAll({
            where: { hostId },
        });
    }
}


export const apartmentRepository = new ApartmentRepository();
