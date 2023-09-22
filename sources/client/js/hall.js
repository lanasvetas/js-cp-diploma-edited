const hallData = JSON.parse(sessionStorage.getItem("session"));
const {
  timestamp,
  hall_id,
  seance_id,
  seance_time,
  filmName,
  hall_name,
  hall_price_standart,
  hall_price_vip,
} = hallData;

const [
  configHallNode,
  buyingInfoTitleNode,
  buyingInfoStartNode,
  buyingInfoHallNode,
  priceStandartNode,
  priceVipNode,
  buttonAcceptinNode,
  schemaNode,
] = [
  ".conf-step__wrapper",
  ".buying__info-title",
  ".buying__info-start",
  ".buying__info-hall",
  ".price-standart",
  ".price-vip",
  ".acceptin-button",
  ".buying",
].map((classStr) => document.querySelector(classStr));

schemaNode.addEventListener("dblclick", () =>
  schemaNode.classList.toggle("zooming")
);
buttonAcceptinNode.setAttribute("disabled", true);
buyingInfoTitleNode.innerHTML = filmName;
buyingInfoStartNode.innerHTML = `Начало сеанса: ${seance_time}`;
buyingInfoHallNode.innerHTML = hall_name;
priceStandartNode.innerHTML = hall_price_standart;
priceVipNode.innerHTML = hall_price_vip;

const toggleAcceptinButton = () => {
  const selectedChairs = [
    ...document.querySelectorAll(".conf-step__row .conf-step__chair_selected"),
  ];
  selectedChairs.length
    ? buttonAcceptinNode.removeAttribute("disabled")
    : buttonAcceptinNode.setAttribute("disabled", true);
};

const main = async () => {
  const hallConfig = await createRequestPOST(
    `event=get_hallConfig&timestamp=${timestamp}&hallId=${hall_id}&seanceId=${seance_id}`
  );
  if (hallConfig) {
    configHallNode.innerHTML = hallConfig;
  }

  const chairs = document.querySelectorAll(".conf-step__chair");

  chairs.forEach((chair) => {
    chair.addEventListener("click", ({ target }) => {
      if (
        target.parentElement.classList.contains("conf-step__legend-price") ||
        target.classList.contains("conf-step__chair_taken") ||
        target.classList.contains("conf-step__chair_disabled")
      ) {
        return;
      }
      target.classList.toggle("conf-step__chair_selected");
      toggleAcceptinButton();
    });
  });

  buttonAcceptinNode.addEventListener("click", () => {
    const selectedChairs = document.querySelectorAll(
      ".conf-step__row .conf-step__chair_selected"
    );
    const rebuildedSelectedChairs = [...selectedChairs].map((chair) => {
      const rowNode = chair.parentElement;
      const rowIndex = [...rowNode.parentElement.children].indexOf(rowNode) + 1;
      const chairIndex = [...rowNode.children].indexOf(chair) + 1;
      const chairType = chair.classList.contains("conf-step__chair_standart")
        ? "s"
        : "v";
      return { rowIndex, chairIndex, chairType };
    });

    sessionStorage.setItem(
      "session",
      JSON.stringify({
        ...hallData,
        chairs: rebuildedSelectedChairs,
        hallResultConfig: document.querySelector(".conf-step__wrapper")
          .innerHTML,
      })
    );

    window.location.href = [
      ...window.location.href.split("/").slice(0, -1),
      "payment.html",
    ].join("/");
  });
};

main();