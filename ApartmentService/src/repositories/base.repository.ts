import { Model, type CreationAttributes, type ModelStatic } from "sequelize";
import { NotFoundError } from "../utils/errors/app.error.ts";
abstract class BaseRepository<T extends Model> {

    protected model: ModelStatic<T>;

    constructor(model: ModelStatic<T>) {
        this.model = model;
    }

    async findAll(): Promise<T[]> {
        const record = await this.model.findAll();
        if(!record){
            throw new NotFoundError();
        }
        return record;
    }

    async findById(id: number): Promise<T | null> {
        const record = await this.model.findByPk(id);
        if(!record){
            throw new NotFoundError();
        }
        return record;
    }

    async create(data: CreationAttributes<T>): Promise<T> {
        const record = await this.model.create(data);
        return record;
    }

    async update(id: number, data: Partial<T>): Promise<T | null> {
        const record = await this.model.findByPk(id);
        if (!record) {
            return null;
        }
        await record.update(data);
        return record;
    }

    async softDelete(id:number):Promise<T|null>{
        const record = await this.model.findByPk(id);
        if(!record){
            throw new NotFoundError();
        }
        await record.destroy();
        return record;
    }


}

export default BaseRepository;
