const { spawn } = require("child_process");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// ANSI color codes for better logging
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

// Service configurations
const services = [
  {
    name: "API Gateway",
    path: "api-gateway",
    port: 5000,
    color: colors.cyan,
    script: "src/index.js",
  },
  {
    name: "Auth Service",
    path: "services/auth-service",
    port: 3001,
    color: colors.green,
    script: "src/index.js",
  },
  {
    name: "Electricity Service",
    path: "services/electricity-service",
    port: 3002,
    color: colors.blue,
    script: "src/index.js",
  },
  {
    name: "Payment Service",
    path: "services/payment-service",
    port: 3003,
    color: colors.magenta,
    script: "src/index.js",
  },
  {
    name: "Complain Service",
    path: "services/complain-service",
    port: 3004,
    color: colors.red,
    script: "src/index.js",
  },
];

// Store running processes
const runningProcesses = [];

// Graceful shutdown handler
process.on("SIGINT", () => {
  console.log("\n\n🛑 Shutting down all services...\n");
  runningProcesses.forEach((proc) => {
    if (proc && !proc.killed) {
      proc.kill();
    }
  });
  process.exit(0);
});

// Function to start a service
function startService(service) {
  return new Promise((resolve, reject) => {
    const servicePath = path.join(__dirname, service.path);

    console.log(
      `${service.color}${colors.bright}⏳ Starting ${service.name}...${colors.reset}`,
    );

    // Spawn node process for the service
    const proc = spawn("node", [service.script], {
      cwd: servicePath,
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, PORT: service.port },
    });

    runningProcesses.push(proc);

    let started = false;

    // Handle stdout
    proc.stdout.on("data", (data) => {
      const output = data.toString();
      console.log(
        `${service.color}[${service.name}]${colors.reset} ${output.trim()}`,
      );

      // Check if service started successfully
      if (
        !started &&
        (output.includes("running on port") || output.includes("ready"))
      ) {
        started = true;
        console.log(
          `${service.color}${colors.bright}✅ ${service.name} is running on port ${service.port}${colors.reset}\n`,
        );
        resolve();
      }
    });

    // Handle stderr
    proc.stderr.on("data", (data) => {
      const error = data.toString();
      console.error(
        `${service.color}[${service.name} ERROR]${colors.reset} ${error.trim()}`,
      );
    });

    // Handle process exit
    proc.on("exit", (code) => {
      if (code !== 0) {
        console.error(
          `${colors.red}❌ ${service.name} exited with code ${code}${colors.reset}`,
        );
        if (!started) {
          reject(new Error(`${service.name} failed to start`));
        }
      }
    });

    // Handle process error
    proc.on("error", (error) => {
      console.error(
        `${colors.red}❌ Failed to start ${service.name}: ${error.message}${colors.reset}`,
      );
      reject(error);
    });

    // Timeout fallback - assume started after 5 seconds
    setTimeout(() => {
      if (!started) {
        console.log(
          `${service.color}✅ ${service.name} assumed running on port ${service.port}${colors.reset}\n`,
        );
        started = true;
        resolve();
      }
    }, 5000);
  });
}

// Main function to start all services
async function startAllServices() {
  console.log(`
${colors.bright}${colors.cyan}╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║          🚀 SUVIDHA PLATFORM - BACKEND LAUNCHER          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝${colors.reset}
  `);

  console.log(
    `${colors.yellow}📋 Starting ${services.length} services...${colors.reset}\n`,
  );

  try {
    // Start all services sequentially
    for (const service of services) {
      await startService(service);
      // Small delay between services to avoid port conflicts
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log(`
${colors.bright}${colors.green}╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║          ✅ ALL SERVICES RUNNING SUCCESSFULLY!           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝${colors.reset}

${colors.bright}📡 Service Endpoints:${colors.reset}
${colors.cyan}   • API Gateway:         http://localhost:5000${colors.reset}
${colors.green}   • Auth Service:        http://localhost:3001${colors.reset}
${colors.blue}   • Electricity Service:  http://localhost:3002${colors.reset}
${colors.magenta}   • Payment Service:      http://localhost:3003${colors.reset}

${colors.bright}🔗 Access via API Gateway:${colors.reset}
   ${colors.cyan}http://localhost:5000/api/v1/auth
   http://localhost:5000/api/v1/electricity
   http://localhost:5000/api/v1/payment${colors.reset}

${colors.bright}🏥 Health Checks:${colors.reset}
   ${colors.cyan}http://localhost:5000/health
   http://localhost:5000/health/services${colors.reset}

${colors.yellow}💡 Press Ctrl+C to stop all services${colors.reset}
    `);
  } catch (error) {
    console.error(
      `\n${colors.red}❌ Failed to start services: ${error.message}${colors.reset}`,
    );
    console.log(`${colors.yellow}🛑 Shutting down...${colors.reset}`);

    runningProcesses.forEach((proc) => {
      if (proc && !proc.killed) {
        proc.kill();
      }
    });

    process.exit(1);
  }
}

// Start the application
console.log(`${colors.bright}🌟 SUVIDHA Platform Backend${colors.reset}`);
console.log(
  `${colors.bright}📅 ${new Date().toLocaleString()}${colors.reset}\n`,
);

startAllServices().catch((error) => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
