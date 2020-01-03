# IO dev API server

It's a simple mock server of [io-backend](https://github.com/teamdigitale/io-backend) for [io-app](https://github.com/teamdigitale/io-app).<br/>
It has been created to make the app development process easier and more productive.<br/>
With this local server the developer can:

- **run it on local machine** (no internet connection needed)
- **change response payloads** to test and stress the app
- **add new paths and handlers** to integrate and test features not yet released

<img src="assets/imgs/tour.gif" height="600" />

### Installation

On macOS and Linux we recommend the use of nodenv for managing multiple versions of NodeJS.
The node version used in this project is stored in [.node-version](.node-version).

#### Setup

1. clone this repository
2. install all packages needed:<br/>
   `yarn install`
3. generate all api-paths and models handled by [io-backend](https://github.com/teamdigitale/io-backend):<br/>
   `yarn generate:all`
4. you are ready! start the server:<br/>
   `yarn start`

Commands _**2**_ and _**3**_ should be executed on the first setup and only when io-backend specs change

#### Add server to io-app

1. open io-app project folder
1. open **.env** configuration file
1. edit the **API_URL_PREFIX** with the local server<br/>
   `API_URL_PREFIX='http://127.0.0.1:3000'`
1. edit the **CONTENT_REPO_URL** with the local server<br/>
   `CONTENT_REPO_URL='http://127.0.0.1:3000/static_contents''`
1. update the config file<br/>
   `yarn postinstall`
1. run simulator<br/>
   `react-native run-ios` or<br/>
   `react-native run-android`

> you could edit the [server port](server.ts) (**serverPort** - default is 3000)

### Features

The current version supports:

- ✓ login
- ✓ session
- ✓ logout
- ✓ get profile
- ✓ update profile
- ✓ get user metadata
- ✓ update user metadata
- ✓ messages
- ✓ message details
- ✓ services
- ✓ service details
- ✓ service metadata (static content)
- ✗ services by scope (static content)
- ✓ service logo (static content)
- ✓ organization logo (static content)
- ✗ municipalities metadata (static content)
- ✗ payment session
- ✗ payment
- ✗ payment transactions

✗ -> a contribution is really appreciate :blush:

#### Login

The current login implementation by-passes SPID authentication: when the user asks for a login with a certain SPID Identity Provider, the server responses with a redirect containing the session token. The user will be immediately logged in.

<img src="assets/imgs/login.gif" height="600" />

#### Session

When the client asks for a session, a valid session is always returned. Of course the developer could implement a logic to return an expired session response to test different scenarios.

#### Profile

The profile is [mocked](payloads/profile.ts) (hard-coded). If you want the server reponses a different profile, just edit it!
<br/>On upsert profile request the server acts like a mirror: it gives back the updated profile (sent by the client) increasing the profile version

<img src="assets/imgs/profile.gif" height="600" />

### Response validation

To ensure the response payloads are compliant with the [API specs](https://raw.githubusercontent.com/teamdigitale/italia-backend/v1.7.1/api_backend.yaml)
the server automatically generates types definition (`yarn generate:models`) and raises a compile-time exception (and run time too) if a response payload is not compliant with its type

```typescript
export const customSession = {
  spidLevel: "https://www.spid.gov.it/SpidL2",
  walletToken: "ABCDEFG001"
};
// if customSession is not compliant with PublicSession an exception will be
// raised. Otherwise a valid PublicSession object will be returned
const session = validatePayload(PublicSession, customSession);
```

#### API Paths

To ensure you are handling the right api paths a [special type](generated/definitions/backend_api_paths.ts) is automatically generated (`yarn generate:paths`).<br/>When you add an API handler if the path is not defined in the [API specs](https://raw.githubusercontent.com/teamdigitale/italia-backend/v1.7.1/api_backend.yaml) a compile time error will be raised

```typescript
// it raises a compile time error because 'fancyapi' is not defined in the API specs
responseHandler.addHandler("get", "/fancyapi", session);

// this path is defined in the specs so no error will be raised
responseHandler.addHandler("get", "/messages", session);
```

### How can I add a new handler?

#### Change an existing handler

Of course you can alter server payloads to stress and test app (you should do it!)<br/>

**some examples**

> you want app loads 10k items in inbox messages

```typescript
// create a message list response using the utility function
const hugeMessageList = getMessageWithoutContentList(10000, fiscalCode);
// then serve it on the relative api path
responseHandler.addHandler("get", "/messages", hugeMessageList);
```

note `hugeMessageList` is `IOResponse` type which is a simple wrapper around the payload sent in the response

```typescript
export type IOResponse<T> = {
  payload: T;
  status?: number;
  isJson?: boolean;
};
```

if `status` is omitted will be considered 200 (HTTP_OK)<br/>
if `isJson` is true the `payload` will be sent as a json

> you want to serve 401 (unauthorized) on get profile

```typescript
responseHandler.addHandler("get", "/profile", { payload: "ko", status: 401 });
```

#### Add a new handler

Usually the new handler is included in a new specs version.

- update the specs to the target version
  edit the field `api_beckend_specs` in the `package.json`
- generate the updated models and paths: `yarn generate:all`
- add the handler
  - create the payload should be returned
  - add the handler
  ```typescript
  const mockPayload = { field1: "value", field2: 2 };
  const newPayload = validatePayload(NewPayloadType, {
    field1: "value",
    field2: 2
  });
  const newIoPayload: IOPayload<NewPayloadType> = {
    payload: newPayload,
    isJson: true
  };
  // if the mockPayload is compliant with NewPayloadType no errors will be raised
  responseHandler.addHandler("get", "/newpath", newIoPayload);
  ```
