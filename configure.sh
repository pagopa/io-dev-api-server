set -euxo pipefail

echo "Configuring the dev API server based on environment variables"

# we add the prefix 'window.' to avoid runtime errors due to undeclared variables

sed -i'.bak' -e "s/window.__ENV_E2E_LOGIN_HAPPY_PATH__/${ENV_E2E_LOGIN_HAPPY_PATH:-false}/g" assets/html/login.html
