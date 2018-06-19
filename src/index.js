const fs = require('fs')
const Ajv = require('ajv')
const chalk = require('chalk')

const schema = require('./schema')
const ajv = new Ajv()
const validate = ajv.compile(schema)

const jsonFileNames = fs.readdirSync('./bp').sort((a, b) => {
  if (a > b) return -1
  if (b > a) return 1
  return 0
})
const imageFileNames = fs.readdirSync('./images')

const exitWithMsg = (msg) => {
  console.log(chalk.red(msg))
  process.exit(1)
}

const notice = (msg) => {
  console.log(chalk.yellow(msg))
}

jsonFileNames
  .filter(jsonFileName => {
    return jsonFileName !== '$template.json' && jsonFileName.endsWith('.json')
  })
  .forEach(jsonFileName => {
    const content = fs.readFileSync(`./bp/${jsonFileName}`).toString()
    let obj = null
    let parseErr = null

    try {
      obj = JSON.parse(content)
    } catch (e) {
      parseErr = e
    }

    if (parseErr) {
      exitWithMsg(`ERROR! json file name ${jsonFileName} parse error, please check first (maybe has some unnecessary space or comma symbol like ",")`)
    }

    const valid = validate(obj)
    if (!valid) {
      notice(`WARN! json file name ${jsonFileName} didn't parse the schema, the errors just see: ${JSON.stringify(validate.errors)}`)
    }

    if (obj.org && obj.org.branding) {
      ['logo', 'cover'].every(k => {
        const imgName = obj.org.branding[k]
        if (imageFileNames.every(f => f.indexOf(imgName) === -1)) {
          notice(`WARN! ${imgName} not exist`)
        }
      })
    }
  })

