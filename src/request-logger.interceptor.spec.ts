import { RequestLoggerInterceptor } from './request-logger.interceptor';
import { Logger } from '@nestjs/common';
import { log } from 'util';

const testRequest = {
    ip: '127.0.0.1',
    method: 'GET',
    originalUrl: '/',
    _userAgent: 'Firefox',
    get(key: string): string | undefined {
        if (key === 'user-agent') {
            return this._userAgent;
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

function getLogStrExpected(undefineUserAgent = false, undefineContentLength = false): RegExp {
    const userAgent = undefineUserAgent ? '' : testRequest.get('user-agent');
    const contentLength = undefineContentLength ? 0 : testResponse.get('content-length');

    let logStrTarget = `${ testRequest.ip } "${userAgent}" - `;
    logStrTarget += `${testRequest.method} ${decodeURIComponent(testRequest.originalUrl)} `;
    logStrTarget += `${testResponse.statusCode} ${contentLength}`;
    return new RegExp(`${logStrTarget} - \\d+ms`);
}

describe('LoggerInterceptor', () => {
    it('should be defined', () => {
        expect(new RequestLoggerInterceptor()).toBeDefined();
    });

    it('should format correctly', () => {
        jest.spyOn(Logger.prototype, 'log').mockImplementation((logStr) => {
            expect(logStr).toMatch(getLogStrExpected());
        });

        const logger = new RequestLoggerInterceptor();
        logger.intercept(testContext as any, testNext);
    });

    it('should handle a blank User-Agent properly', () => {
        jest.spyOn(Logger.prototype, 'log').mockImplementation((logStr) => {
            expect(logStr).toMatch(getLogStrExpected(true));
        });

        const origUserAgent = testRequest._userAgent;

        testRequest._userAgent = undefined;
        const logger = new RequestLoggerInterceptor();
        logger.intercept(testContext as any, testNext);

        testRequest._userAgent = origUserAgent;
    });

    it('should handle a blank Content-Length correctly', function () {
        jest.spyOn(Logger.prototype, 'log').mockImplementation((logStr) => {
            expect(logStr).toMatch(getLogStrExpected(false, true));
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
