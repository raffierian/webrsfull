module.exports = {
  apps: [
    {
      name: "frontend-dev",
      script: "npm",
      args: ["run", "dev"],
      cwd: "./",
      watch: false, // HMR sudah di-handle Vite
    },
    {
      name: "backend-dev",
      script: "npm",
      args: ["run", "dev"],
      cwd: "./backend",
      watch: false, // nodemon / ts-node-dev yang handle
    },
  ],
};

