import fetch from 'node-fetch';

test("send invalid request back if id is bad", async () => {
  const response = await fetch(`${process.env.TEST_HOST}/confirm/1111`);
  const text = await response.text();
  expect(text).toEqual(JSON.stringify({ message: "bad request" }));
})