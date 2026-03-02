const { spawn } = require("child_process");
const path = require("path");

const args = process.argv.slice(2);
const webDir = path.join(__dirname, "apps", "web");

const child = spawn("npx", ["next", ...args], {
  cwd: webDir,
  stdio: "inherit",
  shell: true,
  env: { ...process.env, DOTENV_CONFIG_PATH: path.join(__dirname, ".env") },
});

child.on("exit", (code) => process.exit(code ?? 0));
