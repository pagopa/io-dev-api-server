#!/bin/bash

IO_BACKEND_VERSION=v16.7.4-RELEASE
# need to change after merge on io-services-metadata
IO_SERVICES_METADATA_VERSION=1.0.58

declare -a apis=(

  # Backend APIs
  "./generated/definitions/backend https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_backend.yaml"
  "./generated/definitions/backend https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_public.yaml"
  "./generated/definitions/cgn https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_cgn.yaml"
  "./generated/definitions/cgn/merchants https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_cgn_operator_search.yaml"
  "./generated/definitions/fci https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_io_sign.yaml"
  "./generated/definitions/pn https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_pn.yaml"
  "./generated/definitions/trial_system https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_trial_system.yaml"
  "./generated/definitions/services https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_services_app_backend.yaml"
  "./generated/definitions/fims_history https://raw.githubusercontent.com/pagopa/io-backend/$IO_BACKEND_VERSION/api_io_fims.yaml"
  # IO Services Metadata
  "./generated/definitions/content https://raw.githubusercontent.com/pagopa/io-services-metadata/$IO_SERVICES_METADATA_VERSION/definitions.yml"
  "./generated/definitions/pagopa/walletv2 https://raw.githubusercontent.com/pagopa/io-services-metadata/$IO_SERVICES_METADATA_VERSION/bonus/specs/bpd/pm/walletv2.json"
  "./generated/definitions/pagopa/cobadge/configuration https://raw.githubusercontent.com/pagopa/io-services-metadata/$IO_SERVICES_METADATA_VERSION/pagopa/cobadge/abi_definitions.yml"
  "./generated/definitions/pagopa/privative/configuration https://raw.githubusercontent.com/pagopa/io-services-metadata/$IO_SERVICES_METADATA_VERSION/pagopa/privative/definitions.yml"
  # Misc
  "./generated/definitions/cgn/geo https://raw.githubusercontent.com/pagopa/io-backend/here_geoapi_integration/api_geo.yaml"
  "./generated/definitions/session_manager https://raw.githubusercontent.com/pagopa/io-auth-n-identity-domain/io-session-manager@1.0.0/apps/io-session-manager/api/internal.yaml"
  "./generated/definitions/pagopa/walletv3 https://raw.githubusercontent.com/pagopa/pagopa-infra/v1.202.0/src/domains/pay-wallet-app/api/io-payment-wallet/v1/_openapi.json.tpl"
  "./generated/definitions/pagopa https://raw.githubusercontent.com/pagopa/io-app/master/assets/paymentManager/spec.json"
  "./generated/definitions/idpay https://raw.githubusercontent.com/pagopa/cstar-infrastructure/v11.7.1/src/domains/idpay-app/api/idpay_appio_full/openapi.appio.full.yml"
  "./generated/definitions/fast_login https://raw.githubusercontent.com/pagopa/io-auth-n-identity-domain/io-session-manager@1.0.0/apps/io-session-manager/api/fast-login.yaml"
  "./generated/definitions/pagopa/ecommerce https://raw.githubusercontent.com/pagopa/pagopa-infra/v1.202.0/src/domains/ecommerce-app/api/ecommerce-io/v2/_openapi.json.tpl"
  "./generated/definitions/pagopa/transactions https://raw.githubusercontent.com/pagopa/pagopa-biz-events-service/0.1.57/openapi/openapi_io_patch_lap.json"
  "./generated/definitions/pagopa/platform https://raw.githubusercontent.com/pagopa/pagopa-infra/v1.64.0/src/domains/shared-app/api/session-wallet/v1/_openapi.json.tpl"
  "./generated/definitions/fims_sso https://raw.githubusercontent.com/pagopa/io-fims/a93f1a1abf5230f103d9f489b139902b87288061/apps/op-app/openapi.yaml"
)

for elem in "${apis[@]}"; do
    read -a strarr <<< "$elem"  # uses default whitespace IFS
    echo ${strarr[0]}; rm -rf ${strarr[0]}; mkdir -p ${strarr[0]}; yarn run gen-api-models --api-spec ${strarr[1]} --out-dir ${strarr[0]} --no-strict --response-decoders --request-types &
done
wait

yarn prepare