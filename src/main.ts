import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import * as ngrok from '@ngrok/ngrok';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
 // const listener = await ngrok.forward({ addr: 80, authtoken: '1waXhWDyIZ5gFr7ChbTNNbC8Q8E_2PwNFNNXwCsw5HD3QnbZY' });

  // Output ngrok url to console
  //console.log(`Ingress established at: ${listener.url()}`);
  await app.listen(80);
}
bootstrap();
