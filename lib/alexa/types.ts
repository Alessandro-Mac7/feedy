// Minimal shapes for the Alexa Skills Kit JSON contract — only the fields
// this skill actually reads/writes. Full reference:
// https://developer.amazon.com/en-US/docs/alexa/custom-skills/request-and-response-json-reference.html

export interface AlexaSlot {
  name: string;
  value?: string;
}

export interface AlexaIntent {
  name: string;
  slots?: Record<string, AlexaSlot>;
}

export type AlexaRequest =
  | { type: "LaunchRequest"; timestamp: string }
  | { type: "IntentRequest"; timestamp: string; intent: AlexaIntent }
  | { type: "SessionEndedRequest"; timestamp: string };

export interface AlexaRequestEnvelope {
  version: string;
  context: { System: { user: { userId: string } } };
  request: AlexaRequest;
}

export interface AlexaResponseEnvelope {
  version: "1.0";
  response: {
    outputSpeech?: { type: "PlainText"; text: string };
    shouldEndSession: boolean;
  };
}
