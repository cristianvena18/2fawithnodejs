import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import {Response} from 'express';

class AuthenticationService {
    public getTwoFactorAuthenticationCode() {

    console.log('process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,', process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME);

    const secretCode = speakeasy.generateSecret({
      name: process.env.TWO_FACTOR_AUTHENTICATION_APP_NAME,
    });
    return {
      otpauthUrl : secretCode.otpauth_url,
      base32: secretCode.base32,
    };
  }

  public async respondWithQRCode(data: string, response: Response) {
    return QRCode.toFileStream(response, data);
  }


  public async verify2Fa(user: any, twoFactorAuthenticationCode: string) {
    speakeasy.totp.verify({
      secret: user.twoFactorAuthenticationCode,
      encoding: 'base32',
      token: twoFactorAuthenticationCode,
    });
  }
}

export default new AuthenticationService;
