import fs from "fs";
import { Router } from "express";
import axios from "axios";
import { v4 } from "uuid";
import { addHandler } from "../../../payloads/response";
import { serverUrl } from "../../../utils/server";
import { InitializedProfile } from "../../../../generated/definitions/backend/InitializedProfile";

export const fimsClientId = () => "4";
export const fimsToken = () => "AAAAAAAAAAAAA5";

type A = {
  kind: "A";
  interactionId: string;
  clientId: string;
  sessionId: string;
};
type B = {
  kind: "B";
  interactionId: string;
  clientId: string;
  sessionId: string;
  fiscalCode: string;
};
type C = {
  kind: "C";
  interactionId: string;
  clientId: string;
  sessionId: string;
  fiscalCode: string;
  grant: string[];
};

type FIMSStates = A | B | C;
const fimsA = new Map<string, FIMSStates>();

export const fimsProviderRouter = Router();

addHandler(fimsProviderRouter, "get", "/fims/oauth/authorize", (req, res) => {
  // TODO scope and redirect URI and nonce
  const queryClientId = req.query.clientId as string;
  const defaultFimsClientId = fimsClientId();
  if (defaultFimsClientId !== queryClientId) {
    // TODO standard error page?
    res.sendStatus(403);
    return;
  }
  const sessionId = v4();
  const interactionId = v4();
  fimsA.set(interactionId, {
    kind: "A",
    interactionId,
    clientId: defaultFimsClientId,
    sessionId
  });
  const redirectUrl = `http://localhost:3000/fims/interaction/${interactionId}`;
  res.redirect(303, redirectUrl);
});

addHandler(fimsProviderRouter, "get", "/fims/interaction/:id", async (req, res) => {
  const interactionId = req.params.id;
  const singleFims = fimsA.get(interactionId);
  if (!singleFims) {
    // TODO standard error page?
    res.status(403).json({error: `Unmatching Interaction Id`});
    return;
  }

  // TODO check singleFims type:
  // TODO  if A, then check the FIMS Token and retrieve the user profile
  // TODO  if B, then check return the consent page
  if (singleFims.kind === "B") {
    // TODO
    const buffer = fs.readFileSync("src/features/fims/assets/permissions.html");
    const pageContent = buffer.toString();
    const substitutedPageContent = pageContent.replace(":id", interactionId);
    res.status(200).send(substitutedPageContent);
    return;
  }
  
  // This is A
  const requestFimsToken = req.cookies["X-IO-FIMS-Token"];
  if (fimsToken() !== requestFimsToken) {
    // TODO standard error page?
    res.status(403).json({error: `Unmmatching FIMS token`});
    return;
  }

  try {
    const response = await axios.get(`${serverUrl}/api/v1/profile`);
    const profile = response.data as InitializedProfile;
    const fiscalCode = profile.fiscal_code;
    if (fiscalCode?.length <= 0) {
      // TODO standard error page?
      res.status(500);
      return;
    }
    const fimsStateB = {
      kind: "B",
      interactionId: singleFims.interactionId,
      clientId: singleFims.clientId,
      sessionId: singleFims.sessionId,
      fiscalCode
    } as B;
    fimsA.set(interactionId, fimsStateB);
  } catch (e) {
    // TODO standard error page?
    res.status(500);
    return;
  }

  res.redirect(303, `http://localhost:3000/fims/oauth/authorize/${interactionId}`);;
});

addHandler(fimsProviderRouter, "get", "/fims/oauth/authorize/:id", async (req, res) => {
  const interactionParamId = req.params.id;
  const fimsState = fimsA.get(interactionParamId);
  if (!fimsState || fimsState.kind === "A") {
    // TODO standard error page?
    res.status(500);
    return;
  }

  if (fimsState.kind === "C") {
    // TODO
    try {
      const response = await axios.get(`${serverUrl}/api/v1/profile`);
      const profile = response.data as InitializedProfile;
      if (fimsState.fiscalCode !== profile.fiscal_code) {
        // TODO standard error page?
        res.status(403).json({error: `Unmmatching User Profile`});
        return;  
      }
    } catch (e) {
      // TODO standard error page?
      res.status(500);
      return;
    }

    const idToken = v4();
    res.status(200).send(`
      <html>
        <head>
          <script>
            function generateAndSubmitRedirectForm() {
              var redirectForm = document.createElement("FORM");
              redirectForm.setAttribute("id","RedirectFormId");
              document.body.appendChild(redirectForm);
            
              var idTokenInput = document.createElement("INPUT");
              idTokenInput.setAttribute("id","idTokenId");
              idTokenInput.setAttribute("name","idToken");
              idTokenInput.setAttribute("type","hidden");
              idTokenInput.setAttribute("value","${idToken}");
              document.getElementById("RedirectFormId").appendChild(idTokenInput);
              
              redirectForm.method = "POST";
              redirectForm.action = "http://localhost:3000/fims/rp/callback";
              redirectForm.submit();
            }
            function ready(fn) { 
              if (document.readyState !== 'loading') { 
                fn(); 
                return; 
              } 
              document.addEventListener('DOMContentLoaded', fn); 
            } 
            ready(() => generateAndSubmitRedirectForm());
          </script>
        </head>
        <body>
          <div>
            <p>Please wait</p>
          </div>
        </body>
      </html>
    `);
    return;
  }

  const newInteractionId = v4();
  const newB = {
    ...fimsState,
    interactionId: newInteractionId
  } as B;
  fimsA.set(newInteractionId, newB);
  res.redirect(303, `http://localhost:3000/fims/interaction/${newInteractionId}`);
});

addHandler(fimsProviderRouter, "post", "/fims/interaction/:id/confirm", (req, res) => {
  const paramInteractionID = req.params.id;
  const fimsState = fimsA.get(paramInteractionID);
  if (!fimsState || fimsState.kind !== "B") {
    // TODO standard error page?
    res.status(500);
    return;
  }
  
  const requestAccepted = req.body.accepted;
  if (requestAccepted === undefined) {
    // TODO standard error page?
    res.status(403).json({error: `Unmmatching FIMS token`});
    return;
  }

  if (requestAccepted !== "true") {
    // TODO
    res.status(400).send("<html><head><title>Consenso negato</title></head><body><div>Hai negato il consenso, il flusso è stato interrotto. Puoi ora chiudere la pagina</div></body></html>");
    return;
  }

  const newC = {
    ...fimsState,
    kind: "C",
    grant: ["name", "date_of_birth"]
  } as C;
  fimsA.set(paramInteractionID, newC);

  res.redirect(303, `http://localhost:3000/fims/oauth/authorize/${paramInteractionID}`);
});