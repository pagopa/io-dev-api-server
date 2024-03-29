import { Router } from "express";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { match } from "ts-pattern";
import { AnniRiferimento } from "../../../../generated/definitions/cdc/AnniRiferimento";
import { Anno } from "../../../../generated/definitions/cdc/Anno";
import { EsitoRichiestaEnum } from "../../../../generated/definitions/cdc/EsitoRichiesta";
import { ListaEsitoRichiestaPerAnno } from "../../../../generated/definitions/cdc/ListaEsitoRichiestaPerAnno";
import { ListaStatoPerAnno } from "../../../../generated/definitions/cdc/ListaStatoPerAnno";
import {
  StatoBeneficiario,
  StatoBeneficiarioEnum
} from "../../../../generated/definitions/cdc/StatoBeneficiario";
import { StatoBeneficiarioPerAnno } from "../../../../generated/definitions/cdc/StatoBeneficiarioPerAnno";
import { addHandler } from "../../../payloads/response";

export const cdcBonusRequestRouter = Router();

export const generateBonusAll = (): ListaStatoPerAnno => ({
  listaStatoPerAnno: [
    {
      annoRiferimento: "2020" as Anno,
      statoBeneficiario: StatoBeneficiarioEnum.ATTIVABILE
    },
    {
      annoRiferimento: "2021" as Anno,
      statoBeneficiario: StatoBeneficiarioEnum.ATTIVABILE
    },
    {
      annoRiferimento: "2022" as Anno,
      statoBeneficiario: StatoBeneficiarioEnum.ATTIVABILE
    }
  ]
});

const addPrefix = (path: string) => `/bonus/cdc${path}`;

// eslint-disable-next-line functional/no-let
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
    pipe(
      AnniRiferimento.decode(req.body),
      E.fold(
        () => {
          res.sendStatus(500);
        },
        value => {
          // eslint-disable-next-line functional/no-let
          let bonusStatusByYear: Record<Anno, StatoBeneficiario> =
            bonusAll.listaStatoPerAnno.reduce<Record<Anno, StatoBeneficiario>>(
              (
                acc: Record<Anno, StatoBeneficiario>,
                curr: StatoBeneficiarioPerAnno
              ) => ({
                ...acc,
                [curr.annoRiferimento]: curr.statoBeneficiario
              }),
              {}
            );
          const anniRiferimento = value.anniRif;
          const listaEsitoRichiestaPerAnno: ListaEsitoRichiestaPerAnno = {
            listaEsitoRichiestaPerAnno: anniRiferimento.map(y =>
              match(bonusStatusByYear[y.anno])
                .when(
                  v => [undefined, StatoBeneficiarioEnum.INATTIVO].includes(v),
                  () => ({
                    annoRiferimento: y.anno,
                    esitoRichiesta: EsitoRichiestaEnum.ANNO_NON_AMMISSIBILE
                  })
                )
                .with(StatoBeneficiarioEnum.INATTIVABILE, () => ({
                  annoRiferimento: y.anno,
                  esitoRichiesta: EsitoRichiestaEnum.INIZIATIVA_TERMINATA
                }))
                .when(
                  v =>
                    [
                      StatoBeneficiarioEnum.ATTIVO,
                      StatoBeneficiarioEnum.VALUTAZIONE
                    ].includes(v),
                  () => ({
                    annoRiferimento: y.anno,
                    esitoRichiesta: EsitoRichiestaEnum.CIT_REGISTRATO
                  })
                )
                .otherwise(() => {
                  bonusStatusByYear = {
                    ...bonusStatusByYear,
                    [y.anno]: StatoBeneficiarioEnum.VALUTAZIONE
                  };
                  return {
                    annoRiferimento: y.anno,
                    esitoRichiesta: EsitoRichiestaEnum.OK
                  };
                })
            )
          };
          bonusAll = {
            listaStatoPerAnno: bonusAll.listaStatoPerAnno.map(s => ({
              ...s,
              statoBeneficiario: bonusStatusByYear[s.annoRiferimento]
            }))
          };

          return res.json(listaEsitoRichiestaPerAnno);
        }
      )
    );
  }
);
