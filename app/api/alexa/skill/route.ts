import { NextRequest, NextResponse } from "next/server";
import alexaVerifier from "alexa-verifier";
import { dayFromDate, getTodayDay, getCurrentMealType } from "@/lib/utils";
import {
  findLinkedUserId,
  linkAccount,
  describeMyMeals,
  describePersonMeals,
  MEAL_TYPE_BY_SPOKEN,
} from "@/lib/alexa/handlers";
import type { AlexaRequestEnvelope, AlexaResponseEnvelope } from "@/lib/alexa/types";

function buildResponse(text: string, shouldEndSession: boolean): AlexaResponseEnvelope {
  return {
    version: "1.0",
    response: {
      outputSpeech: text ? { type: "PlainText", text } : undefined,
      shouldEndSession,
    },
  };
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const certUrl = req.headers.get("signaturecertchainurl");
  const signature = req.headers.get("signature");

  try {
    if (!certUrl || !signature) throw new Error("missing signature headers");
    await alexaVerifier(certUrl, signature, rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid request signature" }, { status: 400 });
  }

  const envelope: AlexaRequestEnvelope = JSON.parse(rawBody);
  const alexaUserId = envelope.context.System.user.userId;
  const { request } = envelope;

  if (request.type === "SessionEndedRequest") {
    return NextResponse.json(buildResponse("", true));
  }

  if (request.type === "LaunchRequest") {
    const linked = await findLinkedUserId(alexaUserId);
    const speech = linked
      ? "Ciao! Puoi chiedermi cosa devi mangiare oggi, domani, o cosa mangia qualcuno che ha condiviso la sua dieta con te."
      : "Benvenuto in Feedy. Per iniziare, collega il tuo account: apri l'app, vai in Impostazioni, genera un codice e dimmelo.";
    return NextResponse.json(buildResponse(speech, false));
  }

  const { intent } = request;
  const slotValue = (name: string) => intent.slots?.[name]?.value;

  if (intent.name === "LinkAccountIntent") {
    const speech = await linkAccount(alexaUserId, slotValue("Code"));
    return NextResponse.json(buildResponse(speech, false));
  }

  if (intent.name === "AMAZON.HelpIntent") {
    return NextResponse.json(
      buildResponse(
        "Puoi chiedermi ad esempio: cosa devo mangiare oggi, cosa mangio ora, o cosa mangia la mamma a pranzo.",
        false
      )
    );
  }

  if (intent.name === "AMAZON.CancelIntent" || intent.name === "AMAZON.StopIntent") {
    return NextResponse.json(buildResponse("A presto!", true));
  }

  const userId = await findLinkedUserId(alexaUserId);
  if (!userId) {
    return NextResponse.json(
      buildResponse(
        "Devi prima collegare il tuo account Feedy. Trovi il codice nelle impostazioni dell'app.",
        false
      )
    );
  }

  const mealTypeSpoken = slotValue("MealType")?.toLowerCase();
  const mealType = mealTypeSpoken ? MEAL_TYPE_BY_SPOKEN[mealTypeSpoken] : undefined;
  const dateSlot = slotValue("Date");
  const day = dateSlot ? dayFromDate(new Date(`${dateSlot}T12:00:00`)) : getTodayDay();

  let speech: string;
  switch (intent.name) {
    case "GetCurrentMealIntent":
      speech = await describeMyMeals(userId, getTodayDay(), getCurrentMealType());
      break;

    case "GetMealsForDayIntent":
      speech = await describeMyMeals(userId, day, mealType);
      break;

    case "GetMealForPersonIntent": {
      const person = slotValue("Person");
      speech = person ? await describePersonMeals(userId, person, day, mealType) : "Per chi, scusa?";
      break;
    }

    case "GetMealForMeAndPersonIntent": {
      const person = slotValue("Person");
      if (!person) {
        speech = "Con chi, scusa?";
        break;
      }
      const mine = await describeMyMeals(userId, day, mealType);
      const theirs = await describePersonMeals(userId, person, day, mealType);
      speech = `Tu: ${mine} ${theirs}`;
      break;
    }

    default:
      speech = "Non ho capito, puoi ripetere?";
  }

  return NextResponse.json(buildResponse(speech, false));
}
