export class AuthDTO {
  token: string;
  email: string;
  password: string;
  url_picture: string;

  constructor(
    token: string,
    email: string,
    password: string,
    url_picture: string = 'assets/img/user-default.png'
  ) {
    this.token = token;
    this.email = email;
    this.password = password;
    this.url_picture = url_picture;
  }
}
