module.exports = {
    apps: [
        {
            name: "frontend",
            script: "pm2",
            args: "serve dist 8080 --spa",
        },
        {
            name: "backend",
            script: "npm",
            args: "run start",
            cwd: "./backend",
        },
    ],
};
