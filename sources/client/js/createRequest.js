BASE_URL = "https://jscp-diplom.netoserver.ru/";

PARAMS = {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
};

const createRequestPOST = async (body) => {
  try {
    const response = await fetch(BASE_URL, { ...PARAMS, body });
    const data = await response.json();
    return data;
  } catch (e) {
    console.error(e);
  }
};