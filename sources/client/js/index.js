const mainNode = document.querySelector("main");
const makeFilmInfoHTML = ({
  film_description,
  film_duration,
  film_name,
  film_origin,
  film_poster,
}) => `
<div class="movie__info">
    <div class="movie__poster">
    <img class="movie__poster-image" alt="${film_name} постер" src="${film_poster}">
    </div>
    <div class="movie__description">
    <h2 class="movie__title">${film_name}</h2>
    <p class="movie__synopsis">${film_description}</p>
    <p class="movie__data">
        <span class="movie__data-duration">${film_duration} минут</span>
        <span class="movie__data-origin">${film_origin}</span>
    </p>
    </div>
</div>
`;

const makeHallSeancesHTML = (film, seances, halls) => {
  const filmSeancesByHallIds = {};

  const filmSeances = seances.filter(
    ({ seance_filmid, seance_hallid }) =>
      seance_filmid === film.film_id &&
      halls.map(({ hall_id }) => hall_id).includes(seance_hallid)
  );

  filmSeances.forEach(
    (seance) =>
      (filmSeancesByHallIds[seance.seance_hallid] = [
        ...(filmSeancesByHallIds[seance.seance_hallid] || []),
        seance,
      ])
  );

  return Object.entries(filmSeancesByHallIds)
    .map(([hallId, seances]) => {
      const seancesHTML = seances
        .map(
          ({ seance_time }) =>
            `<li class="movie-seances__time-block"><a class="movie-seances__time ${
              seance_time <
                `${new Date().getHours()}:${new Date().getMinutes()}` &&
              "disabled-seance"
            }" href="hall.html">${seance_time}</a></li>`
        )
        .join("");

      const hallName = halls.find(
        ({ hall_id }) => hall_id === hallId
      )?.hall_name;
      return `<div class="movie-seances__hall">
      <h3 class="movie-seances__hall-title">${hallName}</h3>
      <ul class="movie-seances__list">
       ${seancesHTML}
      </ul>
    </div>`;
    })
    .join("");
};

const makeSectionsHTML = (films, halls, seances) =>
  films.reduce((acc, film) => {
    const filmHTML = makeFilmInfoHTML(film);
    const hallSeancesHTML = makeHallSeancesHTML(film, seances, halls);
    const sectionHTML = `<section class="movie">${filmHTML}${hallSeancesHTML}</section>`;
    return acc + sectionHTML;
  }, "");

const navNode = document.querySelector(".page-nav");

const makeWeekDay = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const makeNavInnerHTML = () => {
  const currentDate = new Date();

  return [1, 2, 3, 4, 5, 6]
    .map((_, index) => {
      const dayHTML = `<a class="page-nav__day ${
        index || "page-nav__day_today page-nav__day_chosen"
      } ${
        [6, 0].includes(currentDate.getDay()) && "page-nav__day_weekend"
      }" href="#">
        <span class="page-nav__day-week">${makeWeekDay(
          currentDate.toLocaleString("ru-RU", { weekday: "short" })
        )}</span>
        <span class="page-nav__day-number">${currentDate.getDate()}</span>
      </a>`;
      currentDate.setDate(currentDate.getDate() + 1);
      return dayHTML;
    })
    .join("");
};

const addListenerToNav = (navNode, halls, seances) => {
  navNode.childNodes.forEach((node) =>
    node.addEventListener("click", () => {
      navNode.childNodes.forEach((el) =>
        el.classList.remove("page-nav__day_chosen")
      );
      node.classList.add("page-nav__day_chosen");
      disableSeances(navNode, halls, seances);
    })
  );
};

const setUpHallConfig = (args) => {
  sessionStorage.setItem("session", JSON.stringify({ ...args }));
};

const disableSeances = (navNode, halls, seances) => {
  const seancesTimes = document.querySelectorAll(".movie-seances__time");

  const currentDate = new Date();
  const currentTimeText = `${currentDate.getHours()}:${currentDate.getMinutes()}`;

  [...seancesTimes].forEach((sT) => {
    sT.classList.remove("disabled-seance");
    if (
      navNode.firstChild.classList.contains("page-nav__day_chosen") &&
      sT.innerText < currentTimeText
    ) {
      sT.classList.add("disabled-seance");
    } else {
      const navDays = document.querySelectorAll(".page-nav__day");
      const navIndex = [...navDays].findIndex((navDay) =>
        navDay.classList.contains("page-nav__day_chosen")
      );
      const hallName =
        sT.parentElement.parentElement.parentElement.childNodes[1].textContent;
      const hall = halls.find(({ hall_name }) => hall_name === hallName);
      const seanceTime = sT.innerText;
      const filmName =
        sT.offsetParent.querySelector(".movie__title").textContent;
      const seance = seances.find(
        ({ seance_hallid, seance_time }) =>
          seance_time === seanceTime && seance_hallid === hall.hall_id
      );
      const timestamp =
        (new Date().setHours(0, 0, 0, 0) +
          navIndex * 24 * 60 * 60 * 1000 +
          seance.seance_start * 60 * 1000) /
        1000;
      sT.addEventListener("click", () =>
        setUpHallConfig({ ...hall, filmName, ...seance, timestamp })
      );
    }
  });
};

const main = async () => {
  const {
    films: { result: films },
    halls: { result: halls },
    seances: { result: seances },
  } = await createRequestPOST("event=update");

  const hallsFiltered = halls.filter(({ hall_open }) => +hall_open);
  mainNode.innerHTML = makeSectionsHTML(films, hallsFiltered, seances);

  navNode.innerHTML = makeNavInnerHTML();
  disableSeances(navNode, halls, seances);
  addListenerToNav(navNode, halls, seances);
};

main();