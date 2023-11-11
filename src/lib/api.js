/**
 * API föll.
 * @see https://lldev.thespacedevs.com/2.2.0/swagger/
 */

/**
 * Sækjum týpurnar okkar.
 * @typedef {import('./api.types.js').Launch} Launch
 * @typedef {import('./api.types.js').LaunchDetail} LaunchDetail
 * @typedef {import('./api.types.js').LaunchSearchResults} LaunchSearchResults
 */

/** Grunnslóð á API (DEV útgáfa) */
const API_URL = 'https://lldev.thespacedevs.com/2.2.0/';
const API_MAX_RESULTS = 50;

/**
 * Skilar Promise sem bíður í gefnar millisekúndur.
 * Gott til að prófa loading state, en einnig hægt að nota `throttle` í
 * DevTools.
 * @param {number} ms Tími til að sofa í millisekúndum.
 * @returns {Promise<void>}
 */
export async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(undefined), ms);
  });
}

/*
* Sækir gögn á slóð og skilar þeim sem JSON eða `null` ef villa kom upp.
* @param {string} url Slóð á API til að sækja gögn frá.
* @returns {Promise<any>} Gögn sem JSON hlutur eða `null` ef villa.
*/
async function queryApi(url) {
  // await sleep(1000);
  try {
    const result = await fetch(url);
 
    if (!result.ok) {
      throw new Error('result not ok');
    }
 
    return await result.json();
  } catch (e) {
    console.warn('unable to query', e);
    return null;
  }
 }


/**
 * Leita í geimskota API eftir leitarstreng.
 * @param {string} query Leitarstrengur.
 * @returns {Promise<Launch[] | null>} Fylki af geimskotum eða `null` ef villa
 *  kom upp.
 */
export async function searchLaunches(query) {
  const url = new URL('launch', API_URL);
  url.searchParams.set('mode', 'list');
  url.searchParams.set('search', query);


  const results = await queryApi(url);
  

  if (!results) {
    return null;
  }

  return (results.results ?? [])
    .slice(0, API_MAX_RESULTS)
    .map((result) => {
      if (!result.id) {
        return null;
      }
      return {
        id: result.id,
        name: result.name ?? '',
        status: result.status.name ?? [],
        mission: result.mission ?? '',
      };
    })
    .filter(Boolean);
}



/**
 * Skilar stöku geimskoti eftir auðkenni eða `null` ef ekkert fannst.
 * @param {string} id Auðkenni geimskots.
 * @returns {Promise<LaunchDetail | null>} Geimskot.
 */
export async function getLaunch(id) {

  const url = new URL(`launch/${id}`, API_URL);
  const result = await queryApi(url);

  if (!result) {
    return null;
  }


  return {
    name: result.name,            
    status: result.status,
    window_start: result.window_start ,  
    window_end: result.window_end ,      
    mission: result.mission ,   
    image: result.image,

  };
}
