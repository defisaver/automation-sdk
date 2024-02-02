// eslint-disable-next-line import/no-extraneous-dependencies
const { runTypeChain, glob } = require('typechain');
const fs = require('fs');
const path = require('path');

const abisFolder = path.resolve(__dirname, '../src/abis/');

async function main() {
  const abiDir = path.join(__dirname, 'temp');
  const contractDir = path.join(__dirname, '..', 'src', 'types', 'contracts', 'generated');
  try {
    fs.mkdirSync(abiDir);

    fs.readdirSync(abisFolder).forEach(file => {
      if (file === 'index.ts') return;
      // eslint-disable-next-line import/no-dynamic-require
      const json = require(`${abisFolder}/${file}`);
      if (json.abi !== undefined) {
        fs.writeFileSync(path.join(abiDir, file), JSON.stringify(json.abi), 'utf8');
      }
    });

    const allFiles = glob(path.join(abiDir), ['*.json']);
    fs.rmSync(contractDir, { recursive: true, force: true });

    await runTypeChain({
      cwd: contractDir,
      filesToProcess: allFiles,
      allFiles,
      outDir: '.',
      target: 'web3-v1-3mihai3',
    });
  } catch (err) {
    console.error(err);
  }
  fs.rmSync(abiDir, { recursive: true, force: true });
}

main().catch(console.error);
