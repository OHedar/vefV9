import { getLaunch, searchLaunches } from './api.js';
import { el, empty } from './elements.js';

function goBack() {
  window.history.back();
}

function attachBackButtonListener() {
  const backButton = document.querySelector('.back a');
  if (backButton) {
    backButton.addEventListener('click', (e) => {
      e.preventDefault();
      goBack();
    });
  }
}

/**
 * Býr til leitarform.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string | undefined} query Leitarstrengur.
 * @returns {HTMLElement} Leitarform.
 */
export function renderSearchForm(searchHandler, query = undefined) {
  const form = el(
    'form',
    {class: 'leita'},
    el('input', { value: query ?? '', name: 'query' }),
    el('button', {}, 'Leita')
  );

  form.addEventListener('submit', searchHandler);

  return form;
}

/**
 * Setur „loading state“ skilabað meðan gögn eru sótt.
 * @param {HTMLElement} parentElement Element sem á að birta skilbaoð í.
 * @param {Element | undefined} searchForm Leitarform sem á að gera óvirkt.
 */
function setLoading(parentElement, searchForm = undefined) {
  let loadingElement = parentElement.querySelector('.loading');

  if (!loadingElement) {
    loadingElement = el('div', { class: 'loading' }, 'Sæki gögn...');
    parentElement.appendChild(loadingElement);
  }

  if (!searchForm) {
    return;
  }

  const button = searchForm.querySelector('button');

  if (button) {
    button.setAttribute('disabled', 'disabled');
  }
}

/**
 * Fjarlægir „loading state“.
 * @param {HTMLElement} parentElement Element sem inniheldur skilaboð.
 * @param {Element | undefined} searchForm Leitarform sem á að gera virkt.
 */
function setNotLoading(parentElement, searchForm = undefined) {
  const loadingElement = parentElement.querySelector('.loading');

  if (loadingElement) {
    loadingElement.remove();
  }

  if (!searchForm) {
    return;
  }

  const disabledButton = searchForm.querySelector('button[disabled]');

  if (disabledButton) {
    disabledButton.removeAttribute('disabled');
  }
}

/**
 * Birta niðurstöður úr leit.
 * @param {import('./api.types.js').Launch[] | null} results Niðurstöður úr leit
 * @param {string} query Leitarstrengur.
 */
function createSearchResults(results, query) {
  /* TODO útfæra */
  const list = el('ul', { class: 'results' });

  if (!results) {
    const noResultsElement = el('li', {}, `Villa við leit að ${query}`);
    list.appendChild(noResultsElement);
    return list;
  }

  if (results.length === 0||results==null) {
    const noResultsElement = el(
      'li',
      {},
      `Engar niðurstöður fyrir leit að ${query}`
    );
    list.appendChild(noResultsElement);
    return list;

  }

  for (const result of results) {
    const resultElement = el('li',{ class: 'results_result' },
      el('div', { class: 'result' },
        el('h3', { class: 'result_name' },
          el('a', { href: `/?id=${result.id}` }, result.name),
          ),
        el('p', { class: 'result_status' }, `🚀 ${result.status}`),
        el('p', { class: 'result_mission' }, `Mission: ${result.mission}`),
      ),
    );
  
    list.appendChild(resultElement);
  }

  return list;
}


/**
 *
 * @param {HTMLElement} parentElement Element sem á að birta niðurstöður í.
 * @param {Element} searchForm Form sem á að gera óvirkt.
 * @param {string} query Leitarstrengur.
 */
export async function searchAndRender(parentElement, searchForm, query) {
  const mainElement = parentElement.querySelector('main');

  if (!mainElement) {
    console.warn('fann ekki <main> element');
    return;
  }

  // Fjarlægja fyrri niðurstöður
  const resultsElement = mainElement.querySelector('.results');
  if (resultsElement) {
    resultsElement.remove();
  }

 const existingBackElement = mainElement.querySelector('.back');
  if (existingBackElement) {
    existingBackElement.remove();
  } 

  setLoading(mainElement, searchForm);


  const results = await searchLaunches(query);
  setNotLoading(mainElement, searchForm);

  const resultsEl = createSearchResults(results, query);

  const backElement = el('div',{ class: 'back' },
    el('a', { href: '/' }, 'Til baka'),
  );

  mainElement.appendChild(resultsEl);
  mainElement.appendChild(backElement);
}


