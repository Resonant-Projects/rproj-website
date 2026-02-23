export interface InitSearchFormOptions {
  formSelector: string;
  inputSelector: string;
  searchParam: string;
}

export const initSearchForm = ({ formSelector, inputSelector, searchParam }: InitSearchFormOptions): void => {
  const searchForm = document.querySelector<HTMLFormElement>(formSelector);
  const searchInput = searchForm?.querySelector<HTMLInputElement>(inputSelector);

  if (!searchForm || !searchInput || searchForm.dataset.initialized === 'true') {
    return;
  }

  searchForm.dataset.initialized = 'true';

  const queryParam = new URLSearchParams(window.location.search).get(searchParam);
  if (queryParam) {
    searchInput.value = queryParam;
  }

  searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const url = new URL(window.location.href);
    const query = searchInput.value.trim();

    if (query) {
      url.searchParams.set(searchParam, query);
    } else {
      url.searchParams.delete(searchParam);
    }

    window.location.href = url.pathname + url.search;
  });
};
