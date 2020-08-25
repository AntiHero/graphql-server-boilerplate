import axios from "axios";
import axiosCookieJarSupport from 'axios-cookiejar-support';
import * as tough from 'tough-cookie';

axiosCookieJarSupport(axios);

export class TestClient {
  url: string;
  options: {
    jar: any;
    withCredentials: boolean;
  };
  constructor(url: string) {
    this.url = url;
    this.options = {
      jar: new tough.CookieJar(),
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

  async restorePasswordChange(newPassword: string, key: string) {
    return axios.post(this.url, {
      ...this.options,
      query: `
      mutation {
        restorePasswordChange(password: "${newPassword}", key: "${key}") {
          path
          message
        }
      }
        `,
    });
  }



}
