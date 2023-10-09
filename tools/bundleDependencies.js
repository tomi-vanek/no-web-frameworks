import url from 'url'
import path from 'path'
import { promises as fsPromises } from 'fs'

import esbuild from 'esbuild'

// Execute the bundling of NPM dependencies
await bundleDependencies()

// The bundler tool
async function bundleDependencies () {
  const projectRoot = path.resolve(path.join(path.dirname(url.fileURLToPath(import.meta.url)), '..'))
  console.log(projectRoot)

  const packageJsonFilePath = path.join(projectRoot, 'package.json')
  const nodeModulesDir = path.join(projectRoot, 'node_modules')
  const webModulesDir = path.join(projectRoot, 'web_modules')

  startMsg(nodeModulesDir, webModulesDir, packageJsonFilePath)
  await processAllDependencies(nodeModulesDir, webModulesDir, packageJsonFilePath)
}

async function processAllDependencies (dependenciesDir, resultDir, packageJsonFilePath) {
  await createDir(resultDir)
  console.log()

  const packageRaw = await fsPromises.readFile(packageJsonFilePath)
  const packageJson = JSON.parse(packageRaw)
  const dependencies = Object.keys(packageJson.dependencies || {}).sort()

  let counter = 1

  for (const dep of dependencies) {
    const entryDir = path.join(dependenciesDir, dep)
    const targetDirectory = path.join(resultDir, dep)

    const entryPackageRaw = await fsPromises.readFile(path.join(entryDir, 'package.json'))
    const entryPackageJson = JSON.parse(entryPackageRaw)

    const isEsm = entryPackageJson.type === 'module' || !!entryPackageJson.module

    let entryPoint = isEsm ? entryPackageJson.module : entryPackageJson.main

    if (entryPoint) {
      entryPoint = path.join(entryDir, entryPoint)
    } else {
      const indexJs = path.join(entryDir, 'index.js')
      if (await exists(indexJs)) {
        entryPoint = indexJs
      }
    }

    const hasEntryPoint = entryPoint && await exists(entryPoint)

    if (!hasEntryPoint) {
      await fsPromises.cp(entryDir + '/', targetDirectory + '/', { recursive: true })
      console.info(`(${counter++}) "${dep}" copied without any change.`)
    } else {
      const origLog = console.log
      console.log = function () {}
      try {
        const bundle = await esbuild.build({
          entryPoints: [entryPoint],
          outfile: path.join(targetDirectory, 'index.js').toString(),
          platform: 'node',
          bundle: true,
          format: 'esm',
          sourcemap: false
        })

        console.log = origLog
        if (bundle.errors.length) {
          console.warn(`(${counter++}) "${dep}" NOT bundled to ESM - errors in bundling process.`, bundle.errors)
        } else {
          console.info(`(${counter++}) "${dep}" bundled to ESM.`)
          let entryHandled = false
          if (entryPackageJson.exports) {
            const removeStar = text => text.split('/*')[0]
            await Promise.all(
              Object.keys(entryPackageJson.exports).map(async key => {
                const value = entryPackageJson.exports[key]
                if (key.indexOf('*') > -1 && typeof value === 'string') {
                  entryHandled = true
                  const sourceDir = path.join(entryDir, removeStar(value))
                  const destDir = path.join(targetDirectory, removeStar(key))
                  console.log(`      - ${removeStar(value)} --> ${removeStar(key)}`)
                  return await fsPromises.cp(sourceDir + '/', destDir + '/', { recursive: true })
                } else {
                  return `${value} --> ${key} - export not processed, has no star in name.`
                }
              })
            )
          }

          if (!entryHandled) {
            await copySubdirectories(entryDir, targetDirectory)
          }
        }
      } catch (err) {
        console.log = origLog
        console.warn(`(${counter++}) "${dep}" not bundled to ESM. Errors during processing.`, err)
      } finally {
        console.log = origLog
      }
    }
  }
}

async function copySubdirectories (rootDir, targetDir) {
  const subDirs = await getDirectories(rootDir)
  return Promise.all(subDirs.map(async dirName => {
    if (dirName.startsWith('.')) {
      return `${dirName} - name starts with dot - it was skipped.`
    } else {
      const src = path.join(rootDir, dirName)
      const tgt = path.join(targetDir, dirName)
      const alreadyExists = await exists(tgt)
      if (alreadyExists) {
        return dirName
      } else {
        console.log(`      - ${dirName}`)
        return fsPromises.cp(src + '/', tgt + '/', { recursive: true, force: true })
      }
    }
  }))
}

async function getDirectories (source) {
  const content = await fsPromises.readdir(source, { withFileTypes: true })
  return content.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name)
}

function startMsg (sourceDir, resultDir, packageJsonFilePath) {
  const timestamp = new Date().toISOString().split(/[.]/)[0].split(/[TZ]/).join(' ') + ' UTC'
  const msg = [
    timestamp,
    `${path.relative('.', packageJsonFilePath)}: ${path.relative('.', sourceDir)} --> ${path.relative('.', resultDir)}`
  ]
  const line = `-${'~'.repeat(50)}-`
  console.log(`
${line}
${msg.join('\n')}
${line}
`)
}

async function exists (fileName) {
  try {
    await fsPromises.access(fileName)
    return true
  } catch (e) {
    return false
  }
}

async function createDir (dirName) {
  // if exists - delete it
  if (exists(dirName)) {
    try {
      await fsPromises.rm(dirName, { recursive: true, force: true })
      console.log(`Deleted directory ${path.relative('.', dirName)} to clean up previous content.`)
    } catch (err) {
      console.warn(`Error by deleting directory ${dirName}.`, err)
    }
  }

  // now the directory does not exist, so let's create it
  try {
    await fsPromises.mkdir(dirName, { recursive: true, force: true })
    console.log(`Created directory ${path.relative('.', dirName)} for bundled dependencies in ESM standard format.`)
  } catch (err) {
    console.error(`Error by creating directory ${dirName}`)
    console.error(err)
    return Promise.reject(err)
  }
}
