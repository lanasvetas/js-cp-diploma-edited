const paymentData = JSON.parse(sessionStorage.getItem("session"));

const [
  ticketTitleNode,
  ticketchairsNode,
  ticketHallNode,
  ticketStartNode,
  ticketCostNode,
] = [
  ".ticket__title",
  ".ticket__chairs",
  ".ticket__hall",
  ".ticket__start",
  ".ticket__cost",
].map((classStr) => document.querySelector(classStr));

const main = () => {
  ticketTitleNode.innerHTML = paymentData.filmName;
  ticketHallNode.innerHTML = paymentData.hall_name.split("Зал")[1];
  ticketStartNode.innerHTML = paymentData.seance_time;
  const { placesString, cost } = paymentData.chairs.reduce(
    (acc, { rowIndex, chairIndex, chairType }) => ({
      placesString: [...acc.placesString, `${chairIndex}/${rowIndex}`],
      cost:
        acc.cost +
        +(chairType === "s"
          ? paymentData.hall_price_standart
          : paymentData.hall_price_vip),
    }),
    { placesString: [], cost: 0 }
  );

  ticketchairsNode.innerHTML = placesString.join(", ");
  ticketCostNode.innerHTML = cost;

  sessionStorage.setItem("session", JSON.stringify({...paymentData, placesString: placesString.join(", ")}))
};

main();