import {
  Model,
  DataTypes,
  type CreationOptional,
  type ForeignKey,
  type InferAttributes,
  type InferCreationAttributes
} from 'sequelize';
import sequelize from './sequelize.ts';
import Apartment from './apartment.ts';

class RoomCategory extends Model<InferAttributes<RoomCategory>, InferCreationAttributes<RoomCategory>> {
  declare id: CreationOptional<number>;
  declare apartmentId: ForeignKey<Apartment['id']>;
  declare name: string;
  declare description: CreationOptional<string | null>;
  declare roomType: string;
  declare maxGuests: number;
  declare bedrooms: CreationOptional<number>;
  declare beds: CreationOptional<number>;
  declare bathrooms: CreationOptional<number>;
  declare basePricePerNight: number;
  
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

RoomCategory.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  apartmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'apartments',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  },
  roomType: {
    type: DataTypes.ENUM('entire_place', 'private_room', 'shared_room', 'hotel_room'),
    allowNull: false
  },
  maxGuests: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  beds: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  basePricePerNight: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  }
}, {
  sequelize,
  modelName: 'RoomCategory',
  tableName: 'room_categories',
  underscored: true,
  timestamps: true,
  paranoid: true
})

RoomCategory.belongsTo(Apartment, { foreignKey: 'apartmentId', as: 'apartment' });
Apartment.hasMany(RoomCategory, { foreignKey: 'apartmentId', as: 'roomCategories' });

export default RoomCategory;