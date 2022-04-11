
// vite.config.js
import { defineConfig } from 'vite'

// 注册链接 https://developer.chrome.com/origintrials/#/trials/active
// const devToken = 'Amu7sW/oEH3ZqF6SQcPOYVpF9KYNHShFxN1GzM5DY0QW6NwGnbe2kE/YyeQdkSD+kZWhmRnUwQT85zvOA5WYfgAAAABJeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjUyODMxOTk5fQ=='
const devToken = 'AjPwILqou86MNqXlfZc0tZycsl9U9sV/uI2ti0RK1/w0kT3/l35O3zugkEb31z1gKbxnakvZahtfWf9h42buSA4AAABJeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJmZWF0dXJlIjoiV2ViR1BVIiwiZXhwaXJ5IjoxNjYzNzE4Mzk5fQ=='

module.exports = defineConfig({
    plugins: [
        {
            name: 'Origin-Trial',
            configureServer: server => {
                server.middlewares.use((_req, res, next) => {
                    res.setHeader("Origin-Trial", devToken)
                    next()
                })
            }
        }
    ]
})