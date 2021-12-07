import { RequestLoggerInterceptor } from './request-logger.interceptor';
import { Logger } from '@nestjs/common';
import { log } from 'util';

const testRequest = {
    ip: '127.0.0.1',
    method: 'GET',
    originalUrl: '/',
    get(key: string): string | undefined {
        if (key === 'user-agent') {
            return 'Firefox';
        }
        return undefined;
    },
};

const testResponse = {
    statusCode: 200,
    _contentLength: '1234',
    get(key: string): string | undefined {
        if (key === 'content-length') {
            return this._contentLength;
        }
        return undefined;
    },
    on(eventName, cb) {
        cb();
    },
};

const testContext = {
    switchToHttp() {
        return {
            getRequest() {
                return testRequest;
            },
            getResponse() {
                return testResponse;
            },
            getNext() {
                return null;
            },
        };
    },
};

const testNext = {
    handle() {
        return null;
    },
};

describe('LoggerInterceptor', () => {
    it('should be defined', () => {
        expect(new RequestLoggerInterceptor()).toBeDefined();
    });

    it('should format correctly', () => {
        jest.spyOn(Logger.prototype, 'log').mockImplementation((logStr) => {
            let logStrTarget = `${ testRequest.ip } "${testRequest.get('user-agent')}" - `;
            logStrTarget += `${testRequest.method} ${decodeURIComponent(testRequest.originalUrl)} `;
            logStrTarget += `${testResponse.statusCode} ${testResponse.get('content-length')}`
            const logStrRegexp = new RegExp(`${logStrTarget}(.*)`);
            expect(logStr).toMatch(logStrRegexp);
        });

        const logger = new RequestLoggerInterceptor();
        logger.intercept(testContext as any, testNext);
    });

    it('should not have NaN for Content-Length', function () {
        jest.spyOn(Logger.prototype, 'log').mockImplementation((logStr) => {
            let logStrTarget = `${ testRequest.ip } "${testRequest.get('user-agent')}" - `;
            logStrTarget += `${testRequest.method} ${decodeURIComponent(testRequest.originalUrl)} `;
            logStrTarget += `${testResponse.statusCode} 0`;
            const logStrRegexp = new RegExp(`${logStrTarget}(.*)`);
            expect(logStr).toMatch(logStrRegexp);
        });

        const origContentLength = testResponse._contentLength;

        testResponse._contentLength = undefined;
        const logger = new RequestLoggerInterceptor();
        logger.intercept(testContext as any, testNext);

        testResponse._contentLength = origContentLength;
    });

    afterEach(() => {
        jest.resetAllMocks();
    });
});
