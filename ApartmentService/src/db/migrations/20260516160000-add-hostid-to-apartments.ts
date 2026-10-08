import { DataTypes, type QueryInterface } from 'sequelize';

export default {
  async up(queryInterface: QueryInterface) {
    await queryInterface.addColumn('apartments', 'host_id', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.removeColumn('apartments', 'host_id');
  },
};
