import { type CreationAttributes } from 'sequelize';
import logger from '../config/logger.ts';
import Apartment from '../db/models/apartment.ts';
import BaseRepository from './base.repository.ts';

export class ApartmentRepository extends BaseRepository<Apartment> {
    constructor() {
        super(Apartment);
    }

    async findAll(): Promise<Apartment[]> {
        const apartments = await super.findAll();
        logger.info(`Apartments Found:${apartments.length}`);
        return apartments;
    }

    async findById(id: number): Promise<Apartment | null> {
        const apartment = await super.findById(id);
        logger.info(`Apartment fetched successfully with id: ${id}`);
        return apartment;
    }

    async create(data: CreationAttributes<Apartment>): Promise<Apartment> {
        const apartment = await super.create(data);
        logger.info('Apartment created successfully');
        return apartment;
    }

    async softDelete(id: number): Promise<Apartment | null> {
        const apartment = await super.softDelete(id);
        logger.info(`Apartment with id: ${id} has been soft deleted`);
        return apartment;
    }
}

export const apartmentRepository = new ApartmentRepository();
