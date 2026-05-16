import {  QueryInterface } from 'sequelize';
export default {
  async up (queryInterface:QueryInterface, Sequelize:any) {
    await queryInterface.addColumn('room_categories', 'apartment_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'apartments',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down (queryInterface:QueryInterface, Sequelize:any) {
    await queryInterface.removeColumn('room_categories', 'apartment_id');
  }
};
