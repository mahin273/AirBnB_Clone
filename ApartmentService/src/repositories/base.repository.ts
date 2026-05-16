import { Model, type CreationAttributes, type ModelStatic } from "sequelize";
import { NotFoundError } from "../utils/errors/app.error.ts";
import logger from "../config/logger.ts";

abstract class BaseRepository<T extends Model> {

    protected model: ModelStatic<T>;

    constructor(model: ModelStatic<T>) {
        this.model = model;
    }

    get modelName(): string {
        return this.model.name;
    }

    async findAll(): Promise<T[]> {
        const record = await this.model.findAll();
        if(!record){
            throw new NotFoundError();
        }
        logger.info(`${this.modelName} - findAll: ${record.length} records found`);
        return record;
    }

    async findById(id: number): Promise<T | null> {
        const record = await this.model.findByPk(id);
        if(!record){
            throw new NotFoundError();
        }
        logger.info(`${this.modelName} - findById: record fetched with id ${id}`);
        return record;
    }

    async create(data: CreationAttributes<T>): Promise<T> {
        const record = await this.model.create(data);
        logger.info(`${this.modelName} - create: record created successfully`);
        return record;
    }

    async update(id: number, data: Partial<T>): Promise<T | null> {
        const record = await this.model.findByPk(id);
        if (!record) {
            return null;
        }
        await record.update(data);
        logger.info(`${this.modelName} - update: record with id ${id} updated successfully`);
        return record;
    }

    async softDelete(id:number):Promise<T|null>{
        const record = await this.model.findByPk(id);
        if(!record){
            throw new NotFoundError();
        }
        await record.destroy();
        logger.info(`${this.modelName} - softDelete: record with id ${id} soft deleted`);
        return record;
    }

}

export default BaseRepository;
