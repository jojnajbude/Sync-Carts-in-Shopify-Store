import { Injectable } from "@nestjs/common";
// @ts-ignore
import ElasticEmail from '@elasticemail/elasticemail-client'; 

const client = ElasticEmail.ApiClient.instance;
const apikey = client.authentications['apikey'];
apikey.apiKey = "042A1A09D17EA1C97B294AB78AC142952799232D03C0CD7717B010F9A92D7E2BB417A673BC95131FEDC4DE8DCF8FB5C2";
const emailsApi = new ElasticEmail.EmailsApi();

@Injectable()
export class NotificationsService {
  async sendEmail() {
    const emailData = {
      Recipients: {
        To: ["demigod177712@gmail.com"]
      },
      Content: {
        Body: [
          {
            ContentType: "PlainText",
            Charset: "utf-8",
            Content: "Test email"
          },
        ],
        From: "demigod177712@gmail.com",
        Subject: "Test email"
      }
    }

    const callback = (error: any, data: any, response: any) => {
      if (error) {
          console.error(error);
      } else {
          console.log('API called successfully.');
          console.log('Email sent.');
      }
    };

    emailsApi.emailsTransactionalPost(emailData, callback);
  }
}