/**
 * Sýna forsíðu, hugsanlega með leitarniðurstöðum.
 * @param {HTMLElement} parentElement Element sem á að innihalda forsíðu.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string | undefined} query Leitarorð, ef eitthvað, til að sýna niðurstöður fyrir.
 */
export function renderFrontpage(
  parentElement,
  searchHandler,
  query = undefined
) {
  empty(parentElement);
  const heading = el('h1', { class: 'heading', 'data-foo': 'bar' }, 'Geimskotaleitin 🚀'
  );
  const searchForm = renderSearchForm(searchHandler, query);

  const container = el('main', {}, heading, searchForm);
  parentElement.appendChild(container);

  if (!query) {
    return;
  }

  searchAndRender(parentElement, searchForm, query);
}

/**
 * Sýna geimskot.
 * @param {HTMLElement} parentElement Element sem á að innihalda geimskot.
 * @param {string} id Auðkenni geimskots.
 */
export async function renderDetails(parentElement, id) {

/* Loading */
setLoading(parentElement);
const result = await getLaunch(id);
setNotLoading(parentElement);


  const container = el('main', {});
  const backElement = el(
    'div',
    { class: 'back' },
    el('a', { href: '/' }, 'Til baka'),
  ); 

  // Tómt og villu state, við gerum ekki greinarmun á þessu tvennu, ef við
  // myndum vilja gera það þyrftum við að skilgreina stöðu fyrir niðurstöðu
  if (!result) {
    parentElement.appendChild(el('p', {class: 'error'}, `Úps, einhvað fór úrskeiðis. Ekkert skot fannst með þessu id: ${id}`));
    parentElement.appendChild(backElement);
    attachBackButtonListener();
    return;
  }



   // Nafn launch
   parentElement.appendChild(container);

   const launchElement = el(
    'div',
    { class: 'launch' },
    el('h2', { class: 'launchTitle' }, result.name),
  );

  container.appendChild(launchElement);

  // Gluggi
  const timewindowElement = el('h3',{class: 'timehead'},'Skot gluggi');


  const windowList =el('ul', {class: 'timelist'});

  container.appendChild(timewindowElement);
  container.appendChild(windowList)

  const opnast = result.window_start
    ? el('p', { class: 'gluggO' },'Gluggi opnast:   ', result.window_start)
    : el('p', { class: 'gluggO' }, 'Not found.');
  windowList.appendChild(opnast);

  const lokast = result.window_end
    ? el('p', { class: 'gluggL' },'Gluggi Lokast:   ', result.window_end)
    : el('p', { class: 'gluggL' }, 'Not found.');
  windowList.appendChild(lokast);

  // Staða
  const statusDiv =el('div', {class: 'allStatus'});
  container.appendChild(statusDiv);

  const statusElement = result.status.name
    ? el('h3',{class: 'status'},'Staða: ', result.status.name)
    : el('h3',{class: 'status'},'Staða: Not found')
  statusDiv.appendChild(statusElement);

  const statusDescrip = result.status.description
    ? el('p',{class: 'status'}, result.status.description)
    : el('p',{class: 'status'},'Engin lýsing fannst')
  statusDiv.appendChild(statusDescrip);

  // Mission
  const missionDiv =el('div', {class: 'allMiss'});
  container.appendChild(missionDiv);

  const missionElement = result.mission.name
  ? el('h3',{class: 'missName'},'Geimferð: ', result.mission.name)
  : el('h3',{class: 'missName'},'Geimferð: Not found')
  missionDiv.appendChild(missionElement);

  const missionDescrip = result.mission.description
    ? el('p',{class: 'missDes'}, result.mission.description)
    : el('p',{class: 'missDes'},'Engin lýsing fannst')
  missionDiv.appendChild(missionDescrip);


 // Mynd
 const image = result.image
    ? el('img', { src: result.image})
    : el('p',{class: 'noImg'},'Staða: Not found')
  container.appendChild(image);

  // Back
  container.appendChild(backElement);

 
}