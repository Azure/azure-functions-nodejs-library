// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import { expect } from 'chai';
import 'mocha';
import { getHeaderValue, parseContentDisposition, parseContentType } from '../../src/parsers/parseHeader';

describe('getHeaderValue', () => {
    it('normal', () => {
        expect(getHeaderValue('content-type: text/plain', 'content-type')).to.equal('text/plain');
    });

    it('weird casing', () => {
        expect(getHeaderValue('ConTent-TypE: text/plain', 'cOntent-type')).to.equal('text/plain');
    });

    it('weird spacing', () => {
        expect(getHeaderValue('  Content-Type  :   text/plain  ', 'content-type')).to.equal('text/plain');
    });

    it('with parameter', () => {
        expect(getHeaderValue('Content-Type: text/html; charset=UTF-8', 'content-type')).to.equal(
            'text/html; charset=UTF-8'
        );
    });

    it('with parameter and weird spacing', () => {
        expect(getHeaderValue('  Content-Type:   text/html;   charset=UTF-8  ', 'content-type')).to.equal(
            'text/html;   charset=UTF-8'
        );
    });

    it('missing', () => {
        expect(getHeaderValue('oops: text/plain', 'content-type')).to.equal(null);
    });

    it('invalid', () => {
        expect(getHeaderValue('invalid', 'content-type')).to.equal(null);
    });
});

describe('parseContentType', () => {
    describe('getMediaType', () => {
        function getMediaType(data: string): string {
            return parseContentType(data)[0];
        }

        it('json', () => {
            expect(getMediaType('application/json')).to.equal('application/json');
        });

        it('form', () => {
            expect(getMediaType('multipart/form-data')).to.equal('multipart/form-data');
        });

        it('with semicolon', () => {
            expect(getMediaType('multipart/form-data;')).to.equal('multipart/form-data');
        });

        it('with param', () => {
            expect(getMediaType('multipart/form-data; boundary=----WebKitFormBoundaryeJGMO2YP65ZZXRmv')).to.equal(
                'multipart/form-data'
            );
        });

        it('with multiple params', () => {
            expect(
                getMediaType('multipart/form-data; test=abc; boundary=----WebKitFormBoundaryeJGMO2YP65ZZXRmv')
            ).to.equal('multipart/form-data');
        });

        it('weird whitespace', () => {
            expect(getMediaType('   multipart/form-data;   ')).to.equal('multipart/form-data');
        });

        it('weird whitespace with param', () => {
            expect(
                getMediaType('   multipart/form-data;    boundary=----WebKitFormBoundaryeJGMO2YP65ZZXRmv   ')
            ).to.equal('multipart/form-data');
        });

        it('invalid', () => {
            expect(() => getMediaType('invalid')).to.throw(/content-type.*format/i);
        });
    });

    describe('getFormBoundary', () => {
        function getFormBoundary(data: string): string {
            return parseContentType(data)[1].get('boundary');
        }

        it('normal', () => {
            expect(getFormBoundary('multipart/form-data; boundary=----WebKitFormBoundaryeJGMO2YP65ZZXRmv')).to.equal(
                '----WebKitFormBoundaryeJGMO2YP65ZZXRmv'
            );
        });

        it('semicolon at the end', () => {
            expect(getFormBoundary('multipart/form-data; boundary=----WebKitFormBoundaryeJGMO2YP65ZZXRmv;')).to.equal(
                '----WebKitFormBoundaryeJGMO2YP65ZZXRmv'
            );
        });

        it('different casing', () => {
            expect(getFormBoundary('multipart/form-data; bOunDary=----WebKitFormBoundaryeJGMO2YP65ZZXRmv;')).to.equal(
                '----WebKitFormBoundaryeJGMO2YP65ZZXRmv'
            );
        });

        it('weird whitespace', () => {
            expect(
                getFormBoundary('   multipart/form-data;    boundary=----WebKitFormBoundaryeJGMO2YP65ZZXRmv;   ')
            ).to.equal('----WebKitFormBoundaryeJGMO2YP65ZZXRmv');
        });

        it('quotes', () => {
            expect(getFormBoundary('multipart/form-data; boundary="----WebKitFormBoundaryeJGMO2YP65ZZXRmv"')).to.equal(
                '----WebKitFormBoundaryeJGMO2YP65ZZXRmv'
            );
        });

        it('escaped quotes', () => {
            expect(
                getFormBoundary('multipart/form-data; boundary="----WebKitFormBounda\\"rye\\"JGMO2YP65ZZXRmv"')
            ).to.equal('----WebKitFormBounda"rye"JGMO2YP65ZZXRmv');
        });

        it('multiple params', () => {
            expect(
                getFormBoundary('multipart/form-data; test=abc; boundary=----WebKitFormBoundaryeJGMO2YP65ZZXRmv')
            ).to.equal('----WebKitFormBoundaryeJGMO2YP65ZZXRmv');
        });

        it('multiple params (switch order)', () => {
            expect(
                getFormBoundary('multipart/form-data; boundary=----WebKitFormBoundaryeJGMO2YP65ZZXRmv; test=abc')
            ).to.equal('----WebKitFormBoundaryeJGMO2YP65ZZXRmv');
        });

        it('extra boundary inside quoted string', () => {
            expect(
                getFormBoundary(
                    'multipart/form-data; test="boundary=nope"; boundary=----WebKitFormBoundaryeJGMO2YP65ZZXRmv'
                )
            ).to.equal('----WebKitFormBoundaryeJGMO2YP65ZZXRmv');
        });

        it('extra boundary inside quoted string (switch order)', () => {
            expect(
                getFormBoundary(
                    'multipart/form-data; boundary=----WebKitFormBoundaryeJGMO2YP65ZZXRmv; test="boundary=nope"'
                )
            ).to.equal('----WebKitFormBoundaryeJGMO2YP65ZZXRmv');
        });

        it('missing boundary', () => {
            expect(() => getFormBoundary('multipart/form-data; oops=----WebKitFormBoundaryeJGMO2YP65ZZXRmv')).to.throw(
                /failed to find.*boundary/i
            );
        });
    });
});

describe('parseContentDisposition', () => {
    // Largely uses the same logic as parseContentType, so only going to add a simple test
    it('normal', () => {
        const [disposition, params] = parseContentDisposition('form-data; name=myfile; filename="test.txt"');
        expect(disposition).to.equal('form-data');
        expect(params.get('name')).to.equal('myfile');
        expect(params.get('filename')).to.equal('test.txt');
    });
});
