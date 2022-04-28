import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import { AnniRiferimento } from "../../../../generated/definitions/cdc/AnniRiferimento";
import { Anno } from "../../../../generated/definitions/cdc/Anno";
import { EsitoRichiestaEnum } from "../../../../generated/definitions/cdc/EsitoRichiesta";
import { ListaEsitoRichiestaPerAnno } from "../../../../generated/definitions/cdc/ListaEsitoRichiestaPerAnno";
import { ListaStatoPerAnno } from "../../../../generated/definitions/cdc/ListaStatoPerAnno";
import { StatoBeneficiarioEnum } from "../../../../generated/definitions/cdc/StatoBeneficiario";
import { addHandler } from "../../../payloads/response";

export const cdcBonusRequestRouter = Router();

export const generateBonusAll = (): ListaStatoPerAnno => {
  return {
    listaStatoPerAnno: [
      {
        annoRiferimento: "2020" as Anno,
        statoBeneficiario: StatoBeneficiarioEnum.ATTVABILE
      },
      {
        annoRiferimento: "2021" as Anno,
        statoBeneficiario: StatoBeneficiarioEnum.ATTVABILE
      },
      {
        annoRiferimento: "2022" as Anno,
        statoBeneficiario: StatoBeneficiarioEnum.ATTVABILE
      }
    ]
  };
};

// TODO: update the prefix when will be official
const addPrefix = (path: string) => `/bonus${path}`;

// tslint:disable-next-line: no-let
export let bonusAll: ListaStatoPerAnno = generateBonusAll();

addHandler(
  cdcBonusRequestRouter,
  "get",
  addPrefix("/beneficiario/stato"),
  (req, res) => res.json(bonusAll)
);

addHandler(
  cdcBonusRequestRouter,
  "post",
  addPrefix("/beneficiario/registrazione"),
  (req, res) => {
    const maybeAnniRiferimento = AnniRiferimento.decode(req.body);

    if (E.isLeft(maybeAnniRiferimento)) {
      res.sendStatus(500);
      return;
    }

    const anniRiferimento = maybeAnniRiferimento.value.anniRif;

    const bonusStatusByYear = Object.assign(
      {},
      ...bonusAll.listaStatoPerAnno.map(x => ({
        [x.annoRiferimento]: x.statoBeneficiario
      }))
    );

    const listaEsitoRichiestaPerAnno: ListaEsitoRichiestaPerAnno = {
      listaEsitoRichiestaPerAnno: anniRiferimento.map(y => {
        if (
          bonusStatusByYear[y.anno] === undefined ||
          bonusStatusByYear[y.anno] === StatoBeneficiarioEnum.INATTIVO
        ) {
          return {
            annoRiferimento: y.anno,
            esitoRichiesta: EsitoRichiestaEnum.ANNO_NON_AMMISSIBILE
          };
        }

        if (bonusStatusByYear[y.anno] === StatoBeneficiarioEnum.INATTIVABILE) {
          return {
            annoRiferimento: y.anno,
            esitoRichiesta: EsitoRichiestaEnum.INIZIATIVA_TERMINATA
          };
        }

        if (
          bonusStatusByYear[y.anno] === StatoBeneficiarioEnum.ATTIVO ||
          bonusStatusByYear[y.anno] === StatoBeneficiarioEnum.VALUTAZIONE
        ) {
          return {
            annoRiferimento: y.anno,
            esitoRichiesta: EsitoRichiestaEnum.CIT_REGISTRATO
          };
        }

        // tslint:disable-next-line: no-object-mutation
        bonusStatusByYear[y.anno] = StatoBeneficiarioEnum.VALUTAZIONE;

        return {
          annoRiferimento: y.anno,
          esitoRichiesta: EsitoRichiestaEnum.OK
        };
      })
    };

    bonusAll = {
      listaStatoPerAnno: bonusAll.listaStatoPerAnno.map(s => ({
        ...s,
        statoBeneficiario: bonusStatusByYear[s.annoRiferimento]
      }))
    };

    return res.status(200).json(listaEsitoRichiestaPerAnno);
  }
);
