import { Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from 'sequelize';
import sequelize from './sequelize.ts';
class Hotel extends Model<InferAttributes<Hotel>,InferCreationAttributes<Hotel>>{
  declare id: CreationOptional<number>;
  declare name: string;
  declare address: string;
  declare location: string;
  declare country: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare rating: CreationOptional<number>;
  declare ratingCount: CreationOptional<number>;
}

Hotel.init({
  id: {
    type: 'INT',
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: 'VARCHAR(255)',
    allowNull: false
  },
  address: {
    type: 'VARCHAR(255)',
    allowNull: false
  },
  location: {
    type: 'VARCHAR(100)',
    allowNull: false
  },
  country: {
    type: 'VARCHAR(100)',
    allowNull: false
  },
  createdAt: {
    type: 'TIMESTAMP',
    defaultValue: new Date()
  },
  updatedAt: {
    type: 'TIMESTAMP',
    defaultValue: new Date()
  },
  rating:{
    type:'FLOAT',
    defaultValue:0
  },
  ratingCount:{
    type:'INT',
    defaultValue:0
  }
},{
  sequelize,
  modelName:'Hotel',
  tableName:'hotels',
  underscored:true,
  timestamps:true,
})

export default Hotel;
