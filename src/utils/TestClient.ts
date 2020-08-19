import axios from "axios";

export class TestClient {
  url: string;
  options: {
    withCredentials: boolean;
  };
  constructor(url: string) {
    this.url = url;
    this.options = {
      withCredentials: true,
    };
  }

  async login(email: string, password: string) {
    return axios.post(this.url, {
      ...this.options,
      query: `
        mutation {
          login(email: "${email}", password: "${password}") {
            path
            message
          }
        }
        `,
    });
  }

  async me() {
    return axios.post(this.url, {
      ...this.options,
      query: `
        {
          me {
            id
            email
          }
        }
        `,
    });
  }

  async logout() {
    return axios.post(this.url, {
      ...this.options,
      query: `
        mutation {
          logout
        }
        `,
    });
  }

  async register(email: string, password: string) {
    return axios.post(this.url, {
      ...this.options,
      query: `
      mutation {
        register(email: "${email}", password: "${password}") {
          path
          message
        }
      }
        `,
    });
  }
}
