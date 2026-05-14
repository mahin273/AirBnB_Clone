//will contain all the basic conf logic for the  server to work
import dotenv from 'dotenv';

type ServerConfig = {
    PORT: number;
}

type DBConfig ={
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    DB_HOST: string;
}
 function loadEnv(){
    dotenv.config();
}
loadEnv();

export const serverConfig: ServerConfig ={
    PORT:Number(process.env.PORT) || 3000
};
export const dbConfig: DBConfig ={
    DB_USER: process.env.DB_USER || 'root',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME || 'testdb',
    DB_HOST: process.env.DB_HOST || '127.0.0.1'
};

