class SearchCompaniesForm extends HTMLElement {
  static baseUrl =
    "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party";
  static token = "2eabf34f44f9ac78b5d93d709082f106a90068a8";

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.innerHTML = `
          <form class="form">
            <label class="label" for="search_company">
              Компания или ИП
              <input class="input" id="search_company" />
            </label>
            <label class="label" for="name_short">
              Краткое наименование
              <input class="input" id="name_short" />
            </label>
            <label class="label" for="name_full">
              Полное наименование
              <input class="input" id="name_full" />
            </label>
            <label class="label" for="inn_kpp">
              ИНН / КПП
              <input class="input" id="inn_kpp" />
            </label>
            <label class="label" for="address">
              Адрес
              <input class="input" id="address" />
            </label>
          </form>
          <style>
            .form {
              display: flex;
              flex-direction: column;
              font-family: Tahoma, Geneva, Verdana, sans-serif;
              max-width: 500px;
              min-height: 280px;
              justify-content: space-between;
              background-color: #eeeeee;
              padding: 20px;
              border-radius: 5px;
              box-sizing: border-box;
            }

            .label {
              display: flex;
              flex-direction: column;
            }

            .input {
              min-height: 22px;
              border-radius: 5px;
              
            }

            .label:first-of-type {
              position: relative;
            }

            .list {
              margin: 0;
              padding: 0;
              position: absolute;
              bottom: 0;
              left: 0;
              transform: translateY(100%);
              background-color: #f8f8f8;
              width: 100%;
              color: grey;
              font-size: 12px;
              list-style-type: none;
            }

            .item {
              cursor: pointer;
              border: 1px solid black;
            }

            .company-name,
            .company-address {
              margin: 7px 0;
              font-size: 12px;
            }

            .company-name {
              color: black;
            }
          </style>
      `;

    this.list = document.createElement("ul");
    this.list.classList.add("list");
    this.shadow.querySelector(".label:first-of-type").append(this.list);
    this.suggestions = [];
    this.inputNameShort = this.shadow.querySelector("#name_short");
    this.inputNameFull = this.shadow.querySelector("#name_full");
    this.inputInnKpp = this.shadow.querySelector("#inn_kpp");
    this.inputAddress = this.shadow.querySelector("#address");
  }

  connectedCallback() {
    const inputSearchCompany = this.shadow.querySelector("#search_company");
    inputSearchCompany.addEventListener("input", () => {
      this.getCompanies(inputSearchCompany.value)
        .then((data) => {
          this.suggestions = data.suggestions;
          this.renderCompaniesList(this.suggestions);
        })
        .catch((err) => console.error(err));
    });

    inputSearchCompany.addEventListener("blur", (e) => {
      setTimeout(() => this.renderCompaniesList([]), 100);
    });

    inputSearchCompany.addEventListener("focus", () => {
      this.renderCompaniesList(this.suggestions);
    });
  }

  renderCompaniesList(suggestions) {
    this.list.innerHTML = "";
    if (suggestions.length === 0) return;
    suggestions.forEach((suggestion) => {
      const li = document.createElement("li");
      const companyName = document.createElement("p");
      const companyAddress = document.createElement("p");

      li.classList.add("item");
      companyName.classList.add("company-name");
      companyName.innerText = suggestion.value;
      companyAddress.classList.add("company-address");
      companyAddress.innerText = suggestion.data.address.unrestricted_value;

      li.appendChild(companyName);
      li.appendChild(companyAddress);

      li.addEventListener("click", () => {
        this.inputNameShort.value = suggestion.value;
        this.inputNameFull.value = suggestion.data.name.full_with_opf;
        this.inputInnKpp.value = suggestion.data.kpp
          ? `${suggestion.data.inn} / ${suggestion.data.kpp}`
          : `${suggestion.data.inn}`;
        this.inputAddress.value = suggestion.data.address.unrestricted_value;
      });

      this.list.append(li);
    });
    this.list.prepend("Выберите вариант или продолжите ввод");
  }

  async getCompanies(value) {
    return fetch(SearchCompaniesForm.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Token ${SearchCompaniesForm.token}`,
      },
      body: JSON.stringify({
        query: value,
      }),
    }).then((res) => res.json());
  }
}

customElements.define("search-companies-form", SearchCompaniesForm);
