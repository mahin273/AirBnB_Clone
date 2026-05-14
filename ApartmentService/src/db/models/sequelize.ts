import { Sequelize } from 'sequelize';
import { dbConfig } from '../../config/index.ts';

const sequelize = new Sequelize(
  dbConfig.DB_NAME,
  dbConfig.DB_USER,
  dbConfig.DB_PASSWORD, {
  host: dbConfig.DB_HOST,
  dialect: 'mysql',
  logging: true
});

export default sequelize;

