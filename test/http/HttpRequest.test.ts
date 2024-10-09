// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { HttpRequest } from '../../src/http/HttpRequest';

chai.use(chaiAsPromised);

describe('HttpRequest', () => {
    it('clone', async () => {
        const req = new HttpRequest({
            method: 'POST',
            url: 'http://localhost:7071/api/helloWorld',
            body: {
                string: 'body1',
            },
            headers: {
                a: 'b',
            },
            params: {
                c: 'd',
            },
            query: {
                e: 'f',
            },
        });
        const req2 = req.clone();
        expect(await req.text()).to.equal('body1');
        expect(await req2.text()).to.equal('body1');

        expect(req.headers).to.not.equal(req2.headers);
        expect(req.headers).to.deep.equal(req2.headers);

        expect(req.params).to.not.equal(req2.params);
        expect(req.params).to.deep.equal(req2.params);

        expect(req.query).to.not.equal(req2.query);
        expect(req.query).to.deep.equal(req2.query);
    });

    describe('formData', () => {
        const multipartContentType = 'multipart/form-data; boundary=----WebKitFormBoundaryeJGMO2YP65ZZXRmv';
        function createFormRequest(data: string, contentType: string = multipartContentType): HttpRequest {
            // Form data always uses CRLF instead of LF
            // https://www.rfc-editor.org/rfc/rfc2046#section-4.1.1
            data = data.replace(/\r?\n/g, '\r\n');

            return new HttpRequest({
                method: 'POST',
                url: 'http://localhost:7071/api/HttpForm1',
                body: {
                    bytes: Buffer.from(data),
                },
                headers: {
                    'content-type': contentType,
                },
            });
        }

        it('hello world', async () => {
            const req = createFormRequest(`------WebKitFormBoundaryeJGMO2YP65ZZXRmv
Content-Disposition: form-data; name="name"

Azure Functions
------WebKitFormBoundaryeJGMO2YP65ZZXRmv
Content-Disposition: form-data; name="greeting"

Hello
------WebKitFormBoundaryeJGMO2YP65ZZXRmv--
`);

            const parsedForm = await req.formData();

            expect(parsedForm.has('name')).to.equal(true);
            expect(parsedForm.get('name')).to.equal('Azure Functions');

            expect(parsedForm.has('greeting')).to.equal(true);
            expect(parsedForm.get('greeting')).to.equal('Hello');
        });

        it('file', async () => {
            const req = createFormRequest(`------WebKitFormBoundaryeJGMO2YP65ZZXRmv
Content-Disposition: form-data; name="myfile"; filename="test.txt"
Content-Type: text/plain

hello
world
------WebKitFormBoundaryeJGMO2YP65ZZXRmv--
`);

            const parsedForm = await req.formData();
            expect(parsedForm.has('myfile')).to.equal(true);
            const file = <File>parsedForm.get('myfile');
            expect(file.name).to.equal('test.txt');
            expect(file.type).to.equal('text/plain');
            expect(await file.text()).to.equal(`hello\r\nworld`);
        });

        it('duplicate parts', async () => {
            const req = createFormRequest(`------WebKitFormBoundaryeJGMO2YP65ZZXRmv
Content-Disposition: form-data; name="dupeField"

value1
------WebKitFormBoundaryeJGMO2YP65ZZXRmv
Content-Disposition: form-data; name="dupeField"

value2
------WebKitFormBoundaryeJGMO2YP65ZZXRmv--
`);

            const parsedForm = await req.formData();
            expect(parsedForm.has('dupeField')).to.equal(true);
            expect(parsedForm.get('dupeField')).to.equal('value1');

            expect(parsedForm.getAll('dupeField')).to.deep.equal(['value1', 'value2']);
        });

        it('url encoded', async () => {
            const req = createFormRequest('name=Azure+Functions&greeting=Hello', 'application/x-www-form-urlencoded');

            const parsedForm = await req.formData();

            expect(parsedForm.has('name')).to.equal(true);
            expect(parsedForm.get('name')).to.equal('Azure Functions');

            expect(parsedForm.has('greeting')).to.equal(true);
            expect(parsedForm.get('greeting')).to.equal('Hello');
        });

        it('Unsupported content type', async () => {
            const contentTypes = ['application/octet-stream', 'application/json', 'text/plain', 'invalid'];
            for (const contentType of contentTypes) {
                const req = createFormRequest('', contentType);
                await expect(req.formData()).to.eventually.be.rejectedWith(/Could not parse content as FormData/i);
            }
        });
    });
});
