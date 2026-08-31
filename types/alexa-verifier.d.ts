declare module "alexa-verifier" {
  export default function alexaVerifier(
    certUrl: string,
    signature: string,
    requestRawBody: string
  ): Promise<void>;
}
