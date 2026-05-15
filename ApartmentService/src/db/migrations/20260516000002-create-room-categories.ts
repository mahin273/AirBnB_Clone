import { DataTypes, QueryInterface } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('room_categories', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
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
      room_type: {
        type: DataTypes.ENUM('entire_place', 'private_room', 'shared_room', 'hotel_room'),
        allowNull: false
      },
      max_guests: {
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
      base_price_per_night: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null
      }
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('room_categories');
  }
};
