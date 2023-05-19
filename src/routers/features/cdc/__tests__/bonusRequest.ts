import * as E from "fp-ts/lib/Either";
import supertest from "supertest";
import { AnniRiferimento } from "../../../../../generated/definitions/cdc/AnniRiferimento";
import { Anno } from "../../../../../generated/definitions/cdc/Anno";
import { EsitoRichiestaEnum } from "../../../../../generated/definitions/cdc/EsitoRichiesta";
import { ListaEsitoRichiestaPerAnno } from "../../../../../generated/definitions/cdc/ListaEsitoRichiestaPerAnno";
import { ListaStatoPerAnno } from "../../../../../generated/definitions/cdc/ListaStatoPerAnno";
import app from "../../../../server";
import * as bonusRequest from "../bonusRequest";

const request = supertest(app);

describe("GET beneficiario/stato", () => {
  it("should return the bonus list", async () => {
    const response = await request.get("/bonus/cdc/beneficiario/stato");

    expect(response.status).toBe(200);
    const bonuses = ListaStatoPerAnno.decode(response.body);
    expect(E.isRight(bonuses)).toBeTruthy();
    if (E.isRight(bonuses)) {
      expect(bonuses.right).toStrictEqual(bonusRequest.generateBonusAll());
    }
  });
});

describe("POST /beneficiario/registrazione", () => {
  // eslint-disable-line sonarjs/no-duplicate-string
  it("should return 500 if the received body is not correct", async () => {
    const wrongPayload = {
      anniRiferimento: {}
    };
    const response = await request
      .post("/bonus/cdc/beneficiario/registrazione") // eslint-disable-line sonarjs/no-duplicate-string
      .set(wrongPayload);

    expect(response.status).toBe(500);
  });
  it("should return 200 with the list of the bonuses with the relative status", async () => {
    const payload: AnniRiferimento = {
      anniRif: [
        { anno: "2019" as Anno },
        { anno: "2020" as Anno },
        { anno: "2022" as Anno }
      ]
    };
    const responseRegistered = await request
      .post("/bonus/cdc/beneficiario/registrazione") // eslint-disable-line sonarjs/no-duplicate-string
      .send(payload);

    const requestRegisteredOutcome = ListaEsitoRichiestaPerAnno.decode(
      responseRegistered.body
    );

    const expectedRegisteredOutcome: ListaEsitoRichiestaPerAnno = {
      listaEsitoRichiestaPerAnno: [
        {
          annoRiferimento: "2019" as Anno,
          esitoRichiesta: EsitoRichiestaEnum.ANNO_NON_AMMISSIBILE
        },
        {
          annoRiferimento: "2020" as Anno,
          esitoRichiesta: EsitoRichiestaEnum.OK
        },
        {
          annoRiferimento: "2022" as Anno,
          esitoRichiesta: EsitoRichiestaEnum.OK
        }
      ]
    };

    expect(responseRegistered.status).toBe(200);
    expect(E.isRight(requestRegisteredOutcome)).toBeTruthy();
    if (E.isRight(requestRegisteredOutcome)) {
      expect(requestRegisteredOutcome.right).toStrictEqual(
        expectedRegisteredOutcome
      );
    }
    const responsePending = await request
      .post("/bonus/cdc/beneficiario/registrazione") // eslint-disable-line sonarjs/no-duplicate-string
      .send(payload);

    const requestPendingOutcome = ListaEsitoRichiestaPerAnno.decode(
      responsePending.body
    );

    const expectedPendingOutcome: ListaEsitoRichiestaPerAnno = {
      listaEsitoRichiestaPerAnno: [
        {
          annoRiferimento: "2019" as Anno,
          esitoRichiesta: EsitoRichiestaEnum.ANNO_NON_AMMISSIBILE
        },
        {
          annoRiferimento: "2020" as Anno,
          esitoRichiesta: EsitoRichiestaEnum.CIT_REGISTRATO
        },
        {
          annoRiferimento: "2022" as Anno,
          esitoRichiesta: EsitoRichiestaEnum.CIT_REGISTRATO
        }
      ]
    };

    expect(responsePending.status).toBe(200);
    expect(E.isRight(requestPendingOutcome)).toBeTruthy();
    if (E.isRight(requestPendingOutcome)) {
      expect(requestPendingOutcome.right).toStrictEqual(expectedPendingOutcome);
    }
  });
});
