const {
    timestamp,
    hall_id,
    seance_id,
    filmName,
    hall_name,
    seance_time,
    placesString,
    hallResultConfig,
  } = JSON.parse(sessionStorage.getItem("session"));
  
  const [
    ticketTitleNode,
    ticketchairsNode,
    ticketHallNode,
    ticketStartNode,
    buttonAcceptinNode,
  ] = [
    ".ticket__title",
    ".ticket__chairs",
    ".ticket__hall",
    ".ticket__start",
    ".acceptin-button",
  ].map((classStr) => document.querySelector(classStr));
  
  const main = async () => {
    await createRequestPOST(
      `event=sale_add&timestamp=${timestamp}&hallId=${hall_id}&seanceId=${seance_id}&hallConfiguration=${hallResultConfig}`
    );
  
    ticketTitleNode.innerHTML = filmName;
    ticketHallNode.innerHTML = hall_name.split("Зал")[1];
    ticketStartNode.innerHTML = seance_time;
    ticketchairsNode.innerHTML = placesString;
  
    const qrString = `Фильм: ${filmName}, 
      Начало сеанса: ${hall_name}, 
      Зал: ${seance_time}, 
      Ряд/Место: ${placesString}
      `;
    const qrcode = QRCreator(qrString, { image: "SVG" });
  
    const content = (qrcode) => {
      return qrcode.error
        ? `Недопустимые исходные данные ${qrcode.error}`
        : qrcode.result;
    };
  
    document.querySelector(".ticket__info-qr").append(content(qrcode));
  };
  
  main();