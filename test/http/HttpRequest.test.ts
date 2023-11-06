// Copyright (c) .NET Foundation. All rights reserved.
// Licensed under the MIT License.

import 'mocha';
import * as chai from 'chai';
import { expect } from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { File } from 'undici';
import { HttpRequest } from '../../src/http/HttpRequest';

chai.use(chaiAsPromised);

describe('HttpRequest', () => {
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
