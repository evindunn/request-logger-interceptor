## Description

A request logger interceptor for NestJS

## Installation

```bash
$ npm install @evindunn/request-logger-interceptor
```

## Usage
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestLoggerInterceptor } from '@evindunn/request-logger-interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new RequestLoggerInterceptor());
  await app.listen(3000);
}
bootstrap();
```

Will produce nginx/apache -style logs on each request:
```
[Nest] 47399  - 12/06/2021, 10:29:11 PM LOG [HTTP] ::ffff:127.0.0.1 "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:94.0) Gecko/20100101 Firefox/94.0" - POST /api/v1/users/login 201 0 - 1ms
```

## Building

```bash
$ npm run build
```

## Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```
