import {app} from './app.ts'


const PORT = Number(process.env.PORT) || 3333;
const HOST = process.env.HOST || "0.0.0.0";

const start = async () => {
  try {
    // const app = await App();
    await app.listen({ port: PORT, host: HOST });
    console.log(`🚀 Server rodando em http://${HOST}:${PORT}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();