// room.model.ts
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
import RoomCategory from './roomCategory.ts';

class Room extends Model<InferAttributes<Room>, InferCreationAttributes<Room>> {
  declare id: CreationOptional<number>;
  declare apartmentId: ForeignKey<Apartment['id']>;
  declare categoryId: ForeignKey<RoomCategory['id']>;
  declare roomNumber: string;
  declare floor: CreationOptional<number | null>;
  declare status: CreationOptional<string>;
  declare pricePerNight: number;
  declare isActive: CreationOptional<boolean>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
  declare deletedAt: CreationOptional<Date | null>;
}

Room.init({
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
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'room_categories',
      key: 'id'
    }
  },
  roomNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  floor: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  status: {
    type: DataTypes.ENUM('available', 'booked', 'maintenance'),
    defaultValue: 'available'
  },
  pricePerNight: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  modelName: 'Room',
  tableName: 'rooms',
  underscored: true,
  timestamps: true,
  paranoid: true
})

Room.belongsTo(Apartment, { foreignKey: 'apartmentId', as: 'apartment' })  // ✅ fixed
Apartment.hasMany(Room, { foreignKey: 'apartmentId', as: 'rooms' })        // ✅ fixed

Room.belongsTo(RoomCategory, { foreignKey: 'categoryId', as: 'category' })
RoomCategory.hasMany(Room, { foreignKey: 'categoryId', as: 'rooms' })

export default Room;