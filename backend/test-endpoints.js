const http = require('http');

const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}/api/positions`;

function request(url, method, body = null) {
  return new Promise((resolve, reject) => {
    const { URL } = require('url');
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (e) => reject(e));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  try {
    console.log('--- 1. Create CEO ---');
    const ceoRes = await request(BASE_URL, 'POST', { name: 'CEO', description: 'Chief Executive Officer' });
    console.log(ceoRes.data);
    const ceoId = ceoRes.data.id;

    console.log('\n--- 2. Create CTO (child of CEO) ---');
    const ctoRes = await request(BASE_URL, 'POST', { name: 'CTO', description: 'Chief Technology Officer', parentId: ceoId });
    console.log(ctoRes.data);
    const ctoId = ctoRes.data.id;

    console.log('\n--- 3. Create Developer (child of CTO) ---');
    const devRes = await request(BASE_URL, 'POST', { name: 'Developer', description: 'Software Developer', parentId: ctoId });
    console.log(devRes.data);
    const devId = devRes.data.id;

    console.log('\n--- 4. Get Position Tree ---');
    const treeRes = await request(`${BASE_URL}/tree`, 'GET');
    console.log(JSON.stringify(treeRes.data, null, 2));

    console.log('\n--- 5. Get CEO Details ---');
    const ceoDetailRes = await request(`${BASE_URL}/${ceoId}`, 'GET');
    console.log(ceoDetailRes.data);

    console.log('\n--- 6. Get Children of CEO ---');
    const ceoChildrenRes = await request(`${BASE_URL}/${ceoId}/children`, 'GET');
    console.log(JSON.stringify(ceoChildrenRes.data, null, 2));

    console.log('\n--- 7. Update Developer ---');
    const updateRes = await request(`${BASE_URL}/${devId}`, 'PATCH', { name: 'Senior Developer' });
    console.log(updateRes.data);

    console.log('\n--- 8. Delete Senior Developer ---');
    const deleteRes = await request(`${BASE_URL}/${devId}`, 'DELETE');
    console.log(deleteRes.data);

    console.log('\n--- 9. Get Position Tree After Deletion ---');
    const finalTreeRes = await request(`${BASE_URL}/tree`, 'GET');
    console.log(JSON.stringify(finalTreeRes.data, null, 2));

    console.log('\n✅ All tests completed successfully!');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

runTests();
