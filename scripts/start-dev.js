const origSpawn = require("node:child_process").spawn;
const { existsSync } = require("node:fs");
const path = require("node:path");

const { default: select, Separator } = require("@inquirer/select");
const chalk = require("chalk");
const groupBy = require("lodash/groupBy");
const optionator = require("optionator")({
  options: [
    {
      option: "preview",
      alias: "p",
      type: "Boolean",
      description: "Run the webapp in a production build using `vite preview`.",
    },
  ],
});

const environments = require("C:/Users/sandeep.gupta_forsys/webapp-draft/environments.json");

/**
 * Wrapper around node's `spawn` function to promisify it.
 * Note: We don't use `node:utils/promisify` because it would exit the parent process
 * when the child process exits, while we just want to resolve the promise instead.
 */
const spawn = (cmd, args, options) => {
  return new Promise((resolve, reject) => {
    const child = origSpawn(cmd, args, { stdio: "inherit", ...options });
    child.on("exit", (code) => {
      resolve(code);
    });
    child.on("close", (code) => {
      resolve(code);
    });
    child.on("error", (err) => {
      reject(err);
    });
  });
};

const areCloudEnvsAvailable = existsSync(path.join(__dirname, "../../../cloud/cloud-webapp/development"));

const groupedEnvs = groupBy(
  Object.entries(environments)
    .map(([id, entry]) => ({ id, ...entry })),
  "group"
);

// Debugging statement for grouped environments
console.log("Grouped Environments:", groupedEnvs);

const choices = Object.entries(groupedEnvs).flatMap(([group, entries]) => {
  return [
    new Separator(`--- ${group} ---`),
    ...entries.map((entry) => ({
      name: entry.name,
      value: entry.id,
      description: entry.description,
    })),
  ];
});

// Debugging statement for choices
console.log("Choices for selection:", choices);

// Check if choices are empty
if (choices.length === 0) {
  console.error("No selectable environments. Please check environment configuration.");
  process.exit(1);
}

async function preStart() {
  // Ensure this is the correct path to pnpm if you have issues
  await spawn("C:/Users/sandeep.gupta_forsys/AppData/Roaming/npm/pnpm.cmd", ["generate-client"], { stdio: "inherit" });
}

async function main() {
  try {
    const options = optionator.parse(process.argv);

    const selectedEnv =
      options._[0] ||
      (await select({
        message: "Select your backend environment to develop against:",
        choices,
        pageSize: 15,
      }));

    if (options.preview) {
      console.log(`Running as preview against environment: ${chalk.bold.cyan(selectedEnv)}`);
    } else {
      console.log(`Selected environment: ${chalk.bold.cyan(selectedEnv)}`);
    }

    const env = environments[selectedEnv];
    if (!env) {
      throw new Error(`Invalid environment selected: ${selectedEnv}`);
    }

    console.log(
      `\n💡 Run ${chalk.cyan(
        `pnpm start ${!!options.preview ? "--preview " : ""}${selectedEnv}`
      )} to run against this environment without a select prompt.`
    );

    await preStart();

    if (options.preview) {
      console.log(`\n> pnpm vite build && pnpm vite preview --port ${env.cloudEnv ? "3001" : "3000"}\n`);
      await spawn("pnpm", ["vite", "build"], {
        stdio: "inherit",
        env: {
          ...process.env,
          ...(env.cloudEnv ? { NODE_OPTIONS: "-r ./scripts/local-cloud-dev.js", CLOUD_ENV: env.cloudEnv } : {}),
          ...(env.envFile
            ? { NODE_OPTIONS: "-r dotenv/config", DOTENV_CONFIG_PATH: path.join(__dirname, "..", env.envFile) }
            : {}),
        },
      });
      await spawn("pnpm", ["vite", "preview", "--port", `${env.cloudEnv ? "3001" : "3000"}`], {
        stdio: "inherit",
      });
    } else {
      console.log("\n> pnpm vite\n");
      await spawn("pnpm", ["vite"], {
        stdio: "inherit",
        env: {
          ...process.env,
          ...(env.cloudEnv ? { NODE_OPTIONS: "-r ./scripts/local-cloud-dev.js", CLOUD_ENV: env.cloudEnv } : {}),
          ...(env.envFile
            ? { NODE_OPTIONS: "-r dotenv/config", DOTENV_CONFIG_PATH: path.join(__dirname, "..", env.envFile) }
            : {}),
        },
      });
    }
  } catch (e) {
    if (e.name !== "ExitPromptError") {
      throw e;
    }
  }
}

main();
