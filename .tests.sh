if [ -z "$1" ]; then mocha "./src/**/*.test.ts" --require ts-node/register --extension ts;
else mocha "./src/**/${1}.test.ts" --require ts-node/register --extension ts;
fi