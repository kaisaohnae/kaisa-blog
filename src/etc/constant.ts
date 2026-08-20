const SERVER_URL = {
  API: process.env.NEXT_PUBLIC_API_URL,
};
Object.freeze(SERVER_URL);

const MESSAGE = {
  DATA_NOT_FOUND: '조회된 데이터가 없습니다.'
}
Object.freeze(MESSAGE);

export {
  SERVER_URL, MESSAGE
};
