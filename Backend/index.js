const app = require('./src/app')
const { getConnection } = require('./src/config/db')

const port = 8000

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})