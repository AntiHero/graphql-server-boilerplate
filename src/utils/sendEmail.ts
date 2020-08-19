import * as SparkPost from 'sparkpost';

export const sendEmail = async (recipient: string, url: string) => {
  const client = new SparkPost();
  const response = await client.transmissions.send({
    options: {
      sandbox: true
    },
    content: {
      from: 'testing@sparkpostbox.com',
      subject: 'Confirm Email!',
      html:`<html><body><a href="${url}" target="_blank">Confirm your email</a></body></html>`
    },
    recipients: [
      {address: recipient}
    ]
  })
  console.log(response)
}